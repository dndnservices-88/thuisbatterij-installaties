/**
 * Uitkomstregistratie — de terugkoppelingsloop naar Google Ads.
 *
 * Een lead is niet het einde van de keten maar het begin. Wat Google moet leren
 * is niet welke zoekterm formulieren oplevert, maar welke zoekterm sales
 * oplevert. Daarvoor moet het resultaat terug naar de klik die de lead ooit
 * bracht, en die verbinding is het klik-ID uit lib/klikids.ts.
 *
 * ── Waarom dit hier staat en niet in het CRM ────────────────────────────────
 *
 * Bij thuisbatterij is de keten doorgeknipt op de duurste plek: de sale valt
 * bij Limsolar, aan de keukentafel van hun verkoper. Wij bezitten alleen de
 * eerste twee uitkomsten — de A/B/C-score uit de validatiecall en de geboekte
 * afspraak. Die twee kunnen we vanaf dag één zelf vastleggen, en dat moet ook:
 * een klik-ID dat niet aan een uitkomst gekoppeld is, is over negentig dagen
 * niets meer waard. Terugwerkende kracht bestaat hier niet.
 *
 * Dit bestand kent het CRM niet. Het valideert, geeft een uitkomst zijn vaste
 * waarde en maakt er een regel van in precies de vorm die Google's importer
 * verwacht. Waar die regel heen gaat is een instelling, geen ontwerp.
 *
 * ── Waarom vaste waarden en geen orderwaarde ────────────────────────────────
 *
 * Onze vergoeding is een vast bedrag per sale. Eén sale van €4.000 levert ons
 * evenveel op als één van €12.000, dus orderwaarde importeren zou het
 * algoritme naar de marge van iemand anders laten sturen. De waarde varieert
 * hier tussen uitkomsten, niet binnen een uitkomst.
 *
 * Zodra de fee meebeweegt met orderwaarde verandert dat, en dan is dit het
 * bestand dat aangepast moet worden — niet een instelling in Google Ads.
 */

/** Verhoog dit bij elke wijziging in WAARDEN of CONVERSIENAAM. */
export const UITKOMSTVERSIE = "1.0";

/**
 * De uitkomsten die we registreren, in volgorde van de keten.
 *
 * Niet elke uitkomst gaat naar Google. `niet_bereikbaar` en `geen_sale` blijven
 * bewust binnen: Google kent geen negatieve conversie, en een conversie met
 * waarde nul verstoort de biedingen. Ze staan er wel in, omdat je ze nodig hebt
 * om je eigen ratio's te kennen — kosten per afspraak zeggen niets zonder het
 * aantal leads dat je nooit aan de lijn kreeg.
 */
export const UITKOMSTEN = [
  "niet_bereikbaar",
  "score_c",
  "score_b",
  "score_a",
  "afspraak_geboekt",
  "afspraak_nagekomen",
  "geen_sale",
  "sale",
] as const;

export type Uitkomst = (typeof UITKOMSTEN)[number];

/**
 * Twee conversieacties in Google Ads, met een vaste waarde elk. De waarden zijn
 * geen euro's die iemand ontvangt maar een rangorde: de sale is het einddoel,
 * de afspraak is de beste voorspeller die we eerder in de keten hebben.
 *
 * De bedragen zijn de ondergrens van de fee (€350) maal een geschatte kans dat
 * deze stap tot een sale leidt. Die kans is [AANNAME] zolang er geen historie
 * is; de markering blijft staan tot er echte data is. Met terugkoppeling per
 * afspraak weten we de werkelijke ratio binnen zes tot acht weken.
 *
 *   afspraak_geboekt  €350 × 0,40 = €140
 *   sale              €350 × 1,00 = €350
 *
 * ── Waarom twee en niet vijf ────────────────────────────────────────────────
 *
 * We meten veel meer dan dit. Niet bereikbaar, A/B/C, nagekomen, geen sale —
 * dat gaat allemaal het CRM in, want zonder het aantal leads dat je nooit aan
 * de lijn kreeg zeggen je kosten per afspraak niets.
 *
 * Maar meten en terugkoppelen zijn twee verschillende dingen. Google heeft als
 * richtlijn zo'n dertig conversies per maand per actie nodig voordat een
 * biedstrategie op dat signaal kan leunen. Bij startvolume betekent elke extra
 * actie dat je datzelfde volume over meer signalen verdeelt en er geen enkele
 * de drempel haalt. Beperkend is dus niet wat je kunt meten maar hoeveel er
 * binnenkomt.
 *
 * Een derde actie voor de A-score aanzetten is één regel hieronder erbij, plus
 * de conversieactie aanmaken in Google Ads. Doe dat pas als afspraak_geboekt de
 * dertig per maand ruim haalt.
 */
