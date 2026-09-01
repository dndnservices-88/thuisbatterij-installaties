import { claimStand, isLive } from "@/lib/claims";
import { CONTACT, ENTITEIT } from "@/lib/site";
import { PEILDATUM_TARIEVEN } from "@/lib/calc";
import type { Variant } from "@/lib/varianten";

/**
 * Balk bovenaan de preview met wat er nog open staat. Verdwijnt volledig zodra
 * NEXT_PUBLIC_LIVE=true — dan is de site ook pas bedoeld om te tonen.
 */
/**
 * Meet deze omgeving, en zo nee waarom niet. Staat er een container-ID ingevuld
 * terwijl de snippet niet laadt, dan is dat meestal de bedoeling (preview) —
 * maar niet altijd, en het verschil moet je kunnen zien zonder de broncode.
 */
function meetstatus(): string {
  const id = process.env.NEXT_PUBLIC_GTM_ID;
  const omgeving = process.env.NEXT_PUBLIC_VERCEL_ENV;
  if (!id) return "Meting: geen GTM-container ingevuld";
  if (omgeving === undefined)
    return "⚠ Meting: NEXT_PUBLIC_VERCEL_ENV leeg — systeemvariabelen aanzetten in Vercel";
  if (omgeving === "production") return `Meting: container actief (${omgeving})`;
  if (process.env.NEXT_PUBLIC_GTM_IN_PREVIEW === "true")
    return `Meting: container bewust AAN op ${omgeving} — na het testen weer uitzetten`;
  return `Meting: container uit op ${omgeving}, alleen actief in productie`;
}

export default function Bouwstatus({ variant }: { variant: Variant }) {
  if (isLive) return null;
  const stand = claimStand();

  const punten = [
    `Variant: ${variant.id} (${variant.domein})`,
    `Claims: ${stand.bevestigd} bevestigd, ${stand.toegezegd} toegezegd, ${stand.open} open`,
    `Tarieven: ${PEILDATUM_TARIEVEN}`,
    ENTITEIT.ingevuld ? `Entiteit: ${ENTITEIT.naam}` : "Entiteit: nog niet gekozen",
    CONTACT.telefoon_fictief
      ? "⚠ Telefoonnummer is fictief — bevestigingsmail staat uit"
      : `Telefoon: ${CONTACT.telefoon}`,
    meetstatus(),
  ];

  return (
    <div className="bg-paars-donker px-s3 py-s2 text-[0.78rem] text-n-000">
      <div className="mx-auto flex max-w-inhoud flex-wrap items-center gap-x-s4 gap-y-s1">
        <strong className="font-kop uppercase tracking-wide text-geel">Preview — niet live</strong>
        {punten.map((p) => (
          <span key={p}>{p}</span>
        ))}
        <span className="opacity-70">
          Gearceerde tekst = claim nog niet aangetoond; die verdwijnt automatisch in live-modus.
        </span>
      </div>
    </div>
  );
}
