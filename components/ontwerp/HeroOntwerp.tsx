import type { CSSProperties } from "react";
import Calculator from "@/components/calculator/Calculator";
import Keurmerken from "@/components/Keurmerken";
import type { Variant } from "@/lib/varianten";
import EnergieStroom from "./EnergieStroom";

const v = (ms: number) => ({ "--vertraging": `${ms}ms` }) as CSSProperties;

/**
 * Hero van het ontwerpvoorbeeld.
 *
 * Het grootste verschil met de huidige hero zit niet in de beweging maar in de
 * rechterkolom: daar staat nu de rekentool zelf in plaats van een stockfoto. De
 * eerste vraag staat daarmee boven de vouw — één klik in plaats van een knop,
 * een sprong naar beneden en dan pas een klik.
 */
export default function HeroOntwerp({ variant }: { variant: Variant }) {
  return (
    <section className="relative overflow-hidden bg-paars px-s3 pb-s4 pt-s5 text-n-000 lg:pt-s6">
      {/* Twee zachte lichtvlekken die langzaam verschuiven. Dit is wat het vlak
          'levend' maakt zonder dat het ergens om aandacht vraagt. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="gloed-a absolute -left-[12%] -top-[30%] h-[620px] w-[620px] rounded-full bg-[#6B2FA8] opacity-60 blur-[110px]" />
        <div className="gloed-b absolute -bottom-[35%] right-[-8%] h-[560px] w-[560px] rounded-full bg-[#4B0C80] opacity-80 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse at 30% 40%, black 20%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse at 30% 40%, black 20%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative mx-auto grid max-w-inhoud items-start gap-s5 lg:grid-cols-[1.05fr_0.95fr] lg:gap-s6">
        <div>
          <p
            className="intro mb-s4 inline-flex items-center gap-s2 rounded-full border border-white/15 bg-white/5 px-s3 py-s1 text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-[#CBB6E8]"
            style={v(0)}
          >
            <span className="puls inline-block h-2 w-2 rounded-full bg-[#CBB6E8]" />
            Salderen stopt op 1 januari 2027
          </p>

          <h1
            className="font-semibold leading-[1.02] tracking-[-0.035em]"
            style={{ fontSize: "clamp(2.7rem, 1.3rem + 4.4vw, 4.9rem)" }}
          >
            <span className="intro block" style={v(80)}>
              Eerst rekenen.
            </span>
            <span className="intro block" style={v(200)}>
              Dan installeren.
            </span>
            <span
              className="intro mt-s2 block font-accent text-[0.52em] font-normal italic leading-[1.25] tracking-normal text-[#CBB6E8]"
              style={v(340)}
            >
              En eerlijk als het bij jou niet uitkomt.
            </span>
          </h1>

          <p className="intro mt-s4 max-w-[46ch] text-[1.08rem] leading-relaxed text-n-200" style={v(460)}>
            {variant.hero.sub}
          </p>

          <div className="intro mt-s5 hidden sm:block" style={v(600)}>
            <EnergieStroom className="h-auto w-full max-w-[520px]" />
          </div>
        </div>

        {/* De rekentool. id=calculator zodat alle bestaande knoppen op de pagina
            (#calculator) hier blijven uitkomen. */}
        <div id="calculator" className="intro scroll-mt-s5" style={v(260)}>
          <div className="mb-s3 flex items-baseline justify-between gap-s3">
            <p className="font-kop text-[1.15rem] font-semibold">Wat levert het bij jou op?</p>
            <p className="text-[0.82rem] text-n-200">Zes vragen · uitkomst direct</p>
          </div>
          {/* text-n-900: de hero zet wit als tekstkleur en de rekentool erft dat
              anders, dan staat er witte tekst op een witte kaart. */}
          <div className="rounded-merk text-n-900 shadow-[0_30px_80px_-24px_rgba(0,0,0,0.55)] [&>div]:border-0">
            <Calculator />
          </div>
          <p className="mt-s2 text-[0.82rem] text-n-200">
            Je ziet de uitkomst zonder gegevens achter te laten.
          </p>
        </div>
      </div>

      <div className="relative mx-auto mt-s5 max-w-inhoud">
        <Keurmerken />
      </div>
    </section>
  );
}
