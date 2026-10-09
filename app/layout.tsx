import type { Metadata } from "next";
import { headers } from "next/headers";
import { GTM_AAN, GTM_ID, OMGEVING, gtmSnippet } from "@/lib/gtm";

// Lettertypen lokaal via next/font (sinds 7 okt 2026). Tot dan zes losse
// @fontsource-CSS-bestanden; PageSpeed (mobiel, 7 okt) telde die mee in 1.210 ms
// renderblokkering. next/font zet de @font-face in de pagina-CSS en laadt de
// bestanden met voorrang. Alleen de latin-subset: die dekt Nederlands inclusief
// ë, é en het euroteken (U+0000-00FF, U+20AC). Bestanden zijn gekopieerd uit
// @fontsource (OFL-licentie) naar app/fonts/.
import localFont from "next/font/local";

const fontKop = localFont({
  src: [
    { path: "./fonts/work-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/work-sans-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/work-sans-latin-800-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-kop",
  display: "swap",
});
const fontTekst = localFont({
  src: [
    { path: "./fonts/open-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/open-sans-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-tekst",
  display: "swap",
});
const fontAccent = localFont({
  src: [{ path: "./fonts/libre-baskerville-latin-400-italic.woff2", weight: "400", style: "italic" }],
  variable: "--font-accent",
  display: "swap",
  // Alleen voor de italic accentregel in de hero; geen voorrang nodig.
  preload: false,
});

import "./globals.css";
import ConsentBanner from "@/components/ConsentBanner";
import { toestemmingUitCookieHeader } from "@/lib/toestemming";
import Bouwstatus from "@/components/Bouwstatus";
import Kopbalk from "@/components/Kopbalk";
import { kiesVariant } from "@/lib/varianten";
import { DOMEIN, ENTITEIT } from "@/lib/site";

const TITEL = "Thuisbatterij Installaties — eerst rekenen, dan installeren";
const OMSCHRIJVING =
  "Reken in twee minuten uit wat een thuisbatterij in jouw situatie oplevert. Eerlijke bandbreedte, zonder gegevens achter te laten.";

/**
 * SEO-basis (7 okt 2026) — het deel dat Yoast in WordPress regelt: canonical,
 * deelvoorbeeld (Open Graph / X) en gestructureerde data. robots.txt en
 * sitemap.xml staan in app/robots.ts en app/sitemap.ts.
 */
export const metadata: Metadata = {
  metadataBase: new URL(`https://${DOMEIN}`),
  title: TITEL,
  description: OMSCHRIJVING,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: "/",
    siteName: ENTITEIT.handelsnaam,
    title: TITEL,
    description: OMSCHRIJVING,
    images: [{ url: "/beeld/og-deelbeeld.jpg", width: 1200, height: 630, alt: "Thuisbatterij aan een buitenmuur" }],
  },
  twitter: { card: "summary_large_image", title: TITEL, description: OMSCHRIJVING },
  robots: {
    // Blijft op noindex tot het claimregister is afgetekend. Eén regel wijzigen
    // bij livegang; zie README.
    index: process.env.NEXT_PUBLIC_LIVE === "true",
    follow: process.env.NEXT_PUBLIC_LIVE === "true",
  },
};

/**
 * Consent Mode v2. Dit blok moet vóór elk ander script staan — dus ook vóór de
 * GTM-snippet hieronder — anders telt Google de eerste paginaweergave als
 * 'granted' en klopt de hele meting niet meer.
 *
 * Zes signalen in plaats van vier. De twee erbij, functionality_storage en
 * security_storage, staan op granted omdat de site die categorieën uitsluitend
 * gebruikt voor strikt noodzakelijke opslag: de toestemmingscookie zelf en de
 * klik-ID's voor de eigen leadadministratie. Expliciet declareren is beter dan
 * weglaten — wat je niet declareert, vult Google zelf in.
 *
 * De vier die ertoe doen staan op denied en worden bijgewerkt door
 * pasConsentToe() in lib/tracking.ts.
 */
/**
 * Gestructureerde data: alleen de organisatie. Bewust géén FAQPage (Google toont
 * die sinds aug 2023 alleen nog bij overheids- en zorgsites) en géén
 * aggregateRating: de Google-score is van Limsolar, niet van deze site, en
 * reviews van een andere partij als eigen markup opnemen mag niet.
 */
const ORGANISATIE_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: ENTITEIT.handelsnaam,
  url: `https://${DOMEIN}`,
  logo: `https://${DOMEIN}/beeld/logo-kleur.webp`,
  areaServed: "NL",
});

const CONSENT_DEFAULTS = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'granted',
  security_storage: 'granted',
  wait_for_update: 500
});
`;

/**
 * Tag Manager. Eén container, en verder laadt de site zelf niets meer in: de
 * Meta Pixel, de Google-tag, GA4 en Clarity hangen er allemaal ín.
 *
 * Twee grendels, niet één.
 *
 *  1. Zonder NEXT_PUBLIC_GTM_ID komt er geen snippet. Dat is de bedoeling
 *     zolang de container niet bestaat — een halve meetopstelling is erger dan
 *     geen, want dan denk je dat je cijfers hebt.
 *
 *  2. Mét een container-ID laadt de snippet alleen in productie. Zonder deze
 *     tweede grendel meet elke preview-deploy mee in dezelfde property: elke
 *     keer dat je zelf een testlead invult telt dat als conversie, en het
 *     biedalgoritme leert van verkeer dat niet bestaat. Dat is niet achteraf te
 *     repareren, want GA4 en Google Ads kennen geen "verwijder deze bron".
 *
 * Wil je bewust op een preview-deploy testen — GTM Voorbeeld-modus of Meta Test
 * Events — zet dan NEXT_PUBLIC_GTM_IN_PREVIEW=true op díe omgeving, en haal hem
 * daarna weg. Niet op Production zetten; daar doet hij niets en hij verbergt
 * alleen wat er werkelijk aan staat.
 */
// GTM_ID, OMGEVING, GTM_AAN en gtmSnippet staan sinds 8 okt 2026 in lib/gtm.ts,
// omdat de banner de container nu ook in de browser moet kunnen laden.

/**
 * De omgeving gaat óók de dataLayer in, vóór de container laadt. Zo kun je in
 * GTM elke trigger nog een keer afvangen op `omgeving equals production`. Twee
 * sloten op dezelfde deur, want deze fout is niet terug te draaien.
 */
const MEETCONTEXT = `
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({ omgeving: ${JSON.stringify(OMGEVING ?? "onbekend")} });
${
  GTM_ID && !GTM_AAN && OMGEVING === undefined
    ? `console.warn('Tag Manager laadt niet: NEXT_PUBLIC_VERCEL_ENV is leeg. Zet in Vercel onder Settings de systeemvariabelen aan, anders meet de productiesite niets.');`
    : ""
}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const variant = kiesVariant(headers().get("host"));
  // Heeft de bezoeker nog geen keuze gemaakt, dan staat de cookiebanner al in de
  // server-HTML. Tot 7 okt 2026 verscheen hij pas na het laden van JavaScript; op
  // mobiel was hij daardoor het traagste grote element (LCP, 1.630 ms
  // vertraging volgens PageSpeed).
  const cookiekeuze = toestemmingUitCookieHeader(headers().get("cookie"));
  const vraagCookiekeuze = cookiekeuze.bron === "geen_keuze";
  // Container alleen meteen laden bij een eerder gegeven toestemming (8 okt 2026,
  // variant 2). Zonder keuze of na weigeren laadt hij pas als de bezoeker in de
  // banner iets aanzet — zie laadGtm() in lib/gtm.ts.
  const metenMag = cookiekeuze.statistieken || cookiekeuze.marketing;
  const consentUpdate = metenMag
    ? // Zelfde vertaling als consentSignalen() in lib/tracking.ts (dat is een
      // client-module en mag hier niet in). Staat vóór de snippet, zodat de
      // eerste paginaweergave al met de juiste toestemming meet.
      `gtag('consent','update',${JSON.stringify({
        ad_storage: cookiekeuze.marketing ? "granted" : "denied",
        ad_user_data: cookiekeuze.marketing ? "granted" : "denied",
        ad_personalization: cookiekeuze.marketing ? "granted" : "denied",
        analytics_storage: cookiekeuze.statistieken ? "granted" : "denied",
      })});`
    : "";

  return (
    <html lang="nl" className={`${fontKop.variable} ${fontTekst.variable} ${fontAccent.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ORGANISATIE_LD }} />
        <script dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULTS }} />
        <script dangerouslySetInnerHTML={{ __html: MEETCONTEXT }} />
        {GTM_AAN && GTM_ID && metenMag && (
          <script dangerouslySetInnerHTML={{ __html: consentUpdate + gtmSnippet(GTM_ID) }} />
        )}
      </head>
      <body>
        {/* Geen noscript-variant meer (8 okt 2026): zonder JavaScript kan niemand
            toestemming geven, dus laadt de container daar ook niet. */}
        <Bouwstatus variant={variant} />
        <Kopbalk />
        {/* De keurmerkenstrip stond hier, als witte balk tussen kopbalk en hero.
            Hij staat nu onderin het paarse heroblok (zie Hero in Secties.tsx).
            Reden: als losse balk duwde hij de kop en de knop een balkhoogte naar
            beneden zonder zelf iets te verkopen. Gevolg van de verhuizing is wel
            dat de strip niet meer op de losse pagina's staat — daar is dat geen
            verlies, want op de privacyverklaring hoeft niemand overtuigd te
            worden. */}
        {children}
        <ConsentBanner direct={vraagCookiekeuze} />
      </body>
    </html>
  );
}
