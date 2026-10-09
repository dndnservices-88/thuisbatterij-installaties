"use client";

/**
 * Klik-ID's vastleggen. Dit is de bouwsteen voor offline conversie-import —
 * volgens het Orakel de kritieke blokkade: zolang je niet weet welke afspraak
 * tot een sale leidt, stuur je op formulieren in plaats van op omzet.
 *
 * Belangrijk: klik en formulier vinden vaak niet in dezelfde sessie plaats.
 * Daarom bewaren we in een first-party cookie van 90 dagen én in localStorage,
 * en overschrijven we een bestaande waarde alleen als er een nieuwe klik-ID is.
 *
 * Zonder dit veld is de terugkoppelingsloop later niet meer te maken, ook niet
 * met terugwerkende kracht.
 *
 * Sinds 8 okt 2026 (juridische chat dossier 6, punt 1; art. 11.7a Tw): pas
 * wegschrijven ná marketingtoestemming. Tot die keuze staan de klik-ID's alleen
 * in het werkgeheugen van deze pagina — de site wisselt van pagina zonder te
 * herladen, dus ze overleven het bezoek zolang de bezoeker blijft. Weigert hij,
 * dan wissen we een eventuele oude cookie en localStorage-waarde.
 * Gevolg: bij weigeraars gaat er geen gclid/fbclid mee met de lead, en is hun
 * afspraak of sale niet terug te koppelen naar Google of Meta.
 */

const COOKIE = "tbi_attributie";
const DAGEN = 90;

export type Attributie = {
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  fbclid?: string;
  _fbp?: string;
  _fbc?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  landing_url?: string;
  referrer?: string;
  session_id?: string;
  eerste_bezoek?: string;
};

const VELDEN: (keyof Attributie)[] = [
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
];

function leesCookie(naam: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const m = document.cookie.match(new RegExp("(^|; )" + naam + "=([^;]*)"));
  return m ? decodeURIComponent(m[2]) : undefined;
}

function zetCookie(naam: string, waarde: string, dagen: number) {
  const t = new Date(Date.now() + dagen * 864e5).toUTCString();
  document.cookie = `${naam}=${encodeURIComponent(waarde)}; expires=${t}; path=/; SameSite=Lax`;
}

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Klik-ID's van dit bezoek, alleen in het geheugen. Overleeft paginawissels zonder herladen. */
let geheugen: Attributie = {};

function leesOpgeslagen(): Attributie {
  try {
    const uitCookie = leesCookie(COOKIE);
    const uitStorage = window.localStorage.getItem(COOKIE);
    return { ...JSON.parse(uitStorage || "{}"), ...JSON.parse(uitCookie || "{}") };
  } catch {
    return {};
  }
}

export function leesAttributie(): Attributie {
  if (typeof window === "undefined") return {};
  return { ...leesOpgeslagen(), ...geheugen };
}

/** Schrijft de klik-ID's van dit bezoek weg. Alleen aanroepen bij marketingtoestemming. */
export function bewaarKlikIds() {
  if (typeof window === "undefined") return;
  const json = JSON.stringify(leesAttributie());
  zetCookie(COOKIE, json, DAGEN);
  try {
    window.localStorage.setItem(COOKIE, json);
  } catch {
    /* localStorage kan geblokkeerd zijn; de cookie is de primaire opslag */
  }
}

/** Wist opgeslagen klik-ID's (weigeren of intrekken). Het geheugen van dit bezoek blijft. */
export function wisKlikIds() {
  if (typeof window === "undefined") return;
  if (leesCookie(COOKIE) !== undefined) {
    document.cookie = `${COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
  }
  try {
    window.localStorage.removeItem(COOKIE);
  } catch {
    /* niets */
  }
}

/**
 * Roep dit één keer aan bij binnenkomst op elke pagina.
 * @param magOpslaan true alleen bij een eerder gegeven marketingtoestemming.
 */
export function vangKlikIds(magOpslaan: boolean): Attributie {
  if (typeof window === "undefined") return {};
  const bestaand = magOpslaan ? leesAttributie() : { ...geheugen };
  const params = new URLSearchParams(window.location.search);
  const nieuw: Attributie = { ...bestaand };

  let vers = false;
  for (const veld of VELDEN) {
    const waarde = params.get(veld);
    if (waarde) {
      nieuw[veld] = waarde;
      vers = true;
    }
  }

  // Meta zet _fbp zelf zodra de pixel geladen is; _fbc leiden we af uit fbclid.
  const fbp = leesCookie("_fbp");
  if (fbp) nieuw._fbp = fbp;
  const fbc = leesCookie("_fbc");
  if (fbc) nieuw._fbc = fbc;
  else if (nieuw.fbclid && !nieuw._fbc) {
    nieuw._fbc = `fb.1.${Date.now()}.${nieuw.fbclid}`;
  }

  if (!nieuw.session_id) nieuw.session_id = uuid();
  if (!nieuw.eerste_bezoek) nieuw.eerste_bezoek = new Date().toISOString();
  if (vers || !nieuw.landing_url) nieuw.landing_url = window.location.href;
  if (vers || !nieuw.referrer) nieuw.referrer = document.referrer || undefined;

  geheugen = nieuw;
  if (magOpslaan) bewaarKlikIds();
  else wisKlikIds();
  return nieuw;
}
