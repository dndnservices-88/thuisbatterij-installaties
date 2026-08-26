/**
 * Rekenlogica van de batterijcalculator.
 *
 * Bron: Limsolar_Specificatie_Calculator_16aug2026.md v1.0, sectie 4.
 * Alles hier is een pure functie zonder React, zodat de formule los te testen is
 * en herbruikbaar in een offertetool of e-mail.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * TARIEFCONTROLE: uitgevoerd op 24 augustus 2026 op openbare bronnen, als
 * VOORSTEL aan Limsolar. Nog niet afgetekend — zie TARIEVEN_STATUS.
 * Zodra Limsolar tekent: TARIEVEN_STATUS op "bevestigd", claimregister R2 op
 * "bevestigd", en REKENVERSIE verhogen. De rekenversie wordt per lead
 * opgeslagen, zodat oude leads reproduceerbaar blijven (claimregister R4).
 * ────────────────────────────────────────────────────────────────────────────
 */

export const REKENVERSIE = "1.1.0";
export const PEILDATUM_TARIEVEN = "24 augustus 2026";

/**
 * "voorstel" = door ons opgezocht, nog niet door Limsolar afgetekend.
 * Zolang dit op "voorstel" staat, mag de peildatum niet als feit onder het
 * resultaat verschijnen. Dat wordt afgedwongen via claimregister R2: de
 * disclaimer toont de datum alleen als R2 op "bevestigd" staat.
 */
export const TARIEVEN_STATUS: "voorstel" | "bevestigd" = "voorstel";

/**
 * Waar de voorgestelde waarden vandaan komen. Staat hier en niet in een los
 * document, omdat een constante zonder herkomst over drie maanden niemand meer
 * kan navertellen — en dat is precies wanneer de ACM het vraagt.
 */
export const TARIEFBRONNEN = [
  "Leveringstarief: gemiddelde all-in kWh-prijs vaste en variabele contracten, juni 2026 € 0,263, bandbreedte 21 aug 2026 € 0,238–0,316 (energievergelijk.nl). Wij rekenen met € 0,26, dus onder het midden van de bandbreedte.",
  "Terugleververgoeding: € 0,01–0,165 per leverancier, gemiddeld € 0,04–0,09 (energievergelijk.nl, overstappen.nl, aug 2026). Wij rekenen met € 0,07, dus aan de hoge kant van het gemiddelde.",
  "Terugleverkosten: € 0,109 (laagste, Budget Energie) tot € 0,182 (hoogste, Eneco) bij vaste contracten in 2026; veel leveranciers rekenen niets. Standaard € 0,00 omdat wij niet vragen wie de leverancier is.",
  "Dynamische marge: gerealiseerde spread € 0,15–0,25 per kWh bij actief gestuurde handel (slimster.nl, aug 2026). Wij rekenen met € 0,05, omdat actieve sturing een aparte dienst is die Limsolar nog niet toezegt.",
] as const;

