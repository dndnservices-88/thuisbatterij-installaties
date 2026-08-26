import {
  bereken,
  TERUGLEVER_ANTWOORDEN,
  type Antwoorden,
  type Contract,
  type Uitkomst,
} from "./calc";

/**
 * Hercontrole van de berekening, server-side.
 *
 * Waarom dit bestaat. De browser stuurt bij elke lead een snapshot mee van wat
 * de bezoeker op zijn scherm zag. Dat snapshot MOET bewaard blijven — dat is
 * claimregister R4, en zonder die opslag kun je bij een klacht niet
 * reconstrueren wat iemand te zien kreeg.
 *
 * Maar een snapshot uit de browser is geen bewijs dat óns systeem dat getal ooit
 * heeft geproduceerd. Iedereen kan een andere JSON naar /api/lead sturen. Wie
 * die getallen vervolgens klakkeloos in een bevestigingsmail zet, stuurt een
 * belofte de deur uit die zijn eigen code nooit heeft berekend — en die belofte
 * staat dan wel zwart-op-wit op briefpapier van de afzender.
 *
 * Dus doen we allebei: het snapshot van de bezoeker gaat onveranderd de opslag
 * in, en daarnaast rekenen we de antwoorden hier opnieuw door. De mail gebruikt
 * uitsluitend de hier berekende uitkomst. Wijken ze af, dan gaat er een vlag mee
 * naar de opslag, zodat je het terugziet in plaats van dat het onopgemerkt
 * blijft.
 */

export type Leadcontrole = {
  /** De antwoorden zoals wij ze uit het snapshot hebben kunnen lezen. */
  antwoorden: Antwoorden | null;
  /** De uitkomst zoals wij hem opnieuw hebben berekend. */
  uitkomst: Uitkomst | null;
  /**
   * true  = onze herberekening komt overeen met wat de browser meldde
   * false = er zit verschil in; de mail gebruikt onze eigen uitkomst
   * null  = er viel niets te vergelijken (geen bruikbaar snapshot)
   */
  komt_overeen: boolean | null;
  /** Korte omschrijving van het verschil, voor in het logboek. */
  opmerking?: string;
};

const CONTRACTEN: Contract[] = ["vast", "dynamisch", "onbekend"];
const HUISHOUDENS = ["1", "2-3", "4-5", "6+"] as const;

function getal(w: unknown, max: number): number | null {
  const n = typeof w === "number" ? w : Number(w);
  if (!isFinite(n) || n < 0 || n > max) return null;
  return n;
}

/**
 * Leest de antwoorden uit het snapshot en accepteert alleen wat de calculator
 * zelf ook had kunnen produceren. Alles wat niet klopt levert null op — dan
 * rekenen we niet en versturen we ook geen getallen.
 */
