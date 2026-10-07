import { isLive } from "@/lib/claims";

/**
 * Markering voor tekst die nog nagekeken moet worden (privacyverklaring v2.0).
 * Preview: gele markering met label, zodat het niet vergeten wordt.
 * Live: alleen de tekst zelf — de open punten staan dan nog in lib/privacy.ts.
 */
export function Nakijken({ label, children }: { label: string; children?: React.ReactNode }) {
  if (isLive) return <>{children}</>;
  return (
    <span className="placeholder">
      {children ?? "…"}
      <span className="placeholder-label">{label}</span>
    </span>
  );
}