export const CONSTANTEN = {
  /** kWh per paneel per jaar. Conservatief; de geleverde site rekende met 400. */
  OPBRENGST_PER_PANEEL: 380,
  /** Aandeel opwek dat zonder batterij direct wordt verbruikt. Brandbook: "ongeveer 35%". */
  ZELFVERBRUIK_ZONDER_BATTERIJ: 0.35,
  /** Volledige laadcycli per jaar, realistisch voor Nederland. */
  CYCLI_PER_JAAR: 250,
  /** Bruikbare fractie van de nominale capaciteit (ontlaaddiepte). */
  BRUIKBARE_FRACTIE: 0.9,
  /** Retourrendement laden/ontladen. */
  RENDEMENT: 0.9,
  /**
   * Iedere constante hieronder is bewust de kant op gezet die de uitkomst
   * SLECHTER maakt, niet beter. Waarde per opgeslagen kWh is
   * leveringstarief − terugleververgoeding + terugleverkosten, dus:
   * leveringstarief laag inschatten, terugleververgoeding hoog inschatten.
   * Wie het omgekeerd doet, verkoopt een rekensom in plaats van een advies.
   */

  /** €/kWh all-in leveringstarief. Onder het midden van de marktbandbreedte. */
  LEVERINGSTARIEF: 0.26,
  /** €/kWh terugleververgoeding. Aan de hoge kant van het gemiddelde. */
  TERUGLEVERVERGOEDING: 0.07,
  /**
   * €/kWh vermeden terugleverkosten. Standaard 0,00 en dat blijft zo.
   *
   * In 2026 rekent een deel van de leveranciers € 0,109 tot € 0,182 per
   * teruggeleverde kWh, en juist die kosten vermijd je met een batterij. Het is
   * verreweg de grootste post in de hele som. Maar de calculator vraagt niet
   * wie je leverancier is, dus dit meerekenen zou een bewering zijn over een
   * contract dat wij niet kennen. De bezoeker kan het zelf aanzetten op het
   * resultaatscherm — dan is het zíjn invoer en niet onze claim.
   */
  TERUGLEVERKOSTEN: 0.0,
  /**
   * €/kWh extra waarde bij een dynamisch contract. Bewust laag: de spread van
   * € 0,15–0,25 die je overal leest, geldt bij actief gestuurde handel op de
   * day-ahead- of onbalansmarkt. Dat is een aparte dienst met eigen software,
   * en zolang Limsolar die niet levert, mag hij niet in deze som zitten.
   */
  DYN_MARGE: 0.05,
  /** Vaste spreiding rond elke uitkomst. Resultaat wordt NOOIT als één getal getoond. */
  BANDBREEDTE_ONDER: 0.8,
  BANDBREEDTE_BOVEN: 1.2,
  /** Terugverdientijd (jaren) waarboven we eerlijk adviseren om het niet te doen. */
  GRENS_NIET_RENDABEL: 12,
  /** Schatting jaarverbruik per huishoudgrootte, voor "weet ik niet". */
  VERBRUIK_PER_HUISHOUDEN: { "1": 1800, "2-3": 3000, "4-5": 4300, "6+": 5500 },
  /** Schatting aantal panelen op basis van dakoppervlak in m². */
  PANEEL_PER_M2: 0.5,
} as const;

/**
 * Assortiment. De calculator mag NOOIT een capaciteit adviseren die niet als
 * product met bekende prijs bestaat — dat is exact de fout waardoor de geleverde
 * site op 13,0 jaar uitkwam (specificatie 4.3).
 *
 * Middenklasse en premium ontbreken bewust: hun prijzen zijn nog niet bekend
 * (claimregister P3). Zodra ze er zijn, hier toevoegen — verder hoeft er niets
 * te veranderen.
 */
export type Product = {
  id: string;
  naam: string;
  capaciteit_kwh: number;
  prijs_eur: number;
  /** Claimregister-status van de prijs. Alleen 'bevestigd' hoort live te staan. */
  prijs_status: "bevestigd" | "toegezegd" | "open";
};

export const ASSORTIMENT: Product[] = [
  {
    id: "marstek-venus-e-3-0",
    naam: "Marstek Venus E 3.0",
    capaciteit_kwh: 10.24,
    prijs_eur: 3999,
    prijs_status: "toegezegd", // claimregister P2
  },
];

export type Panelen = { soort: "aantal"; aantal: number } | { soort: "dak_m2"; m2: number };
export type Contract = "vast" | "dynamisch" | "onbekend";

/**
 * De keuzes die de bezoeker zelf kan maken voor terugleverkosten.
 *
 * De bedragen zijn de werkelijke uitersten in de markt van 2026: Budget Energie
 * rekent het laagste tarief, Eneco het hoogste. Een deel van de leveranciers
 * rekent niets, en dat is bewust de standaard.
 *
 * Dit staat hier als expliciete lijst en niet als vrij invoerveld, omdat een
 * vrij veld uitnodigt tot het invullen van een fantasiebedrag — en dan staat er
 * een terugverdientijd op het scherm die nergens op slaat.
 *
 * "Weet ik niet" hoort er sinds 26 augustus 2026 bij, omdat dit sindsdien een
 * echte vraag is in plaats van een schakelaar achteraf. Een verplichte vraag
 * zonder uitweg voor wie het antwoord niet weet, is een doodlopende weg: dan
 * gokt iemand, en een gegokt tarief is erger dan geen tarief. Het rekent op nul,
 * dus precies zo voorzichtig als wanneer er niets was ingevuld — maar het staat
 * wél apart in de snapshot, zodat de adviseur het verschil ziet tussen "betaalt
 * niets" en "weet het niet".
 */
