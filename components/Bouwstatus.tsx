import { claimStand, isLive } from "@/lib/claims";
import { ENTITEIT } from "@/lib/site";
import { PEILDATUM_TARIEVEN } from "@/lib/calc";
import type { Variant } from "@/lib/varianten";

/**
 * Balk bovenaan de preview met wat er nog open staat. Verdwijnt volledig zodra
 * NEXT_PUBLIC_LIVE=true — dan is de site ook pas bedoeld om te tonen.
 */
export default function Bouwstatus({ variant }: { variant: Variant }) {
  if (isLive) return null;
  const stand = claimStand();

  const punten = [
    `Variant: ${variant.id} (${variant.domein})`,
    `Claims: ${stand.bevestigd} bevestigd, ${stand.toegezegd} toegezegd, ${stand.open} open`,
    `Tarieven: ${PEILDATUM_TARIEVEN}`,
    ENTITEIT.ingevuld ? `Entiteit: ${ENTITEIT.naam}` : "Entiteit: nog niet gekozen",
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