export const CONVERSIENAAM: Partial<Record<Uitkomst, string>> = {
  afspraak_geboekt: "TBI Afspraak geboekt",
  sale: "TBI Sale",
};

export const WAARDEN: Partial<Record<Uitkomst, number>> = {
  afspraak_geboekt: 140,
  sale: 350,
};

export const VALUTA = "EUR";

export type Uitkomstmelding = {
  lead_id: string;
  uitkomst: Uitkomst;
  /** Wanneer de uitkomst plaatsvond, niet wanneer hij werd ingevoerd. */
  tijdstip: string;
  /** Vrije notitie van de setter. Gaat nooit mee naar Google. */
  toelichting?: string;
  /** Alleen bij een sale, en alleen voor onze eigen rapportage. */
  orderwaarde?: number;
  /** Wie het invoerde. Nodig om een foute invoer terug te kunnen vinden. */
  door?: string;
  versie: string;
  ontvangen: string;
};

export type Controle =
  | { ok: true; melding: Uitkomstmelding }
  | { ok: false; fout: string };

function tekst(w: unknown, max: number): string {
  return typeof w === "string" ? w.trim().slice(0, max) : "";
}

export function isUitkomst(w: unknown): w is Uitkomst {
  return typeof w === "string" && (UITKOMSTEN as readonly string[]).includes(w);
}

/**
 * Valideer wat er binnenkomt. Streng, want dit endpoint schrijft commerciële
 * waarheid: een verkeerd getypte uitkomst stuurt het biedalgoritme maandenlang
 * de verkeerde kant op en je ziet het pas als de kosten per sale al opgelopen
 * zijn.
 */
export function controleerMelding(body: unknown, nu = new Date()): Controle {
  if (typeof body !== "object" || body === null) {
    return { ok: false, fout: "Geen object ontvangen" };
  }
  const b = body as Record<string, unknown>;

  const lead_id = tekst(b.lead_id, 100);
  if (!lead_id) return { ok: false, fout: "lead_id ontbreekt" };

  if (!isUitkomst(b.uitkomst)) {
    return { ok: false, fout: `uitkomst moet één van: ${UITKOMSTEN.join(", ")}` };
  }

  // Tijdstip mag ontbreken — dan is het nu. Maar een meegegeven tijdstip moet
  // een geldige datum zijn en niet in de toekomst liggen: Google weigert
  // toekomstige conversietijden, en dan faalt de import op een regel waar
  // verder niets mis mee is.
  let tijdstip = nu;
  if (b.tijdstip !== undefined && b.tijdstip !== null && b.tijdstip !== "") {
    const d = new Date(tekst(b.tijdstip, 40));
    if (Number.isNaN(d.getTime())) return { ok: false, fout: "tijdstip is geen geldige datum" };
    if (d.getTime() > nu.getTime() + 60_000) {
      return { ok: false, fout: "tijdstip ligt in de toekomst" };
    }
    tijdstip = d;
  }

  let orderwaarde: number | undefined;
  if (b.orderwaarde !== undefined && b.orderwaarde !== null && b.orderwaarde !== "") {
    const n = Number(b.orderwaarde);
    if (!Number.isFinite(n) || n < 0) return { ok: false, fout: "orderwaarde is geen bedrag" };
    orderwaarde = n;
  }

  return {
    ok: true,
    melding: {
      lead_id,
      uitkomst: b.uitkomst,
      tijdstip: tijdstip.toISOString(),
      ...(tekst(b.toelichting, 500) ? { toelichting: tekst(b.toelichting, 500) } : {}),
      ...(orderwaarde !== undefined ? { orderwaarde } : {}),
      ...(tekst(b.door, 60) ? { door: tekst(b.door, 60) } : {}),
      versie: UITKOMSTVERSIE,
      ontvangen: nu.toISOString(),
    },
  };
}

