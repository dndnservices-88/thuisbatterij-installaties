/**
 * Tag Manager pas laden ná toestemming (besluit 8 okt 2026, "variant 2" van de
 * privacyverklaring; juridische chat dossier 6, punt 2).
 *
 * Tot 8 okt laadde de container altijd en stuurden de Google-tags vóór
 * toestemming pings zonder cookies (consent mode "advanced"). Het voordeel
 * daarvan — conversiemodellering per adverteerder — begint pas bij 700
 * advertentieklikken per dag (Google Ads Help 10548233). Dat haalt deze site
 * niet, dus de container blijft nu dicht tot de bezoeker in de banner
 * statistieken of marketing aanzet.
 *
 * Twee manieren van laden, één grendel:
 *  - terugkerende bezoeker met toestemming: de server zet de snippet al in de
 *    <head> (app/layout.tsx), zodat de paginaweergave zonder vertraging meet;
 *  - eerste keuze in de banner: laadGtm() hieronder voegt hem in de browser toe.
 * window.__tbiGtm voorkomt dat hij twee keer laadt.
 *
 * Welke tags daarna mogen vuren, bepaalt de container per tag via de
 * toestemmingsinstellingen (Google Ads: ad_storage; GA4: analytics_storage).
 */
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

/**
 * Vercel vult dit met "production", "preview" of "development" — maar alléén als
 * "Automatically expose System Environment Variables" aanstaat. Zonder die
 * waarde laadt de container ook in productie niet (zie de waarschuwing in
 * app/layout.tsx).
 */
export const OMGEVING = process.env.NEXT_PUBLIC_VERCEL_ENV;

/** Alleen productie, of een preview waarop bewust NEXT_PUBLIC_GTM_IN_PREVIEW=true staat. */
export const GTM_AAN =
  Boolean(GTM_ID) &&
  (OMGEVING === "production" || process.env.NEXT_PUBLIC_GTM_IN_PREVIEW === "true");

// Functie en geen constante: anders staat het containeradres met de tekst
// "undefined" erin sowieso in de bundel, ook in een bouw zonder container.
export const gtmSnippet = (id: string) => `
window.__tbiGtm = true;
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');
`;

declare global {
  interface Window {
    __tbiGtm?: boolean;
  }
}

/** Laadt de container in de browser, één keer. Doet niets buiten productie (zie GTM_AAN). */
export function laadGtm() {
  if (typeof window === "undefined" || !GTM_AAN || !GTM_ID) return;
  if (window.__tbiGtm) return;
  const s = document.createElement("script");
  s.text = gtmSnippet(GTM_ID);
  document.head.appendChild(s);
}
