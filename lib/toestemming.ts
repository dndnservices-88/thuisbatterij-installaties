/**
 * Toestemmingsopslag — de pure laag, zonder "use client".
 *
 * Afgesplitst uit lib/tracking.ts op 6 oktober 2026, omdat de server de
 * cookiekeuze nu óók moet kunnen lezen: de Meta Conversions API mag alleen
 * vuren voor bezoekers die marketing hebben toegestaan, en de importregel naar
 * Google draagt dezelfde keuze mee. Een module met "use client" kan een route
 * handler niet gebruiken, en de logica dupliceren levert gegarandeerd twee
 * versies op die uit elkaar lopen. lib/tracking.ts exporteert alles hieronder
 * opnieuw, dus bestaande imports blijven werken.
 */

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

/**
 * Leest de cookiekeuze uit een Cookie-header, server-side.
 *
 * Geen keuze, of een onleesbare cookie, telt als geen toestemming. Dat is
 * dezelfde regel als in de browser: niet raden.
 */
export function toestemmingUitCookieHeader(
  header: string | null | undefined
): { statistieken: boolean; marketing: boolean; bron: "cookie" | "geen_keuze" } {
  const m = (header ?? "").match(new RegExp("(^|;\\s*)" + CONSENT_COOKIE + "=([^;]*)"));
  let ruw: string | null = null;
  if (m) {
    try {
      ruw = decodeURIComponent(m[2]);
    } catch {
      ruw = null;
    }
  }
  const t = ontleedConsent(ruw);
  if (!t) return { statistieken: false, marketing: false, bron: "geen_keuze" };
  return { statistieken: t.statistieken, marketing: t.marketing, bron: "cookie" };
}
