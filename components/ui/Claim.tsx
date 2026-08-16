import { CLAIMS, isLive, mag, type ClaimId } from "@/lib/claims";

/**
 * De publicatiepoort in code.
 *
 * Preview: een onbevestigde claim wordt zichtbaar gemarkeerd, met regelnummer,
 * zodat je op de pagina zelf ziet wat er nog moet worden aangetoond.
 * Live (NEXT_PUBLIC_LIVE=true): een onbevestigde claim wordt NIET gerenderd.
 *
 * Dat is opzet. Bij misleidende handelspraktijken ligt de bewijslast bij de
 * handelaar (art. 6:193j BW). Wat niet bewezen is, hoort niet op de pagina —
 * en met deze component kan dat ook niet per ongeluk gebeuren.
 */
export function Claim({ id, alsWeg = null }: { id: ClaimId; alsWeg?: React.ReactNode }) {
  const regel = CLAIMS[id];
  if (!mag(id)) return <>{alsWeg}</>;
  if (isLive || regel.status === "bevestigd") return <>{regel.tekst}</>;
  return (
    <span className="placeholder" title={regel.nodig ?? ""}>
      {regel.tekst}
      <span className="placeholder-label">{regel.id}</span>
    </span>
  );
}

/**
 * Voor hele blokken die op een claim rusten (een USP-kaart, de vertrouwensbalk).
 * Valt de claim weg, dan verdwijnt het hele blok in plaats van een lege kaart.
 */
export function AlsClaim({ id, children }: { id: ClaimId; children: React.ReactNode }) {
  if (!mag(id)) return null;
  const regel = CLAIMS[id];
  const markeer = !isLive && regel.status !== "bevestigd";
  return (
    <div className={markeer ? "rounded-merk ring-2 ring-[#A08A00] ring-offset-2" : undefined}>
      {markeer && (
        <span className="placeholder-label mb-s1 ml-0 inline-block">
          {regel.id} · {regel.status}
        </span>
      )}
      {children}
    </div>
  );
}
