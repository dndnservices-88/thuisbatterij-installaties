/**
 * Rekenlogica van de batterijcalculator.
 *
 * Bron: Limsolar_Specificatie_Calculator_16aug2026.md v1.0, sectie 4.
 * Alles hier is een pure functie zonder React, zodat de formule los te testen is
 * en herbruikbaar in een offertetool of e-mail.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * TARIEFCONTROLE: nog niet uitgevoerd. Constanten hieronder zijn voorstellen
 * uit de specificatie, geen door Limsolar bevestigde waarden.
 * Zodra bevestigd: pas CONSTANTEN aan, zet PEILDATUM_TARIEVEN op de datum van
 * bevestiging en verhoog REKENVERSIE. De rekenversie wordt per lead opgeslagen,
 * zodat oude leads reproduceerbaar blijven (claimregister R4).
 * ────────────────────────────────────────────────────────────────────────────
 */

export const REKENVERSIE = "1.0.0";
export const PEILDATUM_TARIEVEN = "nog niet bevestigd";

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
  /** €/kWh leveringstarief. TE BEVESTIGEN door Limsolar, met peildatum. */
  LEVERINGSTARIEF: 0.28,
  /** €/kWh terugleververgoeding. TE BEVESTIGEN. */
  TERUGLEVERVERGOEDING: 0.05,
  /**
   * €/kWh vermeden terugleverkosten. TE BEVESTIGEN; verschilt per leverancier
   * en loopt volgens de specificatie van €0,00 tot €0,12.
   * Default bewust op 0,00 gezet: bij een onbevestigde constante is de
   * conservatieve waarde de enige die claim-technisch verdedigbaar is.
   */
  TERUGLEVERKOSTEN: 0.0,
  /** €/kWh extra waarde bij een dynamisch contract. TE BEVESTIGEN. */
  DYN_MARGE: 0.03,
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

export type Antwoorden = {
  /** Vraag 1 */
  zonnepanelen: "ja" | "nee" | "binnenkort";
  /** Vraag 2 */
  panelen: Panelen;
  /** Vraag 3 */
  verbruik: { soort: "kwh"; kwh: number } | { soort: "huishouden"; grootte: "1" | "2-3" | "4-5" | "6+" };
  /** Vraag 4 */
  contract: Contract;
  /** Vraag 5 — de harde kwalificatievraag */
  eigenaar: boolean;
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

export function waardePerKwh(contract: Contract): number {
  const basis =
    CONSTANTEN.LEVERINGSTARIEF - CONSTANTEN.TERUGLEVERVERGOEDING + CONSTANTEN.TERUGLEVERKOSTEN;
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

  const waarde = waardePerKwh(a.contract);
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

export const getal = (n: number) => new Intl.NumberFormat("nl-NL").format(Math.round(n));

export const jaren = (n: number) =>
  new Intl.NumberFormat("nl-NL", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n);