export const TERUGLEVERKOSTEN_OPTIES = [
  {
    id: "geen",
    waarde: 0.0,
    label: "Ik betaal niets",
    onder: "Geldt bij een deel van de leveranciers",
  },
  { id: "laag", waarde: 0.109, label: "€ 0,109 per kWh", onder: "Laagste tarief in de markt, 2026" },
  { id: "hoog", waarde: 0.182, label: "€ 0,182 per kWh", onder: "Hoogste tarief in de markt, 2026" },
  {
    id: "weet_niet",
    waarde: 0.0,
    label: "Weet ik niet",
    onder: "Dan rekenen we zonder — de voorzichtige kant",
  },
] as const;

export type TerugleverAntwoord = (typeof TERUGLEVERKOSTEN_OPTIES)[number]["id"];

export const TERUGLEVER_ANTWOORDEN = TERUGLEVERKOSTEN_OPTIES.map((o) => o.id) as readonly string[];

/**
 * Het tarief dat bij een antwoord hoort. Eén functie, zodat het bedrag en het
 * antwoord nooit uit elkaar kunnen lopen: er is geen plek waar iemand een tarief
 * kan zetten zonder het bijbehorende antwoord.
 */
export function tariefVoorAntwoord(antwoord: TerugleverAntwoord | undefined): number | undefined {
  if (!antwoord) return undefined;
  const optie = TERUGLEVERKOSTEN_OPTIES.find((o) => o.id === antwoord);
  return optie && optie.waarde > 0 ? optie.waarde : undefined;
}

export type Antwoorden = {
  /** Vraag 1 */
  zonnepanelen: "ja" | "nee" | "binnenkort";
  /** Vraag 2 */
  panelen: Panelen;
  /** Vraag 3 */
  verbruik: { soort: "kwh"; kwh: number } | { soort: "huishouden"; grootte: "1" | "2-3" | "4-5" | "6+" };
  /** Vraag 4 */
  contract: Contract;
  /** Vraag 6 — de harde kwalificatievraag */
  eigenaar: boolean;
  /**
   * Vraag 5. Het bedrag waarmee gerekend is.
   *
   * Stond tot 26 augustus 2026 niet in de vragenreeks maar als schakelaar ónder
   * het resultaat. Dat was verkeerd om: bij de standaard van nul valt een
   * doorsnee tweepersoonshuishouden over de grens GRENS_NIET_RENDABEL heen en
   * krijgt het afwijzingsscherm te zien. Zet dezelfde bezoeker het tarief aan,
   * dan halveert de terugverdientijd en is het een gewone lead. De aanname
   * bepaalde dus niet alleen het getal maar ook wélk scherm iemand kreeg, en
   * dat is te veel gewicht voor iets wat we nooit gevraagd hadden.
   *
   * Staat hier tussen de antwoorden en niet als los argument van bereken(),
   * omdat het formulier het hele antwoordobject als snapshot meestuurt. Zo ligt
   * automatisch vast dát de bezoeker dit zelf heeft opgegeven en op welk bedrag —
   * en dat is precies het verschil tussen zijn aanname en onze claim.
   * Ongedefinieerd = de conservatieve standaard uit CONSTANTEN.
   */
  terugleverkosten?: number;
  /**
   * Vraag 5, maar dan het antwoord zelf in plaats van het bedrag.
   *
   * Nodig omdat "ik betaal niets" en "weet ik niet" allebei op nul rekenen en
   * dus niet uit het bedrag zijn af te leiden. Voor de rekensom maakt het geen
   * verschil, voor het telefoongesprek alles: bij "weet ik niet" is er iets na
   * te trekken en kan de uitkomst nog gunstiger worden, bij "ik betaal niets"
   * niet. Die zin staat in de adviseurmail.
   */
  terugleverkosten_antwoord?: TerugleverAntwoord;
};

export type Band = { min: number; max: number; midden: number };

export type Uitkomst =
  | { route: "huurder" }
  | { route: "geen_pv" }
  | ({ route: "niet_rendabel" | "lead" } & Berekening);

