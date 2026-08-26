"use client";

import { opendCookievoorkeuren } from "@/lib/tracking";

/**
 * De weg terug. Staat in de voettekst naast de privacyverklaring.
 *
 * Eigen componentje omdat Secties.tsx een servercomponent is en dit een
 * klikhandler nodig heeft. Een knop en geen link: er wordt niet genavigeerd,
 * er wordt een venster geopend — en een schermlezer hoort dat verschil.
 */
export default function Cookievoorkeuren() {
  return (
    <button type="button" onClick={opendCookievoorkeuren} className="underline">
      Cookievoorkeuren wijzigen
    </button>
  );
}