export function leesAntwoorden(snapshot: unknown): Antwoorden | null {
  if (!snapshot || typeof snapshot !== "object") return null;
  const a = (snapshot as Record<string, unknown>).antwoorden;
  if (!a || typeof a !== "object") return null;
  const o = a as Record<string, unknown>;

  if (!["ja", "nee", "binnenkort"].includes(o.zonnepanelen as string)) return null;
  if (typeof o.eigenaar !== "boolean") return null;
  if (!CONTRACTEN.includes(o.contract as Contract)) return null;

  // Panelen. Bovengrenzen zijn ruim maar eindig: een dak met duizend panelen is
  // geen woning meer, en zonder grens kan één verzonnen getal een besparing van
  // tienduizenden euro's in een bevestigingsmail zetten.
  const p = o.panelen as Record<string, unknown> | undefined;
  if (!p || typeof p !== "object") return null;
  let panelen: Antwoorden["panelen"];
  if (p.soort === "aantal") {
    const n = getal(p.aantal, 200);
    if (n === null) return null;
    panelen = { soort: "aantal", aantal: n };
  } else if (p.soort === "dak_m2") {
    const n = getal(p.m2, 1000);
    if (n === null) return null;
    panelen = { soort: "dak_m2", m2: n };
  } else return null;

  const v = o.verbruik as Record<string, unknown> | undefined;
  if (!v || typeof v !== "object") return null;
  let verbruik: Antwoorden["verbruik"];
  if (v.soort === "kwh") {
    const n = getal(v.kwh, 100000);
    if (n === null) return null;
    verbruik = { soort: "kwh", kwh: n };
  } else if (v.soort === "huishouden" && HUISHOUDENS.includes(v.grootte as never)) {
    verbruik = { soort: "huishouden", grootte: v.grootte as (typeof HUISHOUDENS)[number] };
  } else return null;

  // Terugleverkosten mogen alleen een van de aangeboden bedragen zijn. Een vrij
  // getal hier zou de bezoeker een terugverdientijd laten kiezen.
  const tlk = o.terugleverkosten;
  const terugleverkosten =
    typeof tlk === "number" && [0.109, 0.182].includes(tlk) ? tlk : undefined;

  // Het antwoord op vraag 5 komt uit dezelfde snapshot en verdient dezelfde
  // achterdocht: alleen de vier ids die wij zelf aanbieden komen erdoor. Het
  // stuurt de rekensom niet aan — dat doet het bedrag hierboven — maar het komt
  // wél als zin in de adviseurmail terecht, en een verzonnen waarde zou daar een
  // onzinnig actiepunt van maken.
  const ta = o.terugleverkosten_antwoord;
  const terugleverkosten_antwoord =
    typeof ta === "string" && TERUGLEVER_ANTWOORDEN.includes(ta)
      ? (ta as Antwoorden["terugleverkosten_antwoord"])
      : undefined;

  return {
    zonnepanelen: o.zonnepanelen as Antwoorden["zonnepanelen"],
    panelen,
    verbruik,
    contract: o.contract as Contract,
    eigenaar: o.eigenaar,
    terugleverkosten,
    terugleverkosten_antwoord,
  };
}

export function controleer(snapshot: unknown): Leadcontrole {
  const antwoorden = leesAntwoorden(snapshot);
  if (!antwoorden) {
    return {
      antwoorden: null,
      uitkomst: null,
      komt_overeen: null,
      opmerking: "Geen bruikbaar rekensnapshot meegestuurd.",
    };
  }

  const uitkomst = bereken(antwoorden);

  const gemeld = (snapshot as Record<string, unknown>).uitkomst as Record<string, unknown> | undefined;
  if (!gemeld || typeof gemeld !== "object") {
    return { antwoorden, uitkomst, komt_overeen: null, opmerking: "Geen gemelde uitkomst om mee te vergelijken." };
  }

  if (gemeld.route !== uitkomst.route) {
    return {
      antwoorden,
      uitkomst,
      komt_overeen: false,
      opmerking: `Route wijkt af: browser meldde "${String(gemeld.route)}", herberekening geeft "${uitkomst.route}".`,
    };
  }

  if (uitkomst.route === "huurder" || uitkomst.route === "geen_pv") {
    return { antwoorden, uitkomst, komt_overeen: true };
  }

  const gemeldeBesparing = (gemeld.besparing_eur as Record<string, unknown> | undefined)?.midden;
  if (typeof gemeldeBesparing !== "number") {
    return { antwoorden, uitkomst, komt_overeen: null, opmerking: "Gemelde besparing ontbreekt." };
  }

  // Eén euro speling voor afrondingsverschillen tussen browser en server.
  const verschil = Math.abs(gemeldeBesparing - uitkomst.besparing_eur.midden);
  if (verschil > 1) {
    return {
      antwoorden,
      uitkomst,
      komt_overeen: false,
      opmerking: `Besparing wijkt af: browser meldde € ${gemeldeBesparing}, herberekening geeft € ${uitkomst.besparing_eur.midden}.`,
    };
  }

  return { antwoorden, uitkomst, komt_overeen: true };
}
