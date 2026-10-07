"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/**
 * Ontwerpmodus: staat aan op de homepage sinds die op 6 okt 2026 de nieuwe
 * vormgeving kreeg (eerst alleen op /ontwerp). Waar de provider ontbreekt, is
 * de waarde false en rendert TelOpBereik gewoon de vaste tekst, zonder animatie.
 */
const OntwerpModus = createContext(false);

export function OntwerpModusAan({ children }: { children: ReactNode }) {
  return <OntwerpModus.Provider value={true}>{children}</OntwerpModus.Provider>;
}

/**
 * Een bandbreedte die vanaf nul optelt naar de uitkomst. Het eindbeeld is
 * letterlijk dezelfde tekst als zonder animatie; schermlezers krijgen alleen dat
 * eindbeeld te horen en niet de tussenstanden.
 */
export function TelOpBereik({
  min,
  max,
  opmaak,
}: {
  min: number;
  max: number;
  opmaak: (n: number) => string;
}) {
  const aan = useContext(OntwerpModus);
  const eind = `${opmaak(min)} – ${opmaak(max)}`;
  const [f, setF] = useState(aan ? 0 : 1);

  useEffect(() => {
    if (!aan) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setF(1);
      return;
    }
    const duur = 1100;
    const start = performance.now();
    let frame = requestAnimationFrame(function stap(nu) {
      const t = Math.min(1, (nu - start) / duur);
      setF(1 - Math.pow(1 - t, 3));
      if (t < 1) frame = requestAnimationFrame(stap);
    });
    return () => cancelAnimationFrame(frame);
  }, [aan, min, max]);

  if (!aan || f >= 1) return <>{eind}</>;
  return (
    <span role="img" aria-label={eind}>
      <span aria-hidden="true">
        {opmaak(Math.round(min * f))} – {opmaak(Math.round(max * f))}
      </span>
    </span>
  );
}
