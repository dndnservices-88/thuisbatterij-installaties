"use client";

import { Analytics } from "@vercel/analytics/next";

/**
 * Vercel Web Analytics — bezoekersstatistieken zonder cookies.
 *
 * Prikbord r. 63/64 (akkoord D. 17 nov 19:19), juridische chat stap 1 §4:
 * mag zonder toestemming onder art. 11.7a lid 3 sub b Tw (analytisch, geringe
 * gevolgen), mits niets op het apparaat, geen koppeling aan aanvragen of
 * advertenties en geen persoonsgegevens in gebeurtenissen. Privacyverklaring 2.5.
 *
 * Daarom draait dit buiten de cookiebanner om, maar zonder querystring en
 * zonder #: anders zouden gclid/fbclid/gbraid en utm-waarden van advertenties
 * bij Vercel terechtkomen, en dat is precies de koppeling aan advertenties
 * die niet mag. Alleen het pad blijft over.
 *
 * Telt pas als Web Analytics in het Vercel-project op "Enable" staat (D.).
 */
export default function BezoekersStatistiek() {
  return (
    <Analytics
      beforeSend={(event) => {
        try {
          const u = new URL(event.url);
          return { ...event, url: u.origin + u.pathname };
        } catch {
          return null;
        }
      }}
    />
  );
}
