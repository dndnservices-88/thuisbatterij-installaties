import type { CSSProperties } from "react";

/**
 * De rekensom in één beeld: overdag wekken de panelen op, de batterij laadt,
 * 's avonds brandt het licht in huis op eigen stroom. Pure SVG met CSS-animatie,
 * geen bibliotheek, een paar kilobyte. Wie beweging uit heeft staan, ziet een
 * stilstaand schema (zie ontwerp.css).
 *
 * Geen getallen in het beeld: een bedrag of percentage hier zou een claim zijn.
 */
export default function EnergieStroom({ className = "" }: { className?: string }) {
  const lijn = "rgba(203,182,232,0.75)";
  const wit = "#FEFEFE";
  const knoop = { fill: "rgba(255,255,255,0.06)", stroke: "rgba(255,255,255,0.18)" };

  return (
    <svg
      viewBox="-12 0 556 132"
      className={className}
      role="img"
      aria-label="Schema: de zon schijnt op je panelen, de thuisbatterij slaat het overschot op en 's avonds gebruik je die stroom in huis."
    >
      {/* verbindingslijn */}
      <line x1="40" y1="52" x2="470" y2="52" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
      <line className="stroom-lijn" x1="40" y1="52" x2="470" y2="52" stroke={lijn} strokeWidth="2" strokeLinecap="round" />

      {/* reizende stroomdeeltjes */}
      {[0, 1400, 2800].map((d) => (
        <circle
          key={d}
          className="stroom-bol"
          cx="40"
          cy="52"
          r="4"
          fill={wit}
          style={{ "--vertraging": `${d}ms`, filter: "drop-shadow(0 0 6px rgba(255,255,255,0.9))" } as CSSProperties}
        />
      ))}

      {/* zon */}
      <circle cx="40" cy="52" r="30" {...knoop} />
      <g className="zon-stralen" stroke={wit} strokeWidth="2" strokeLinecap="round">
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i * Math.PI) / 4;
          return (
            <line
              key={i}
              x1={40 + Math.cos(a) * 14}
              y1={52 + Math.sin(a) * 14}
              x2={40 + Math.cos(a) * 19}
              y2={52 + Math.sin(a) * 19}
            />
          );
        })}
      </g>
      <circle cx="40" cy="52" r="9" fill="none" stroke={wit} strokeWidth="2" />

      {/* panelen */}
      <circle cx="180" cy="52" r="30" {...knoop} />
      <g stroke={wit} strokeWidth="1.8" fill="none" strokeLinejoin="round">
        <polygon points="164,62 172,40 198,40 190,62" />
        <line x1="168" y1="51" x2="194" y2="51" />
        <line x1="181" y1="40" x2="177" y2="62" />
        <line x1="177" y1="62" x2="177" y2="67" />
        <line x1="171" y1="67" x2="185" y2="67" />
      </g>

      {/* thuisbatterij */}
      <circle cx="320" cy="52" r="30" {...knoop} />
      <rect x="315" y="31" width="10" height="4" rx="1.5" fill={wit} />
      <rect x="306" y="35" width="28" height="36" rx="5" fill="none" stroke={wit} strokeWidth="2" />
      <rect className="batterij-vulling" x="310" y="39" width="20" height="28" rx="2.5" fill="#CBB6E8" />

      {/* huis */}
      <circle cx="470" cy="52" r="30" {...knoop} />
      <g stroke={wit} strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round">
        <polyline points="452,54 470,38 488,54" />
        <polyline points="457,50 457,68 483,68 483,50" />
      </g>
      <rect className="huis-raam" x="464" y="54" width="12" height="9" rx="1.5" fill="#FEFEFE" fillOpacity="0.9" />

      {/* labels */}
      <g fill="#CBB6E8" fontSize="11.5" fontFamily="var(--font-tekst), system-ui, sans-serif" textAnchor="middle">
        <text x="40" y="104">Zon</text>
        <text x="180" y="104">Opwekken</text>
        <text x="320" y="104">Opslaan</text>
        <text x="470" y="104">&apos;s Avonds gebruiken</text>
      </g>
    </svg>
  );
}
