import type { Metadata } from "next";
import { headers } from "next/headers";

// Lettertypen via npm in plaats van de Google Fonts CDN: geen externe aanroep bij
// elk bezoek, geen extra verbinding, en het werkt ook achter een proxy.
import "@fontsource/work-sans/400.css";
import "@fontsource/work-sans/600.css";
import "@fontsource/work-sans/800.css";
import "@fontsource/open-sans/400.css";
import "@fontsource/open-sans/600.css";
import "@fontsource/libre-baskerville/400-italic.css";

import "./globals.css";
import ConsentBanner from "@/components/ConsentBanner";
import Bouwstatus from "@/components/Bouwstatus";
import Kopbalk from "@/components/Kopbalk";
import Keurmerken from "@/components/Keurmerken";
import { kiesVariant } from "@/lib/varianten";

export const metadata: Metadata = {
  title: "Thuisbatterij Installaties — eerst rekenen, dan installeren",
  description:
    "Reken in twee minuten uit wat een thuisbatterij in jouw situatie oplevert. Eerlijke bandbreedte, ook als hij er bij jou niet uitkomt.",
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
 * Staat NEXT_PUBLIC_GTM_ID niet ingevuld, dan komt er geen snippet en meet de
 * site niets. Dat is de bedoeling zolang de container niet bestaat — een halve
 * meetopstelling is erger dan geen, want dan denk je dat je cijfers hebt.
 */
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

// Functie en geen constante: anders staat het containeradres met de tekst
// "undefined" erin sowieso in de bundel, ook in een bouw zonder container.
const gtmSnippet = (id: string) => `
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const variant = kiesVariant(headers().get("host"));

  return (
    <html lang="nl">
      <head>
        <script dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULTS }} />
        {GTM_ID && <script dangerouslySetInnerHTML={{ __html: gtmSnippet(GTM_ID) }} />}
      </head>
      <body>
        {/* De noscript-variant hoort direct achter de body-opening. Hij vangt
            bezoekers zonder JavaScript op; die tellen niet mee in GA4 maar wel
            in de paginaweergaven, en zonder dit blok mist Google Ads ze
            helemaal. */}
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Tag Manager"
            />
          </noscript>
        )}
        <Bouwstatus variant={variant} />
        <Kopbalk />
        {/* Staat in de layout en niet in page.tsx, omdat de balk bij de afzender
            hoort en niet bij het aanbod: hij moet op élke pagina onder het logo
            staan, ook op de privacyverklaring. */}
        <Keurmerken />
        {children}
        <ConsentBanner />
      </body>
    </html>
  );
}
