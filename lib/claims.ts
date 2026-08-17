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
    tekst: "Marstek Venus E 3.0, 10,24 kWh",
    status: "open",
    nodig: "Datasheet van de fabrikant",
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
