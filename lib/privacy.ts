/**
 * Instellingen en open punten van de privacyverklaring v2.0
 * (tekst: juridische chat, "Limsolar_Concept_Privacyverklaring_en_Sitepakket_7okt2026.docx", onderdeel A).
 */

export const PRIVACY_VERSIE = "2.0";

/**
 * Welke tekst bij "Cookies en meten". Keuze ligt bij de meetchat:
 * 1 = Google-tags laden al vóór toestemming (consent mode "advanced") — huidige stand.
 * 2 = meetscripts laden pas ná toestemming.
 * Eén regel wijzigen als de meetchat omschakelt.
 */
export const COOKIE_VARIANT: 1 | 2 = 1;

/**
 * Wat er in de privacyverklaring nog nagekeken of ingevuld moet worden. Staat in
 * de preview als gele markering op de pagina én telt mee in de bouwbalk. Een
 * punt pas weghalen als het in de tekst is opgelost.
 */
export const PRIVACY_OPEN = [
  "Telefoonnummer (CloudTalk)",
  "Link privacyverklaring Limsolar laten bevestigen door Limsolar",
  "Grondslag toestemmingsbewijs, gespreksopname en klik-ID's (jurist, G1/G2)",
  "Gespreksopname: is besloten dat CloudTalk opneemt?",
  "Vercel: verwerkersovereenkomst geldt alleen op Pro/Enterprise — plan controleren",
  "Make: verwerkersovereenkomst alleen op betaald plan; hostingzone (EU/US) controleren",
  "Google Sheet onder gratis Gmail-account (jurist, G4)",
  "Pushdienst: welke dienst zit achter PUSH_WEBHOOK_URL?",
  "Publicatiedatum invullen bij livegang",
] as const;
