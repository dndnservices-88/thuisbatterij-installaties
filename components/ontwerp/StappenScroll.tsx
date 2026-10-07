"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { KnopLink } from "@/components/ui/Knop";
// advies-opname staat sinds 6 okt 2026 in de hero; hier de meterkastmeting,
// die ook beter past bij "we kijken naar de meterkast".
import fotoMeterkast from "@/public/beeld/meterkast-meting-1600.webp";
import fotoBatterij from "@/public/beeld/thuisbatterij-buitenmuur-1600.webp";


type Stap = {
  kort: string;
  titel: string;
  tekst: string;
  punten: string[];
  beeld: ReactNode;
  /** Knop die naar de rekentool in de hero springt. Sinds 7 okt 2026 bij elke stap (besluit Dieudonné). */
  knop?: string;
};

/**
 * Stap 4 zegt bewust níét meer "aanmelding bij de netbeheerder en de garantie
 * worden geregeld", zoals de huidige homepage wel doet. Beide zijn claims die
 * nog open staan (U4 en U8), en over U8 is zelfs onduidelijk wie de aanmelding
 * doet. Een ontwerp mag geen claim binnensmokkelen die de claimpoort op de
 * homepage wel tegenhoudt.
 */
const STAPPEN: Stap[] = [
  {
    kort: "Rekenen",
    titel: "Je maakt de berekening",
    tekst: "Zes vragen over je panelen, je verbruik en je contract. Je ziet meteen een bandbreedte — zonder gegevens achter te laten.",
    punten: ["Twee minuten", "Uitkomst direct in beeld"],
    knop: "Bereken mijn situatie",
    beeld: <NepRekentool />,
  },
  {
    kort: "Gesprek",
    titel: "Wij bellen je op het gekozen dagdeel",
    tekst: "Een gesprek van een minuut of tien. We lopen je berekening samen na en beantwoorden je vragen.",
    punten: ["Jij kiest het dagdeel", "Je berekening samen nalopen", "Alleen met jouw toestemming"],
    knop: "Bereken mijn situatie",
    beeld: <NepGesprek />,
  },
  {
    kort: "Advies",
    titel: "Adviesgesprek bij je thuis",
    tekst: "Alleen als het zinvol is. We kijken naar de meterkast, het verbruikspatroon en de plek voor de batterij.",
    punten: ["Meterkast en aansluiting", "Plek voor de batterij", "Capaciteit die past"],
    knop: "Bereken mijn situatie",
    beeld: <Foto src={fotoMeterkast} alt="Monteur meet met een multimeter aan een groepenkast" />,
  },
  {
    kort: "Installatie",
    titel: "Installatie door Limsolar",
    tekst: "Welk systeem het wordt en wat het kost, staat vooraf op papier. Daarna plant Limsolar de installatie in.",
    punten: ["Prijs vooraf op papier", "Uitgevoerd door Limsolar", "Planning in overleg"],
    knop: "Bereken mijn situatie",
    beeld: <Foto src={fotoBatterij} alt="Een thuisbatterij tegen een buitenmuur, met de omvormer erboven" />,
  },
];

