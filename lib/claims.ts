/**
 * Spiegel van Limsolar_Claimregister_en_Publicatiecheck_16aug2026.md.
 *
 * Waarom dit in code staat: de <Claim>-component leest hier de status uit.
 * Zolang NEXT_PUBLIC_LIVE niet op "true" staat, wordt een onbevestigde claim
 * zichtbaar gemarkeerd zodat je hem in de preview meteen ziet. Staat de site
 * wél live, dan wordt een onbevestigde claim NIET gerenderd.
 *
 * Dat is opzet: je kunt met deze code geen onbevestigde claim publiceren,
 * ook niet per ongeluk. Wil je hem tonen, dan zet je hem hier op "bevestigd"
 * — en dat doe je pas nadat Limsolar het register heeft afgetekend en het
 * bewijsstuk in 06 - Legal & Compliance/Bewijs/ staat.
 */

import { GOOGLE_PROFIEL } from "./site";

export type ClaimStatus = "bevestigd" | "toegezegd" | "open" | "verboden";

export type ClaimRegel = {
  /** Regelnummer uit het claimregister */
  id: string;
  /** De enige toegestane formulering. Letterlijk overnemen, niet parafraseren. */
  tekst: string;
  status: ClaimStatus;
  /** Wat er moet gebeuren voordat dit op "bevestigd" mag */
  nodig?: string;
};