/**
 * Tijdstempel in het enige formaat dat Google's importer accepteert wanneer er
 * `Parameters:TimeZone=Europe/Amsterdam` boven de sheet staat.
 *
 * Google accepteert `2026-08-25 12:00:00` en `2026-08-25 12:00:00+0200`, maar
 * weigert `2026-08-25 12:00:00+02:00`. De dubbele punt in de offset breekt het.
 * Daarom geen toISOString-afgeleide hier: die zet er juist wél een dubbele punt
 * in, en de fout die je terugkrijgt gaat niet over de dubbele punt.
 *
 * Zomertijd wordt door Intl afgehandeld, dus dit klopt ook in de nacht van de
 * overgang — het moment waarop een handgeschreven offset stilletjes een uur
 * verschuift.
 */
export function sheetTijd(datum: Date | string, tijdzone = "Europe/Amsterdam"): string {
  const d = typeof datum === "string" ? new Date(datum) : datum;
  if (Number.isNaN(d.getTime())) throw new Error("sheetTijd kreeg een ongeldige datum");

  const delen = new Intl.DateTimeFormat("nl-NL", {
    timeZone: tijdzone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const p = (soort: string) => delen.find((x) => x.type === soort)?.value ?? "00";
  // Intl geeft in sommige Node-versies "24" terug voor middernacht.
  const uur = p("hour") === "24" ? "00" : p("hour");

  return `${p("year")}-${p("month")}-${p("day")} ${uur}:${p("minute")}:${p("second")}`;
}

export type Sheetregel = {
  klik_id: string;
  conversienaam: string;
  conversietijd: string;
  waarde: number;
  valuta: string;
};

export type Attributie = Record<string, string | undefined>;

export type RegelUitkomst =
  | { regel: Sheetregel }
  | { regel: null; reden: string };

/**
 * Zet een uitkomst om in de regel die in de importsheet hoort.
 *
 * Drie redenen waarom er géén regel komt, en alle drie zijn normaal:
 *
 *  1. De uitkomst hoort niet bij een conversieactie. Een lead die niet
 *     bereikbaar was is echte informatie, maar Google kent geen negatieve
 *     conversie.
 *  2. Er is geen gclid. Telefonisch binnengekomen, organisch, mond-tot-mond —
 *     die uitkomst hangt aan geen enkele advertentieklik.
 *  3. Er is wél een gbraid of wbraid maar geen gclid. Dat zijn klik-ID's van
 *     verkeer waar Google geen gclid kan zetten. Ze horen NIET in de kolom
 *     Google Click ID: die upload wordt geweigerd, of erger, geaccepteerd en
 *     nooit toegewezen. Daarvoor bestaat een aparte import. Vandaar dat we hier
 *     de reden teruggeven in plaats van stil niets te doen — anders zie je pas
 *     over maanden dat een deel van je conversies nooit is aangekomen.
 */
export function conversieregel(
  uitkomst: Uitkomst,
  tijdstip: Date | string,
  attributie: Attributie
): RegelUitkomst {
  const naam = CONVERSIENAAM[uitkomst];
  const waarde = WAARDEN[uitkomst];
  if (!naam || waarde === undefined) {
    return { regel: null, reden: `${uitkomst} heeft geen conversieactie in Google Ads` };
  }

  const gclid = (attributie.gclid ?? "").trim();
  if (!gclid) {
    const anders = ["gbraid", "wbraid"].filter((k) => (attributie[k] ?? "").trim());
    if (anders.length) {
      return {
        regel: null,
        reden: `geen gclid, wel ${anders.join(" en ")} — hoort in de aparte ${anders[0]}-import`,
      };
    }
    return { regel: null, reden: "geen klik-ID; deze lead kwam niet via een advertentieklik" };
  }

  return {
    regel: {
      klik_id: gclid,
      conversienaam: naam,
      conversietijd: sheetTijd(tijdstip),
      waarde,
      valuta: VALUTA,
    },
  };
}

/** De vijf kolommen uit Google's officiële template, in de vaste volgorde. */
export const SHEETKOPPEN = [
  "Google Click ID",
  "Conversion Name",
  "Conversion Time",
  "Conversion Value",
  "Conversion Currency",
] as const;

export function alsSheetrij(r: Sheetregel): string[] {
  return [r.klik_id, r.conversienaam, r.conversietijd, String(r.waarde), r.valuta];
}