export default function StappenScroll() {
  const [actief, setActief] = useState(0);
  const sectie = useRef<HTMLElement>(null);
  const lijn = useRef<HTMLDivElement>(null);
  const stappen = useRef<(HTMLElement | null)[]>([]);

  // Welke stap staat er in het midden van het scherm?
  useEffect(() => {
    const io = new IntersectionObserver(
      (items) => {
        for (const e of items) {
          if (e.isIntersecting) setActief(Number((e.target as HTMLElement).dataset.stap));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    stappen.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  // Voortgangslijn over de hele sectie, zonder rerender per scrollstap.
  useEffect(() => {
    let frame = 0;
    const werkBij = () => {
      frame = 0;
      const el = sectie.current;
      if (!el || !lijn.current) return;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.5 - r.top) / r.height));
      lijn.current.style.transform = `scaleX(${p})`;
    };
    const opScroll = () => {
      if (!frame) frame = requestAnimationFrame(werkBij);
    };
    werkBij();
    window.addEventListener("scroll", opScroll, { passive: true });
    window.addEventListener("resize", opScroll);
    return () => {
      window.removeEventListener("scroll", opScroll);
      window.removeEventListener("resize", opScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const naar = (i: number) =>
    stappen.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" });

  return (
    <section ref={sectie} id="hoe" className="bg-n-100 px-s3 py-s5 sm:py-s6">
      <div className="mx-auto max-w-inhoud">
        <header className="mb-s5 max-w-[22ch] lg:max-w-none">
          <p className="mb-s3 inline-flex items-center gap-s2 text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-paars">
            <span className="inline-block h-2 w-2 rounded-full bg-paars" /> Hoe het werkt
          </p>
          <h2>
            Van berekening tot installatie.
            <br />
            <span className="kop-licht">Vier stappen, je weet vooraf wat er gebeurt.</span>
          </h2>
        </header>

        <div className="grid gap-s5 lg:grid-cols-[1.08fr_1fr] lg:gap-s6">
          {/* Links: blijft staan en wisselt mee. Alleen vanaf desktop; op een
              telefoon staat het beeld gewoon bij elke stap. */}
          <div className="hidden lg:block">
            <div className="sticky top-[88px]">
              <div className="relative overflow-hidden rounded-[18px] bg-paars shadow-[0_24px_60px_-28px_rgba(55,0,96,0.6)]">
                <div className="absolute inset-x-0 top-0 z-10 h-[3px] bg-white/15">
                  <div ref={lijn} className="h-full origin-left bg-[#CBB6E8]" style={{ transform: "scaleX(0)" }} />
                </div>
                <div className="relative aspect-[4/3.4]">
                  {STAPPEN.map((s, i) => (
                    <div
                      key={s.titel}
                      aria-hidden={i !== actief}
                      className="stap-beeld absolute inset-0"
                      style={{
                        opacity: i === actief ? 1 : 0,
                        transform: i === actief ? "scale(1)" : "scale(1.04)",
                      }}
                    >
                      {s.beeld}
                    </div>
                  ))}
                </div>
              </div>

              <ol className="mt-s3 grid grid-cols-4 gap-s2">
                {STAPPEN.map((s, i) => (
                  <li key={s.kort}>
                    <button
                      type="button"
                      onClick={() => naar(i)}
                      className={`flex w-full items-center gap-s2 rounded-full px-s2 py-s1 text-left text-[0.85rem] transition ${
                        i === actief ? "font-semibold text-paars" : "text-n-500 hover:text-paars"
                      }`}
                    >
                      <span
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[0.75rem] transition ${
                          i === actief ? "border-paars bg-paars text-n-000" : "border-n-200 bg-n-000"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {s.kort}
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Rechts: de stappen zelf. Elke stap krijgt ruimte, zodat het beeld
              links de tijd heeft om te wisselen. */}
          <div>
            {STAPPEN.map((s, i) => (
              <article
                key={s.titel}
                ref={(el) => {
                  stappen.current[i] = el;
                }}
                data-stap={i}
                className="flex flex-col justify-center py-s5 transition-opacity duration-500 lg:min-h-[72vh]"
                style={{ opacity: i === actief ? 1 : 0.38 }}
              >
                <div className="mb-s4 overflow-hidden rounded-[14px] bg-paars lg:hidden">
                  <div className="relative aspect-[4/3]">{s.beeld}</div>
                </div>
                <span
                  className="font-kop text-[4.5rem] font-semibold leading-none tracking-[-0.04em] text-transparent"
                  style={{ WebkitTextStroke: "1.5px #7B4FAF" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-s3 font-kop text-[1.75rem] font-semibold leading-tight tracking-[-0.02em] sm:text-[2.1rem]">
                  {s.titel}
                </h3>
                <p className="mt-s3 max-w-[46ch] text-[1.02rem] leading-relaxed text-n-500">{s.tekst}</p>
                <ul className="mt-s4 flex flex-wrap gap-s2">
                  {s.punten.map((p) => (
                    <li
                      key={p}
                      className="rounded-full border border-n-200 bg-n-000 px-s3 py-s1 text-[0.85rem] text-n-900"
                    >
                      {p}
                    </li>
                  ))}
                </ul>
                {s.knop && (
                  // Het enige gele element in deze sectie: de doorgaan-knop uit het
                  // brandbook. Springt naar de rekentool bovenaan (#calculator).
                  <div className="mt-s4 max-w-[340px]">
                    <KnopLink href="#calculator" volleBreedte>
                      {s.knop} →
                    </KnopLink>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Beelden per stap ─────────────────────────────────────────────────────── */

function Foto({ src, alt }: { src: StaticImageData; alt: string }) {
  return (
    <figure className="absolute inset-0">
      <Image src={src} alt={alt} fill placeholder="blur" sizes="(min-width: 1024px) 600px, 100vw" className="object-cover" />
    </figure>
  );
}

/** Geen screenshot maar een nagebouwde vraag. Bewust zonder bedragen: een
 *  getal in een illustratie leest als een belofte. */
function NepRekentool() {
  return (
    <div className="absolute inset-0 grid place-items-center p-s5">
      <div className="w-full max-w-[380px] rounded-merk bg-n-000 p-s4 text-n-900 shadow-2xl">
        <div className="flex justify-between text-[0.72rem] font-semibold uppercase tracking-wide text-n-500">
          <span>Vraag 3 van 6</span>
        </div>
        <div className="mt-s2 h-[6px] overflow-hidden rounded-full bg-n-200">
          <div className="nep-voortgang h-full rounded-full bg-paars" />
        </div>
        <p className="mt-s4 font-kop text-[1.15rem] font-semibold">Hoeveel stroom verbruik je per jaar?</p>
        <div className="mt-s3 grid gap-s2">
          {["Ik weet het precies", "Schatting op gezinsgrootte"].map((t, i) => (
            <div
              key={t}
              className={`rounded-merk border px-s3 py-s2 text-[0.9rem] ${
                i === 0 ? "border-paars bg-paars-tint font-semibold text-paars" : "border-n-200"
              }`}
            >
              {t}
            </div>
          ))}
        </div>
        <div className="mt-s4 rounded-merk border border-paars/30 bg-paars-tint p-s3">
          <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-n-500">Jouw indicatie per jaar</p>
          <div className="mt-s2 flex gap-s2">
            <span className="h-4 w-20 rounded bg-paars/25" />
            <span className="h-4 w-4 rounded bg-transparent text-center text-[0.8rem] leading-4 text-paars">–</span>
            <span className="h-4 w-20 rounded bg-paars/25" />
          </div>
        </div>
      </div>
    </div>
  );
}

function NepGesprek() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-paars to-[#240040] p-s5">
      <div className="w-full max-w-[320px] rounded-[26px] border border-white/15 bg-white/10 p-s4 text-center text-n-000 backdrop-blur">
        <div className="puls mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#CBB6E8] text-paars">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden="true">
            <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z" />
          </svg>
        </div>
        <p className="mt-s4 text-[0.75rem] uppercase tracking-[0.14em] text-[#CBB6E8]">Op jouw gekozen dagdeel</p>
        <p className="mt-s1 font-kop text-[1.3rem] font-semibold">Thuisbatterij Installaties</p>
        <div className="golf mx-auto mt-s4 flex h-10 items-center justify-center gap-[5px]" aria-hidden="true">
          {Array.from({ length: 14 }).map((_, i) => (
            <span
              key={i}
              className="h-full w-[4px] rounded-full bg-white/80"
              style={{ animationDelay: `${(i % 7) * 110}ms` }}
            />
          ))}
        </div>
        <p className="mt-s4 text-[0.85rem] text-n-200">± 10 minuten · we lopen je berekening samen na</p>
      </div>
    </div>
  );
}
