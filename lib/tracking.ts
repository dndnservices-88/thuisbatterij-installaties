"use client";

/**
 * Meten. Eén gebeurtenis per stap, zodat je ziet bij welke vraag mensen weglopen.
 * Bron: Limsolar_Specificatie_Calculator_16aug2026.md, sectie 6.
 *
 * Twee dingen waar het standaard misgaat en die hier expliciet goed staan:
 *  1. Deduplicatie — browser en server sturen bij dezelfde gebeurtenis hetzelfde
 *     event_id mee, anders telt Meta elke lead dubbel en optimaliseer je op lucht.
 *  2. Consent — alles blijft uit tot de bezoeker de banner accepteert.
 *     Consent Mode v2 staat standaard op denied, zodat Google bij weigering
 *     geanonimiseerd blijft doorleren.
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
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
  | "calc_disqualified_huur"
  | "calc_no_pv"
  | "calc_not_viable"
  | "lead_form_view"
  | "lead_timeslot";

export function meld(event: CalcEvent | "Lead", parameters: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...parameters });
  if (typeof window.gtag === "function") window.gtag("event", event, parameters);
  if (typeof window.fbq === "function") {
    // Lead is een standaardgebeurtenis bij Meta, de rest is custom.
    if (event === "Lead") window.fbq("track", "Lead", parameters, { eventID: parameters.event_id as string });
    else window.fbq("trackCustom", event, parameters);
  }
}

/** Genereert het event_id dat browser én server meesturen. */
export function nieuwEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export const CONSENT_COOKIE = "tbi_consent";

export type ConsentKeuze = "alles" | "alleen_noodzakelijk";

export function leesConsent(): ConsentKeuze | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(^|; )" + CONSENT_COOKIE + "=([^;]*)"));
  const w = m ? decodeURIComponent(m[2]) : null;
  return w === "alles" || w === "alleen_noodzakelijk" ? w : null;
}

export function bewaarConsent(keuze: ConsentKeuze) {
  const t = new Date(Date.now() + 365 * 864e5).toUTCString();
  document.cookie = `${CONSENT_COOKIE}=${keuze}; expires=${t}; path=/; SameSite=Lax`;
}

/** Werkt Consent Mode v2 bij en laadt de advertentiescripts pas ná akkoord. */
export function pasConsentToe(keuze: ConsentKeuze) {
  if (typeof window === "undefined") return;
  const toegestaan = keuze === "alles" ? "granted" : "denied";
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function () {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer.push(arguments);
    };
  window.gtag("consent", "update", {
    ad_storage: toegestaan,
    ad_user_data: toegestaan,
    ad_personalization: toegestaan,
    analytics_storage: toegestaan,
  });
  if (keuze === "alles") laadAdvertentiescripts();
}

let geladen = false;

/** Laadt Meta Pixel en de Google-tag. Alleen aanroepen ná toestemming. */
export function laadAdvertentiescripts() {
  if (geladen || typeof window === "undefined") return;
  geladen = true;

  const metaId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  if (metaId) {
    /* eslint-disable */
    (function (f: any, b: Document, e: string, v: string, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e) as HTMLScriptElement;
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode!.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    /* eslint-enable */
    window.fbq!("init", metaId);
    window.fbq!("track", "PageView");
  }

  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  if (adsId) {
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${adsId}`;
    document.head.appendChild(s);
    window.gtag("js", new Date());
    window.gtag("config", adsId);
  }
}

/** Google Ads-conversie. Label komt uit de conversieactie in je Ads-account. */
export function meldAdsConversie(transactieId: string) {
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL;
  if (!adsId || !label || typeof window.gtag !== "function") return;
  window.gtag("event", "conversion", {
    send_to: `${adsId}/${label}`,
    transaction_id: transactieId,
  });
}
