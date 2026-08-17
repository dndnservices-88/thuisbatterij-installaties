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
 * Consent Mode v2. Dit blok moet vóór elk ander script staan, anders telt Google
 * de eerste paginaweergave als 'granted' en klopt de hele meting niet meer.
 * Standaard alles op denied: bij weigering blijft Google geanonimiseerd doorleren.
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
  wait_for_update: 500
});
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const variant = kiesVariant(headers().get("host"));

  return (
    <html lang="nl">
      <head>
        <script dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULTS }} />
      </head>
      <body>
        <Bouwstatus variant={variant} />
        <Kopbalk />
        {children}
        <ConsentBanner />
      </body>
    </html>
  );
}