export const CLAIMS = {
  // ── Prijs- en aanbodclaims ────────────────────────────────────────────────
  P1: {
    id: "P1",
    tekst: "Laagsteprijsgarantie op een aantoonbaar vergelijkbare complete installatie",
    status: "verboden",
    nodig: "Bestaat niet (Dieudonné, 6 okt 2026). Een garantie noemen die er niet is, is misleidend.",
  },
  P2: {
    // Op "bevestigd" gezet op besluit van Dieudonné, 7 okt 2026 ("prijzen kunnen
    // live"). Bewijsstuk: prijslijst 9 sep 2026 in Bewijs/. Aftekening Limsolar ontbreekt nog.
    id: "P2",
    // 13 okt 2026: de € 5.808 geldt alleen bij een 1-fase-aansluiting (Marstek);
    // 3-fase begint bij Dyness 10 kWh, € 5.950 excl. = € 7.200 incl.
    // 13 nov 2026 (prikbord r. 41, besluit D.): afgerond op …99, was € 5.808 / € 7.200.
    // Akkoord Limsolar volgens D.; opnieuw aftekenen via JURIDISCH.
    tekst: "Instapmodel van 10 kWh inclusief installatie vanaf € 5.799 (1-fase) of € 7.199 (3-fase)",
    status: "bevestigd",
    nodig: "Aftekening Limsolar (aftekenpakket 13 okt 2026). Bewijsstuk: prijslijst met fase, 13 okt 2026, in Bewijs/.",
  },
  P9: {
    // 13 nov 2026, besluit Dieudonné: in de banner alleen de goedkoopste variant
    // (variant D). Onderdeel van P2 (zelfde bron, zelfde bedrag); de 3-fase-prijs
    // staat op /aanbod. Fase blijft erbij (Principes §4a punt 2).
    id: "P9",
    tekst: "Instapmodel van 10 kWh voor een 1-fase-aansluiting, inclusief btw en installatie",
    status: "bevestigd",
    nodig: "Valt onder de aftekening van P2.",
  },
  P8: {
    // 13 nov 2026, besluit Dieudonné ("prijs vooraan", compleet aanbod op /aanbod).
    // Bron: prijslijst Limsolar met fase, 13 okt 2026 (Bewijs/), × 1,21 btw.
    // Geen merknamen (P6). Aftekening Limsolar ontbreekt — prikbord r. 40.
    id: "P8",
    tekst: "Vanaf-prijzen per type en capaciteit, inclusief 21% btw en installatie door Limsolar B.V. (prijslijst Limsolar, 13 oktober 2026)",
    status: "bevestigd",
    nodig: "Aftekening Limsolar van de volledige prijslijst incl. capaciteiten boven 20 kWh (prikbord r. 40).",
  },
  P6: {
    // Op "bevestigd" gezet op besluit van Dieudonné, 7 okt 2026 ("prijzen kunnen
    // live"). Bewijsstuk: prijslijst 9 sep 2026 in Bewijs/. Aftekening Limsolar ontbreekt nog.
    id: "P6",
    // Bewust geen merk en type meer sinds 26 aug 2026. De calculator schat de
    // besparing met een standaard thuisbatterij die bij het profiel past;
    // Limsolar voert alle gangbare maten en kiest het toestel aan tafel. Een
    // merknaam op het resultaatscherm zou een toezegging zijn die de verkoper
    // daarna niet meer kan bijstellen.
    tekst: "Rekenvoorbeeld met een standaard thuisbatterij van deze capaciteit",
    status: "bevestigd",
    nodig: "Aftekening Limsolar (aftekenpakket 13 okt 2026). Prijslijst met fase, 13 okt 2026, in Bewijs/.",
  },
  P7: {
    // 13 okt 2026, besluit Dieudonné: de verwijzing naar de privacyverklaring van
    // Limsolar hoort in het register. Wordt getoond in /privacyverklaring.
    id: "P7",
    tekst: "Voor wat Limsolar met je gegevens doet, geldt de privacyverklaring van Limsolar (limsolar.nl/privacy-regelgeving)",
    // 26 okt 2026: Limsolar akkoord ("ja mag", via Dieudonné). Schriftelijk in het aftekenpakket.
    status: "bevestigd",
    nodig: "Schriftelijke bevestiging in het aftekenpakket (deel C).",
  },

  // ── Reken- en besparingsclaims ───────────────────────────────────────────
  // R2 in het register is de regel over de constanten van de calculator:
  // tarieven, terugleververgoeding, terugleverkosten, opbrengst per paneel,
  // rendement. Het register schrijft voor dat elke constante een bron en een
  // datum heeft, in één blok in de code — dat blok is TARIEFBRONNEN in
  // lib/calc.ts.
  //
  // De tekst hieronder is de zichtbare kant van R2: de zin die onder de
  // uitkomst verschijnt zodra de constanten zijn afgetekend. Zolang R2 op
  // "open" staat, verschijnt die zin niet. Dat is streng en dat hoort zo: de
  // zin zegt tegen de bezoeker dat iemand het heeft nagekeken en ervoor
  // instaat. Zolang Limsolar niet heeft getekend, staat er niemand voor in, en
  // dan is een weggelaten zin beter dan een datum die je niet kunt onderbouwen.
  //
  // Merk op: dit gaat NIET over de rekendisclaimer zelf. Die valt onder R1 en
  // staat er altijd, ongeacht status. Een indicatie zonder de mededeling dát
  // het een indicatie is, is precies de claim die je niet wilt maken.
  R2: {
    id: "R2",
    // Punt hoort hier ín de tekst, anders dan bij de andere regels. Die zijn
    // zinsdelen; dit is een hele zin die achter de rekendisclaimer wordt
    // geplakt. Zonder punt in de regel blijft er bij het wegvallen van de claim
    // een losse punt achter op de pagina.
    // 13 okt 2026: op "bevestigd" op besluit van Dieudonné — de tarieven zijn van
    // Fabian (Limsolar), aantekeningen 6 okt. Schriftelijke aftekening volgt via
    // het aftekenpakket (06 - Legal & Compliance).
    tekst: "Tarieven van Limsolar, peildatum 6 oktober 2026.",
    status: "bevestigd",
    nodig:
      "Aftekening door Limsolar van de vier tarieven in lib/calc.ts (leveringstarief, terugleververgoeding, terugleverkosten, dynamische marge), met eigen peildatum. Bij aftekening ook TARIEVEN_STATUS op 'bevestigd' zetten en REKENVERSIE verhogen.",
  },

  // R3 (17 nov 2026, juridische chat stap 1 §2, prikbord r. 72): spiegel van
  // het register. NIET als <Claim> rond het label in de uitklapper gebruiken:
  // met status "toegezegd" rendert <Claim> live niet, en dan zou het label
  // wegvallen terwijl het getal blijft staan. Het label staat daarom gewoon in
  // Resultaat.tsx. Aannames (register R3): (1) investering = vanaf-prijs incl.
  // installatie, 1-fase, 3-fase als losse regel, geen btw-teruggave of subsidie;
  // (2) besparing = band uit rekenversie 1.6.x, dynamisch + handelen, € 0,15/kWh,
  // min JAARLIJKSE_KOSTEN; (3) besparing en tarieven gelijk over de hele periode,
  // geen prijsontwikkeling, slijtage of vervanging; (4) prijs ÷ besparing per
  // jaar, korte kant met de hoge besparing, lange kant met de lage.
  R3: {
    id: "R3",
    tekst: "Gerekend met een dynamisch contract en automatisch handelen, zoals Limsolar die aanbiedt.",
    status: "toegezegd",
    nodig: "Schriftelijke bevestiging Fabian: € 0,15 dynamisch voordeel en dynamisch + handelen standaard. Nooit buiten de rekentool tonen (geen advertenties, mails, landingspagina's).",
  },
  // R5 (17 nov 2026, juridische chat stap 1 §3, prikbord r. 72): wettelijk feit,
  // geen belofte van Limsolar — daarom "bevestigd" zonder aftekening. Alleen deze
  // formuleringen: "Salderen stopt op 1 januari 2027" (badge/kop) en "Vanaf
  // 1 januari 2027 vervalt de salderingsregeling." (lopende tekst). Niet: "laatste
  // kans", "nog maar X dagen", countdowns, "wordt afgebouwd".
  // Route 1: Eerste Kamer, wetsvoorstel 36611 (Wet beëindiging
  // salderingsregeling), aangenomen 17 december 2024; inwerkingtreding
  // 1 januari 2027. Route 2: Rijksoverheid, "Salderingsregeling stopt per
  // 1 januari 2027" (onderwerp zonne-energie, pagina gewijzigd 11 augustus 2026).
  R5: {
    id: "R5",
    tekst: "Salderen stopt op 1 januari 2027",
    status: "bevestigd",
    nodig: "Wettelijk feit: Wet beëindiging salderingsregeling (Kamerstuk 36611), aangenomen EK 17-12-2024, in werking 1-1-2027; Rijksoverheid, gewijzigd 11-08-2026. Halfjaarlijks nakijken.",
  },

  // ── Uitvoerings- en servicebeloften (altijd op naam van Limsolar) ─────────
  U1: {
    // Op "bevestigd" gezet op besluit van Dieudonné, 6 okt 2026 ("dit stuk mag
    // ook live"). Aftekening en bewijsstuk ontbreken nog — zie het register.
    id: "U1",
    tekst: "Limsolar installeert doorgaans binnen 14 dagen, waar technisch mogelijk",
    status: "bevestigd",
    nodig: "Doorlooptijden uit de planning over minimaal 3 maanden",
  },
  U3: {
    // Op "bevestigd" gezet op besluit van Dieudonné, 6 okt 2026 (in de
    // vertrouwensbalk). Garantievoorwaarden van de fabrikant per merk ontbreken nog.
    id: "U3",
    tekst: "10 jaar productgarantie op de batterij",
    status: "bevestigd",
    nodig: "Garantievoorwaarden van de fabrikant, per merk",
  },
  U4: {
    // Op "bevestigd" gezet op besluit van Dieudonné, 6 okt 2026. Aftekening door
    // Limsolar ontbreekt nog, en de schriftelijke garantievoorwaarden ook.
    id: "U4",
    tekst: "5 jaar garantie op de installatie door Limsolar",
    status: "bevestigd",
    nodig: "Schriftelijke garantievoorwaarden Limsolar die de klant kan inzien — nog aanleveren",
  },
  U8: {
    // 26 okt 2026: op "bevestigd" op besluit van Dieudonné ("die kloppen"). Schriftelijk via het aftekenpakket.
    id: "U8",
    tekst: "Limsolar helpt je bij de aanmelding bij de netbeheerder",
    status: "bevestigd",
    nodig: "Beschrijving van de hulp die Limsolar biedt. De klant meldt zelf aan (Dieudonné, 6 okt 2026).",
  },
  U9: {
    // Op "bevestigd" gezet op besluit van Dieudonné, 6 okt 2026 ("dit stuk mag
    // ook live"). Aftekening en bewijsstuk ontbreken nog — zie het register.
    id: "U9",
    tekst: "Limsolar installeert in heel Nederland",
    status: "bevestigd",
    // 13 nov 2026: besluit Dieudonné — werkgebied heel Nederland (prikbord r. 57);
    // meenemen in de aftekening door Limsolar (JURIDISCH).
    nodig: "Schriftelijke bevestiging werkgebied in de aftekening. sgze.nl noemde (6 okt 2026) alleen Noord-Holland, Utrecht en Zuid-Holland; D. besloot 13 nov: heel Nederland.",
  },
  U10: {
    // Op "bevestigd" gezet op besluit van Dieudonné, 6 okt 2026 ("dit stuk mag
    // ook live"). Aftekening en bewijsstuk ontbreken nog — zie het register.
    id: "U10",
    tekst: "Limsolar begeleidt je bij de btw-teruggave, onder voorwaarden",
    status: "bevestigd",
    nodig: "Beschrijving van de begeleiding en de voorwaarden",
  },
  U12: {
    // Op "bevestigd" gezet op besluit van Dieudonné, 6 okt 2026 ("dit stuk mag
    // ook live"). Aftekening en bewijsstuk ontbreken nog — zie het register.
    id: "U12",
    tekst: "Vrijblijvend adviesgesprek bij je thuis",
    status: "bevestigd",
    nodig: "Salesscript + het formulier dat aan tafel wordt getekend",
  },

  // ── Vertrouwens- en cijferclaims ─────────────────────────────────────────
  V1: {
    // Op "bevestigd" gezet op besluit van Dieudonné, 6 okt 2026. Aftekening door
    // Limsolar ontbreekt nog; deelname aan SGZE is wél aangetoond (sgze.nl).
    // Dit is alleen de TEKST. Het logo heeft zijn eigen regel, V1B.
    id: "V1",
    tekst: "Aangesloten bij Stichting Garantiefonds Zon & Energie (SGZE)",
    status: "bevestigd",
    nodig: "Aftekening Limsolar. Deelname aangetoond (sgze.nl, Bewijs/). Het LOGO staat apart onder V1B.",
  },
  V2: {
    // Op "bevestigd" gezet op besluit van Dieudonné, 6 okt 2026. Aftekening door
    // Limsolar ontbreekt nog, en het bewijsstuk (export met peildatum) ook.
    id: "V2",
    tekst: "Limsolar installeerde meer dan 300 thuisbatterijen (peildatum 6 oktober 2026)",
    status: "bevestigd",
    nodig: "Export uit het systeem van Limsolar met peildatum — nog aanleveren",
  },
  V3: {
    // Op "bevestigd" gezet op besluit van Dieudonné, 6 okt 2026: openbare,
    // originele Google-reviews. Gemeten op 6 okt 2026, schermafbeelding in Bewijs/.
    id: "V3",
    tekst: `Gemiddeld ${new Intl.NumberFormat("nl-NL").format(GOOGLE_PROFIEL.score)} op Google, op basis van ${GOOGLE_PROFIEL.aantal} beoordelingen`,
    status: "bevestigd",
    nodig: "Maandelijks opnieuw meten en GOOGLE_PROFIEL in lib/site.ts bijwerken. Schermafbeelding 6 okt 2026 in Bewijs/.",
  },
  V4: {
    // Op "bevestigd" gezet op besluit van Dieudonné, 6 okt 2026. De tekst zegt
    // eerlijk dat er geen eigen controle is — dat is wat de wet sinds 2022 vraagt.
    id: "V4",
    // Ingekort 7 okt 2026 (Dieudonné: minder nadruk op "apart van Limsolar").
    // De verplichte kern blijft: óf en hóé er gecontroleerd wordt.
    tekst: "Beoordelingen van het openbare Google-profiel. Er vindt geen aanvullende controle plaats of een beoordeling van een klant afkomstig is.",
    status: "bevestigd",
    nodig: "URL van het Google-bedrijfsprofiel. Controlemethode: geen eigen controle — dat staat zo in de tekst (verplicht sinds 2022).",
  },
  // Sinds 2022 verplicht: vermelden óf en hóé je controleert dat een review van
  // een echte klant komt. Doe je dat niet, dan is de review zelf al misleidend,
  // ook als hij echt is.
  V5: {
    id: "V5",
    tekst: "Klantreview zonder verifieerbare bron",
    status: "verboden",
    nodig:
      "Niet publiceren, onder geen enkele voorwaarde. Verzonnen reviews staan op de zwarte lijst van bijlage I bij de richtlijn oneerlijke handelspraktijken: misleiding per definitie, zonder verdere toets.",
  },
  V6: {
    id: "V6",
    tekst: "Limsolar B.V., KvK 86584081, Jelle Zijlstraweg 62-A, 1689 ZX Zwaag",
    status: "bevestigd",
  },

  // ── Keurmerken en beeldmerken van derden ─────────────────────────────────
  // Een keurmerklogo is een zwaardere mededeling dan de zin eronder: het oog
  // leest het als een oordeel van een onafhankelijke partij. Het tonen van een
  // vertrouwens- of kwaliteitsmerk zonder toestemming van de houder staat op de
  // zwarte lijst van bijlage I bij de richtlijn oneerlijke handelspraktijken —
  // misleiding per definitie, zonder verdere toets, net als V5.
  //
  // Daarom heeft elk merk hier TWEE bewijsstukken nodig en niet één:
  // (a) dat de aansluiting/certificering bestaat en geldig is, en
  // (b) dat de houder het beeldmerk mag laten voeren door déze partij.
  V1B: {
    // 26 okt 2026: op "bevestigd" op besluit van Dieudonné ("die kloppen"). Schriftelijk via het aftekenpakket.
    // Het SGZE-LOGO, los van de tekst V1. Een keurmerklogo voeren zonder
    // toestemming van de houder staat op de zwarte lijst (bijlage I richtlijn
    // oneerlijke handelspraktijken). Deelname is aangetoond, de toestemming
    // voor het beeldmerk niet — daarom staat de tekst live en het logo niet.
    id: "V1B",
    tekst: "Logo Stichting Garantiefonds Zon & Energie (SGZE)",
    status: "bevestigd",
    nodig: "Beeldmerkvoorwaarden / toestemming van SGZE voor het logo",
  },
  V7: {
    // 26 okt 2026: op "bevestigd" op besluit van Dieudonné ("die kloppen"). Schriftelijk via het aftekenpakket.
    id: "V7",
    tekst: "Installatiewerk door een InstallQ-erkend installatiebedrijf",
    status: "bevestigd",
    nodig:
      "Certificaat of registratienummer InstallQ op naam van Limsolar B.V., met geldigheidsdatum, PLUS de beeldmerkvoorwaarden van InstallQ",
  },
  V8: {
    // Op "bevestigd" gezet op besluit van Dieudonné, 7 okt 2026 ("Warmtefonds is
    // bevestigd"). Bewijsstuk en beeldmerktoestemming nog in Bewijs/ zetten.
    id: "V8",
    // Let op de formulering. Het Nationaal Warmtefonds is geen keurmerk maar
    // een financier: het logo tonen zegt niet "wij zijn gekeurd" maar "je kunt
    // hier lenen". Dat is een financiële mededeling, en die moet kloppen tot
    // en met de voorwaarden. Zet hem dus nooit in een rij die "keurmerken"
    // heet zonder dit onderscheid erbij te schrijven.
    tekst: "Financiering via het Nationaal Warmtefonds is mogelijk",
    status: "bevestigd",
    nodig:
      "Bevestiging dat een thuisbatterij onder de regeling valt en dat Limsolar als uitvoerder wordt geaccepteerd, PLUS toestemming voor het beeldmerk. Zonder rentepercentage, looptijd en voorwaarden erbij is dit bovendien een financiële claim die je niet los mag tonen.",
  },
} as const satisfies Record<string, ClaimRegel>;

export type ClaimId = keyof typeof CLAIMS;

export const isLive = process.env.NEXT_PUBLIC_LIVE === "true";

export function claim(id: ClaimId): ClaimRegel {
  return CLAIMS[id];
}

/** Mag deze claim getoond worden? In live-modus alleen als hij bevestigd is. */
export function mag(id: ClaimId): boolean {
  // Bewust als ClaimRegel getypeerd en niet als de letterlijke waarde: de
  // verboden-controle moet blijven staan ook als er nu geen verboden regel in
  // het register zit. Er komt er ooit één bij.
  const c: ClaimRegel = CLAIMS[id];
  if (c.status === "verboden") return false;
  return isLive ? c.status === "bevestigd" : true;
}

/** Overzicht voor de bouwstatus-balk in de preview. */
export function claimStand() {
  const alle = Object.values(CLAIMS) as ClaimRegel[];
  return {
    totaal: alle.length,
    bevestigd: alle.filter((c) => c.status === "bevestigd").length,
    toegezegd: alle.filter((c) => c.status === "toegezegd").length,
    open: alle.filter((c) => c.status === "open").length,
  };
}
