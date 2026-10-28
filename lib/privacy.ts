/**
 * Instellingen en open punten van de privacyverklaring v2.0
 * (tekst: juridische chat, "Limsolar_Concept_Privacyverklaring_en_Sitepakket_7okt2026.docx", onderdeel A).
 */

export const PRIVACY_VERSIE = "2.2"; // 28 okt 2026: adrescontrole via PDOK (Kadaster). 2.1 (25 okt): Rinkel, geen gespreksopname

/**
 * Welke tekst bij "Cookies en meten". Keuze ligt bij de meetchat:
 * 1 = Google-tags laden al vóór toestemming (consent mode "advanced") — huidige stand.
 * 2 = meetscripts laden pas ná toestemming.
 * Eén regel wijzigen als de meetchat omschakelt.
 */
export const COOKIE_VARIANT: 1 | 2 = 2; // 8 okt 2026: container laadt pas na toestemming (lib/gtm.ts)

/**
 * Wat er in de privacyverklaring nog nagekeken of ingevuld moet worden. Staat in
 * de preview als gele markering op de pagina én telt mee in de bouwbalk. Een
 * punt pas weghalen als het in de tekst is opgelost.
 */
export const PRIVACY_OPEN = [
  "Grondslag toestemmingsbewijs en klik-ID's (jurist, G1/G2)",
  "Make: verwerkersovereenkomst alleen op betaald plan — welk plan? (zone eu1 bevestigd 26 okt)",
  "Google Sheet onder gratis Gmail-account (jurist, G4)",
  "Publicatiedatum invullen bij livegang",
  "Adrescontrole via PDOK/Kadaster: formulering en grondslag (jurist, 28 okt)",
] as const;