export type Berekening = {
  opwek_kwh: number;
  direct_verbruik_kwh: number;
  overschot_kwh: number;
  avondbehoefte_kwh: number;
  opslagpotentieel_kwh: number;
  extra_zelfverbruik_kwh: Band;
  besparing_eur: Band;
  terugverdientijd_jaar: Band;
  waarde_per_kwh: number;
  /**
   * De terugleverkosten waarmee gerekend is. Apart opgeslagen naast
   * waarde_per_kwh, zodat de adviseur vóór het telefoontje ziet of de bezoeker
   * de schakelaar heeft aangezet. Staat hier 0,00 en klopt dat niet met het
   * contract van de klant, dan valt de terugverdientijd in het gesprek gunstiger
   * uit — dat is de goede kant om je te vergissen.
   */
  terugleverkosten_eur: number;
  /**
   * Het antwoord dat bij dat bedrag hoort. Reist mee tot in de adviseurmail,
   * want nul euro met "weet ik niet" erachter is een actiepunt en nul euro met
   * "ik betaal niets" erachter niet.
   */
  terugleverkosten_antwoord?: TerugleverAntwoord;
  product: Product;
  /** true als het opslagpotentieel groter is dan het grootste product met bekende prijs */
  product_is_begrensd: boolean;
  jaarverbruik_kwh: number;
  aantal_panelen: number;
  rekenversie: string;
  constanten: typeof CONSTANTEN;
};

const rond = (n: number, d = 0) => Math.round(n * 10 ** d) / 10 ** d;

function band(waarde: number, decimalen = 0): Band {
  return {
    min: rond(waarde * CONSTANTEN.BANDBREEDTE_ONDER, decimalen),
    midden: rond(waarde, decimalen),
    max: rond(waarde * CONSTANTEN.BANDBREEDTE_BOVEN, decimalen),
  };
}

export function aantalPanelen(p: Panelen): number {
  return p.soort === "aantal" ? p.aantal : Math.round(p.m2 * CONSTANTEN.PANEEL_PER_M2);
}

export function jaarverbruik(v: Antwoorden["verbruik"]): number {
  return v.soort === "kwh" ? v.kwh : CONSTANTEN.VERBRUIK_PER_HUISHOUDEN[v.grootte];
}

/**
 * Waarde van één opgeslagen kWh.
 *
 * terugleverkosten is optioneel en wordt alleen ingevuld als de bezoeker het op
 * het resultaatscherm zelf heeft aangezet. Negatieve waarden worden genegeerd:
 * de som mag nooit slechter worden dan de conservatieve standaard door invoer
 * die niet klopt.
 */
export function waardePerKwh(contract: Contract, terugleverkosten?: number): number {
  const tlk =
    typeof terugleverkosten === "number" && isFinite(terugleverkosten) && terugleverkosten > 0
      ? terugleverkosten
      : CONSTANTEN.TERUGLEVERKOSTEN;
  const basis = CONSTANTEN.LEVERINGSTARIEF - CONSTANTEN.TERUGLEVERVERGOEDING + tlk;
  return contract === "dynamisch" ? basis + CONSTANTEN.DYN_MARGE : basis;
}

/** Doorzet van een product in kWh per jaar: capaciteit × bruikbare fractie × cycli. */
export function doorzet(p: Product): number {
  return p.capaciteit_kwh * CONSTANTEN.BRUIKBARE_FRACTIE * CONSTANTEN.CYCLI_PER_JAAR;
}

/**
 * Kleinste product waarvan de doorzet het opslagpotentieel dekt.
 * Bestaat dat niet, dan adviseren we het grootste product met een bekende prijs
 * en markeren we dat als begrensd — liever te klein adviseren dan een prijs
 * verzinnen. Het brandbook zegt dat ook: vaker naar beneden dan naar boven.
 */
export function kiesProduct(opslagpotentieel: number): { product: Product; begrensd: boolean } {
  const gesorteerd = [...ASSORTIMENT].sort((a, b) => a.capaciteit_kwh - b.capaciteit_kwh);
  const passend = gesorteerd.find((p) => doorzet(p) >= opslagpotentieel);
  if (passend) return { product: passend, begrensd: false };
  return { product: gesorteerd[gesorteerd.length - 1], begrensd: true };
}

