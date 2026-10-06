import type { CSSProperties, ReactNode } from "react";
import { Claim } from "@/components/ui/Claim";
import { CLAIMS, isLive, mag, type ClaimId } from "@/lib/claims";
import { NL_KAART } from "./nlKaart";
import { Onthul } from "./Onthul";

/**
 * "Wat je van ons mag verwachten" in de nieuwe vormgeving.
 *
 * Elke kaart hangt aan een claim uit het register en verschijnt alleen als die
 * claim getoond mag worden — net als in de oude USP-sectie. De laagsteprijs-
 * garantie (P1) is eruit: die bestaat niet (claimregister, 6 okt 2026).
 *
 * Het blok "Heel Nederland" krijgt een stippenkaart met Zwaag als vertrekpunt.
 * Geen foto's: de beschikbare beelden zijn stockfoto's van industriële
 * installaties, en die maken een pagina goedkoper in plaats van beter.
 */

type Kaart = { id: ClaimId; titel: string; icoon: ReactNode };

const lijn = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const KAARTEN: Kaart[] = [
  {
    id: "U1",
    titel: "Snel geïnstalleerd",
    icoon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
        <circle cx="12" cy="13" r="8" {...lijn} />
        <path d="M12 9v4l2.5 2.5M9 2h6" {...lijn} />
      </svg>
    ),
  },
  {
    id: "U4",
    titel: "Garantie op de installatie",
    icoon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
        <path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3z" {...lijn} />
        <path d="M9 12l2 2 4-4" {...lijn} />
      </svg>
    ),
  },
  {
    id: "V1",
    titel: "Aangesloten en verzekerd",
    icoon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
        <rect x="3" y="10" width="18" height="11" rx="2" {...lijn} />
        <path d="M7 10V7a5 5 0 0110 0v3" {...lijn} />
      </svg>
    ),
  },
  {
    id: "U10",
    titel: "Btw-begeleiding",
    icoon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
        <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" {...lijn} />
        <path d="M9 14l6-6M9.5 8.5h.01M14.5 13.5h.01" {...lijn} />
      </svg>
    ),
  },
  {
    id: "U12",
    titel: "Vrijblijvend advies",
    icoon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
        <path d="M3 11l9-7 9 7" {...lijn} />
        <path d="M5 10v10h14V10" {...lijn} />
        <path d="M10 20v-5h4v5" {...lijn} />
      </svg>
    ),
  },
];

export default function VerwachtingenOntwerp() {
  const kaarten = KAARTEN.filter((k) => mag(k.id));
  const kaartNl = mag("U9");
  if (kaarten.length === 0 && !kaartNl) return null;

  return (
    <section id="usp" className="bg-n-100 px-s3 py-s5 sm:py-s6">
      <div className="mx-auto max-w-inhoud">
        <Onthul>
          <p className="mb-s3 inline-flex items-center gap-s2 text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-paars">
            <span className="inline-block h-2 w-2 rounded-full bg-paars" /> Waarom via ons
          </p>
          <h2 className="max-w-[22ch]">
            Wat je van ons mag verwachten.{" "}
            <span className="kop-licht">Zonder superlatieven.</span>
          </h2>
        </Onthul>

        <div className="mt-s5 grid gap-s3 lg:grid-cols-[1fr_1.15fr]">
          {kaartNl && (
            <Onthul>
              <HeelNederland />
            </Onthul>
          )}

          <div className="grid gap-s3 sm:grid-cols-2">
            {kaarten.map((k, i) => (
              <Onthul key={k.id} vertraging={80 + i * 90}>
                <Markering id={k.id}>
                  <div className="til flex h-full flex-col rounded-[16px] border border-n-200 bg-n-000 p-s4">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-paars-tint text-paars">
                      {k.icoon}
                    </span>
                    <h3 className="mt-s3 text-[1.15rem]">{k.titel}</h3>
                    <p className="mt-s1 text-[0.92rem] leading-relaxed text-n-500">
                      <Claim id={k.id} />
                    </p>
                  </div>
                </Markering>
              </Onthul>
            ))}
            <Onthul vertraging={80 + kaarten.length * 90}>
              <a
                href="#calculator"
                className="til flex h-full flex-col justify-between rounded-[16px] bg-paars p-s4 text-n-000"
              >
                <span className="text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-[#CBB6E8]">
                  Eerst rekenen
                </span>
                <span className="mt-s4 font-kop text-[1.35rem] font-semibold leading-tight">
                  Zie in twee minuten wat het bij jou oplevert →
                </span>
              </a>
            </Onthul>
          </div>
        </div>

        <p className="mt-s4 max-w-lees text-[0.85rem] text-n-500">
          Wat hier staat, staat er in de formulering die we kunnen aantonen — inclusief de nuance.
        </p>
      </div>
    </section>
  );
}

/** Preview-markering voor een kaart waarvan de claim nog niet bevestigd is. */
function Markering({ id, children }: { id: ClaimId; children: ReactNode }) {
  const open = !isLive && CLAIMS[id].status !== "bevestigd";
  if (!open) return <>{children}</>;
  return (
    <div className="h-full rounded-[16px] ring-2 ring-[#A08A00] ring-offset-2">
      <span className="placeholder-label mb-s1 ml-0 inline-block">
        {id} · {CLAIMS[id].status}
      </span>
      {children}
    </div>
  );
}

function HeelNederland() {
  const { breedte, hoogte, zwaag, stippen } = NL_KAART;
  const getallen = stippen.split(",").map(Number);
  const punten: [number, number][] = [];
  for (let i = 0; i < getallen.length; i += 2) punten.push([getallen[i], getallen[i + 1]]);

  return (
    <Markering id="U9">
      <div className="relative flex h-full flex-col overflow-hidden rounded-[18px] bg-paars p-s4 text-n-000 sm:p-s5">
        <div
          aria-hidden="true"
          className="gloed-a pointer-events-none absolute -right-[20%] -top-[20%] h-[420px] w-[420px] rounded-full bg-[#6B2FA8] opacity-50 blur-[90px]"
        />
        <div className="relative">
          <p className="text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-[#CBB6E8]">
            Werkgebied
          </p>
          <h3 className="mt-s2 font-kop text-[1.9rem] font-semibold leading-tight tracking-[-0.02em]">
            Heel Nederland
          </h3>
          <p className="mt-s2 max-w-[34ch] text-[0.95rem] leading-relaxed text-n-200">
            <Claim id="U9" />. Vanuit Zwaag, door het hele land.
          </p>
        </div>

        <svg
          viewBox={`0 0 ${breedte} ${hoogte}`}
          className="relative mx-auto mt-s4 h-auto w-full max-w-[300px]"
          role="img"
          aria-label="Kaart van Nederland met Zwaag als vestigingsplaats van Limsolar"
        >
          {punten.map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={2.6}
              fill="#CBB6E8"
              className="kaart-stip"
              style={{ "--vertraging": `${Math.round(y * 2.2)}ms` } as CSSProperties}
            />
          ))}
          <circle cx={zwaag[0]} cy={zwaag[1]} r={14} fill="#FEFEFE" className="kaart-golf" />
          <circle cx={zwaag[0]} cy={zwaag[1]} r={5.5} fill="#FEFEFE" stroke="#370060" strokeWidth={2} />
          <text
            x={zwaag[0] - 12}
            y={zwaag[1] + 4}
            textAnchor="end"
            fontSize="12"
            fontWeight="600"
            fill="#FEFEFE"
            fontFamily="var(--font-tekst), system-ui, sans-serif"
          >
            Zwaag
          </text>
        </svg>
      </div>
    </Markering>
  );
}
