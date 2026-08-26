"use client";

/**
 * Meten. Eén gebeurtenis per stap, zodat je ziet bij welke vraag mensen weglopen.
 * Bron: Limsolar_Specificatie_Calculator_16aug2026.md, sectie 6.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * HERZIEN OP 26 AUGUSTUS 2026 — fase 8, blok 1. Drie wijzigingen:
 *
 *  1. De site laadt zelf geen advertentiescripts meer. De Meta Pixel en de
 *     Google-tag komen voortaan uit Tag Manager. Zolang de site ze óók zelf
 *     inlaadt, vuurt elke tag die je in GTM aanmaakt dubbel — en dubbeltellen
 *     merk je pas als je er al weken op hebt geoptimaliseerd.
 *
 *  2. meld() schrijft daarom alléén nog naar de dataLayer. Dat is nu de enige
 *     koppeling tussen de site en alles wat meet: één poort, één plek om te
 *     controleren. Wat er met een gebeurtenis gebeurt, staat in de container
 *     en niet meer verspreid door de code.
 *
 *  3. Toestemming is niet langer alles-of-niets maar per categorie.
 *
 * Twee dingen die onveranderd blijven omdat ze goed staan:
 *  - Deduplicatie — browser en server sturen bij dezelfde gebeurtenis hetzelfde
 *    event_id mee, anders telt Meta elke lead dubbel.
 *  - Consent Mode v2 staat standaard op denied (zie app/layout.tsx), zodat
 *    Google bij weigering geanonimiseerd blijft doorleren.
 * ────────────────────────────────────────────────────────────────────────────
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export type CalcEvent =
  | "calc_start"
  | "calc_step_1"
  | "calc_step_2"
  | "calc_step_3"
  | "calc_step_4"
  | "calc_step_5"
  | "calc_result"
  // Bezoeker zet zelf terugleverkosten aan op het resultaatscherm. Los event,
  // omdat het twee dingen tegelijk meet: hoe vaak mensen weten wat hun
  // leverancier rekent, en of een gunstigere uitkomst tot meer leads leidt.
  | "calc_terugleverkosten"
  | "calc_disqualified_huur"
  | "calc_no_pv"
  | "calc_not_viable"
  | "lead_form_view"
  | "lead_timeslot";

/**
 * De enige uitgang naar de meetlaag. Pusht naar de dataLayer en verder niets.
 *
 * Géén directe gtag- of fbq-aanroep meer: die tags hangen nu in de container.
 * Zet je hier ooit weer een rechtstreekse aanroep bij, dan telt de gebeurtenis
 * twee keer zodra iemand in GTM een tag op hetzelfde event zet — en dat ziet
 * niemand terug, want beide tellingen ogen normaal.
 */
export function meld(event: CalcEvent | "Lead", parameters: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...parameters });
}

/** Genereert het event_id dat browser én server meesturen. */
export function nieuwEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

// ─── Toestemming ─────────────────────────────────────────────────────────────

export const CONSENT_COOKIE = "tbi_consent";

/**
 * Versie van de toestemmingsopslag, niet van de toestemmingstékst.
 *
 * Verwar dit niet met CONSENT.versie in lib/site.ts. Dat is de belttoestemming
 * uit het formulier — juridisch iets heel anders, en die gaat hier dus niet van
 * omhoog. Deze teller gaat alleen omhoog als het formaat van de cookie wijzigt.
 */
export const CONSENT_VERSIE = 2;

/**
 * Drie categorieën. "Noodzakelijk" staat er niet bij en dat is geen omissie:
 * die is per definitie aan en mag je niet als keuze presenteren.
 */
export type Toestemming = {
  statistieken: boolean;
  marketing: boolean;
  /** Formaatversie van de cookie waaruit deze keuze komt. */
  versie: number;
  /** ISO-tijdstip van de keuze. Leeg bij een keuze uit het oude formaat. */
  tijdstip: string;
};

export const GEEN_TOESTEMMING: Toestemming = {
  statistieken: false,
  marketing: false,
  versie: CONSENT_VERSIE,
  tijdstip: "",
};

/** Bouwt een verse keuze met het huidige tijdstip erin. */
export function nieuweToestemming(keuze: { statistieken: boolean; marketing: boolean }): Toestemming {
  return {
    statistieken: keuze.statistieken,
    marketing: keuze.marketing,
    versie: CONSENT_VERSIE,
    tijdstip: new Date().toISOString(),
  };
}