export function bereken(a: Antwoorden): Uitkomst {
  // Vraag 5 — harde kwalificatie. Huurders mogen geen batterij plaatsen.
  if (!a.eigenaar) return { route: "huurder" };
  // Vraag 1 — zonder opwek klopt de rekenroute niet meer.
  if (a.zonnepanelen === "nee") return { route: "geen_pv" };

  const panelen = aantalPanelen(a.panelen);
  const verbruik = jaarverbruik(a.verbruik);

  const opwek = panelen * CONSTANTEN.OPBRENGST_PER_PANEEL;
  const direct = opwek * CONSTANTEN.ZELFVERBRUIK_ZONDER_BATTERIJ;
  const overschot = Math.max(0, opwek - direct);
  const avondbehoefte = Math.max(0, verbruik - direct);
  // Dubbele begrenzing: overschot én werkelijke avondbehoefte. Alleen naar het
  // overschot kijken adviseert stelselmatig te grote systemen.
  const opslagpotentieel = Math.min(overschot, avondbehoefte);

  const { product, begrensd } = kiesProduct(opslagpotentieel);
  const opslagWerkelijk = Math.min(opslagpotentieel, doorzet(product)) * CONSTANTEN.RENDEMENT;

  const waarde = waardePerKwh(a.contract, a.terugleverkosten);
  const besparing = opslagWerkelijk * waarde;

  const besparingBand = band(besparing);
  // Terugverdientijd draait om: hoge besparing = korte tijd.
  const tvt: Band = {
    min: besparingBand.max > 0 ? rond(product.prijs_eur / besparingBand.max, 1) : Infinity,
    midden: besparingBand.midden > 0 ? rond(product.prijs_eur / besparingBand.midden, 1) : Infinity,
    max: besparingBand.min > 0 ? rond(product.prijs_eur / besparingBand.min, 1) : Infinity,
  };

  const berekening: Berekening = {
    opwek_kwh: rond(opwek),
    direct_verbruik_kwh: rond(direct),
    overschot_kwh: rond(overschot),
    avondbehoefte_kwh: rond(avondbehoefte),
    opslagpotentieel_kwh: rond(opslagpotentieel),
    extra_zelfverbruik_kwh: band(opslagWerkelijk),
    besparing_eur: besparingBand,
    terugverdientijd_jaar: tvt,
    waarde_per_kwh: rond(waarde, 3),
    terugleverkosten_antwoord: a.terugleverkosten_antwoord,
    terugleverkosten_eur:
      typeof a.terugleverkosten === "number" && a.terugleverkosten > 0
        ? a.terugleverkosten
        : CONSTANTEN.TERUGLEVERKOSTEN,
    product,
    product_is_begrensd: begrensd,
    jaarverbruik_kwh: verbruik,
    aantal_panelen: panelen,
    rekenversie: REKENVERSIE,
    constanten: CONSTANTEN,
  };

  if (!isFinite(tvt.midden) || tvt.midden > CONSTANTEN.GRENS_NIET_RENDABEL) {
    return { route: "niet_rendabel", ...berekening };
  }
  return { route: "lead", ...berekening };
}

export const euro = (n: number) =>
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

/**
 * Bedragen kleiner dan een euro, met drie decimalen: kWh-tarieven dus.
 *
 * Dit bestaat omdat euro() bewust afrondt op hele euro's — prima voor een
 * besparing van € 383, dodelijk voor een terugleverkostentarief. euro(0,109)
 * geeft "€ 0", en die "€ 0" belandde in een bevestigingsmail waarin de
 * terugverdientijd wél mét die 10,9 cent was doorgerekend. De klant leest dan
 * dat hij niets betaalt bij een som die aanneemt dat hij dat wel doet.
 *
 * Drie decimalen en niet twee: leveranciers publiceren deze tarieven zelf in
 * tienden van centen (€ 0,109), en afronden naar € 0,11 maakt van hun tarief
 * ons tarief.
 */
export const centen = (n: number) =>
  new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(n);

export const getal = (n: number) => new Intl.NumberFormat("nl-NL").format(Math.round(n));

export const jaren = (n: number) =>
  new Intl.NumberFormat("nl-NL", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n);
