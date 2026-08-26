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
    status: "open",
    nodig: "Schriftelijke garantieprocedure + gedateerde prijsvergelijking",
  },
  P2: {
    id: "P2",
    tekst: "Instapmodel inclusief installatie vanaf € 3.999",
    status: "toegezegd",
    nodig: "Actuele prijslijst met datum",
  },
  P6: {
    id: "P6",
    // Bewust geen merk en type meer sinds 26 aug 2026. De calculator schat de
    // besparing met een standaard thuisbatterij die bij het profiel past;
    // Limsolar voert alle gangbare maten en kiest het toestel aan tafel. Een
    // merknaam op het resultaatscherm zou een toezegging zijn die de verkoper
    // daarna niet meer kan bijstellen.
    tekst: "Rekenvoorbeeld met een standaard thuisbatterij van deze capaciteit",
    status: "open",
    nodig: "Prijslijst per capaciteit van Limsolar (toegezegd 26 aug 2026)",
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
    tekst: "Tarieven gecontroleerd op 24 augustus 2026.",
    status: "open",
    nodig:
      "Aftekening door Limsolar van de vier tarieven in lib/calc.ts (leveringstarief, terugleververgoeding, terugleverkosten, dynamische marge), met eigen peildatum. Bij aftekening ook TARIEVEN_STATUS op 'bevestigd' zetten en REKENVERSIE verhogen.",
  },

  // ── Uitvoerings- en servicebeloften (altijd op naam van Limsolar) ─────────
  U1: {
    id: "U1",
    tekst: "Limsolar installeert binnen circa 7 dagen, waar technisch mogelijk",
    status: "open",
    nodig: "Doorlooptijden uit de planning over minimaal 3 maanden",
  },
  U3: {
    id: "U3",
    tekst: "10 jaar productgarantie op de batterij",
    status: "open",
    nodig: "Garantievoorwaarden van de fabrikant",
  },
  U4: {
    id: "U4",
    tekst: "5 jaar garantie op de installatie door Limsolar",
    status: "open",
    nodig: "Garantievoorwaarden Limsolar",
  },
  U8: {
    id: "U8",
    tekst: "Limsolar meldt elke installatie aan bij de netbeheerder",
    status: "open",
    nodig: "Bevestiging + voorbeeldaanmelding",
  },
  U9: {
    id: "U9",
    tekst: "Limsolar installeert in heel Nederland",
    status: "open",
    nodig: "Bevestiging werkgebied, eventueel postcodelijst",
  },
  U10: {
    id: "U10",
    tekst: "Wij begeleiden je bij de btw-teruggave, onder voorwaarden",
    status: "toegezegd",
    nodig: "Beschrijving van de begeleiding en de voorwaarden",
  },
  U12: {
    id: "U12",
    tekst: "Vrijblijvend adviesgesprek bij je thuis",
    status: "open",
    nodig: "Salesscript + het formulier dat aan tafel wordt getekend",
  },

  // ── Vertrouwens- en cijferclaims ─────────────────────────────────────────
  V1: {
    id: "V1",
    tekst: "Aangesloten bij Stichting Garantiefonds ZonneEnergie (SGZE)",
    status: "open",
    nodig: "Deelnamebewijs SGZE met geldigheidsdatum",
  },
  V2: {
    id: "V2",
    tekst: "PM woningen voorzien van een thuisbatterij",
    status: "open",
    nodig: "Export met peildatum",
  },
  V3: {
    id: "V3",
    tekst: "PM gemiddeld op basis van PM beoordelingen",
    status: "open",
    nodig: "Export uit het reviewplatform",
  },
  V4: {
    id: "V4",
    tekst:
      "Deze beoordelingen komen uit het openbare Google-bedrijfsprofiel van Limsolar B.V. Wij plaatsen ze niet zelf en kunnen ze niet wijzigen of verwijderen.",
    status: "open",
    nodig: "URL van het Google-bedrijfsprofiel + je controleprocedure op schrift",
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
  V7: {
    id: "V7",
    tekst: "Installatiewerk door een InstallQ-erkend installateur",
    status: "open",
    nodig:
      "Certificaat of registratienummer InstallQ op naam van Limsolar B.V., met geldigheidsdatum, PLUS de beeldmerkvoorwaarden van InstallQ",
  },
  V8: {
    id: "V8",
    // Let op de formulering. Het Nationaal Warmtefonds is geen keurmerk maar
    // een financier: het logo tonen zegt niet "wij zijn gekeurd" maar "je kunt
    // hier lenen". Dat is een financiële mededeling, en die moet kloppen tot
    // en met de voorwaarden. Zet hem dus nooit in een rij die "keurmerken"
    // heet zonder dit onderscheid erbij te schrijven.
    tekst: "Financiering via het Nationaal Warmtefonds is mogelijk",
    status: "open",
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