/**
 * Leest de rauwe cookiewaarde uit en begrijpt óók het oude formaat.
 *
 * Het oude formaat kende twee waarden, "alles" en "alleen_noodzakelijk". Die
 * vertalen één op één: "alles" dekte statistieken én marketing, en
 * "alleen_noodzakelijk" dekte geen van beide. Omdat de vertaling volledig is,
 * hoeft niemand opnieuw te kiezen. Was er een categorie bíj gekomen die het
 * oude "alles" niet dekte, dan had de banner opnieuw moeten verschijnen — dat
 * onderscheid is het verschil tussen migreren en toestemming verzinnen.
 *
 * Geeft null terug als er geen bruikbare keuze staat. Null betekent: vragen.
 */
export function ontleedConsent(ruw: string | null | undefined): Toestemming | null {
  if (!ruw) return null;

  if (ruw === "alles") return { statistieken: true, marketing: true, versie: 1, tijdstip: "" };
  if (ruw === "alleen_noodzakelijk") return { statistieken: false, marketing: false, versie: 1, tijdstip: "" };

  try {
    const o = JSON.parse(ruw);
    if (typeof o !== "object" || o === null) return null;
    if (typeof o.statistieken !== "boolean" || typeof o.marketing !== "boolean") return null;
    return {
      statistieken: o.statistieken,
      marketing: o.marketing,
      versie: typeof o.versie === "number" ? o.versie : CONSENT_VERSIE,
      tijdstip: typeof o.tijdstip === "string" ? o.tijdstip : "",
    };
  } catch {
    // Onleesbare cookie. Niet raden, gewoon opnieuw vragen.
    return null;
  }
}

/** Serialiseert een keuze naar de waarde die in de cookie komt. */
export function schrijfConsent(t: Toestemming): string {
  return JSON.stringify({
    statistieken: t.statistieken,
    marketing: t.marketing,
    versie: CONSENT_VERSIE,
    tijdstip: t.tijdstip,
  });
}

/**
 * Vertaalt de keuze naar de zes signalen van Consent Mode v2.
 *
 * functionality_storage en security_storage staan altijd op granted. Dat is
 * geen sluiproute: de site gebruikt die categorieën uitsluitend voor dingen die
 * strikt noodzakelijk zijn — de toestemmingscookie zelf en de first-party
 * opslag van klik-ID's voor de eigen leadadministratie. Zou daar ooit iets bij
 * komen dat niet strikt noodzakelijk is, dan hoort het een eigen categorie in
 * de banner te krijgen en niet stilletjes hier.
 */
export function consentSignalen(t: Toestemming): Record<string, "granted" | "denied"> {
  const marketing = t.marketing ? "granted" : "denied";
  const statistieken = t.statistieken ? "granted" : "denied";
  return {
    ad_storage: marketing,
    ad_user_data: marketing,
    ad_personalization: marketing,
    analytics_storage: statistieken,
    functionality_storage: "granted",
    security_storage: "granted",
  };
}

export function leesConsent(): Toestemming | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(^|; )" + CONSENT_COOKIE + "=([^;]*)"));
  return ontleedConsent(m ? decodeURIComponent(m[2]) : null);
}

export function bewaarConsent(t: Toestemming) {
  if (typeof document === "undefined") return;
  const verloopt = new Date(Date.now() + 365 * 864e5).toUTCString();
  const waarde = encodeURIComponent(schrijfConsent(t));
  document.cookie = `${CONSENT_COOKIE}=${waarde}; expires=${verloopt}; path=/; SameSite=Lax`;
}

/**
 * Werkt Consent Mode v2 bij.
 *
 * Laadt zelf niets meer in. Wat er ná toestemming gebeurt, bepaalt de container:
 * GTM houdt elke tag tegen waarvan de vereiste toestemming op denied staat.
 * Zet die vereiste per tag ook echt in — een tag zonder toestemmingsinstelling
 * vuurt gewoon, ook voor wie geweigerd heeft.
 */
export function pasConsentToe(t: Toestemming) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function () {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer.push(arguments);
    };
  window.gtag("consent", "update", consentSignalen(t));

  // Eigen gebeurtenis erbij, zodat je in GTM een trigger op het moment van
  // toestemming kunt zetten in plaats van te wachten tot de volgende pageview.
  window.dataLayer.push({
    event: "consent_update",
    consent_statistieken: t.statistieken,
    consent_marketing: t.marketing,
  });
}

/**
 * Naam van de gebeurtenis waarmee de voettekstlink de banner heropent.
 * Een intrekbare toestemming is een eis, geen extraatje: zonder een zichtbare
 * weg terug is de gegeven toestemming niet geldig.
 */
export const HEROPEN_EVENT = "tbi:cookievoorkeuren";

export function opendCookievoorkeuren() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(HEROPEN_EVENT));
}
