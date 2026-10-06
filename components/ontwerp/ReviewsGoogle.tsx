import { Claim } from "@/components/ui/Claim";
import { mag } from "@/lib/claims";
import { GOOGLE_PROFIEL, LIMSOLAR } from "@/lib/site";
import { Onthul } from "./Onthul";

/**
 * Reviews op basis van het openbare Google-profiel van Limsolar.
 *
 * Score, aantal en peildatum komen uit GOOGLE_PROFIEL (lib/site.ts) en staan
 * alleen live als claim V3 op "bevestigd" staat. De bezoeker kan met één klik
 * alle originele beoordelingen op Google lezen — dat is sterker dan een paar
 * uitgekozen citaten, want hij ziet ook de mindere.
 *
 * Er staan hier bewust geen losse reviewteksten. De voorbeeldreviews uit de
 * oude sectie zijn verzonnen en mogen nooit live (claimregister V5). Wil je
 * echte reviews als citaat tonen: kies ze op Google, plak de tekst letterlijk
 * met voornaam en initiaal in GOOGLE_CITATEN hieronder, en vermeld de maand.
 */
type Citaat = { naam: string; maand: string; tekst: string };
const GOOGLE_CITATEN: Citaat[] = [];

const nl = (n: number) => new Intl.NumberFormat("nl-NL").format(n);

export default function ReviewsGoogle() {
  if (!mag("V3")) return null;
  const { score, aantal, peildatum, url } = GOOGLE_PROFIEL;
  const vulling = `${Math.max(0, Math.min(100, (score / 5) * 100))}%`;

  return (
    <section id="reviews" className="bg-paars-tint px-s3 py-s5 sm:py-s6">
      <div className="mx-auto max-w-inhoud">
        <Onthul>
          <p className="mb-s3 inline-flex items-center gap-s2 text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-paars">
            <span className="inline-block h-2 w-2 rounded-full bg-paars" /> Ervaringen
          </p>
          <h2 className="max-w-[22ch]">
            Wat klanten over de installateur zeggen.{" "}
            <span className="kop-licht">Rechtstreeks van Google.</span>
          </h2>
          <p className="mt-s3 max-w-lees text-n-500">
            Deze beoordelingen gaan over {LIMSOLAR.naam}, de partij die de installatie uitvoert —
            niet over de berekening op deze pagina. Je hoort te weten wie er straks bij je thuis
            staat.
          </p>
        </Onthul>

        <div className="mt-s5 grid gap-s3 lg:grid-cols-[0.9fr_1.1fr]">
          <Onthul>
            <div className="til flex h-full flex-col justify-between rounded-[18px] bg-n-000 p-s5 shadow-[0_24px_60px_-34px_rgba(55,0,96,0.5)]">
              <div>
                <p className="text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-n-500">
                  Google-beoordeling
                </p>
                <div className="mt-s3 flex items-end gap-s3">
                  <span className="font-kop text-[4.2rem] font-semibold leading-none tracking-[-0.04em] text-paars">
                    {nl(score)}
                  </span>
                  <span className="mb-s2 text-[1rem] text-n-500">van 5</span>
                </div>
                {/* Sterren naar verhouding gevuld: 4,8 is niet 5. Paars en geen
                    geel — geel is op deze site voorbehouden aan de doorgaan-knop. */}
                <div
                  className="relative mt-s2 inline-block text-[1.6rem] leading-none tracking-[2px]"
                  aria-label={`${nl(score)} van de 5 sterren`}
                >
                  <span aria-hidden="true" className="text-n-200">
                    ★★★★★
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 overflow-hidden whitespace-nowrap text-paars"
                    style={{ width: vulling }}
                  >
                    ★★★★★
                  </span>
                </div>
                <p className="mt-s3 text-[0.95rem] text-n-900">
                  <Claim id="V3" />
                </p>
              </div>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-s4 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-merk border border-paars px-s4 font-kop text-[0.98rem] font-semibold text-paars transition hover:bg-paars hover:text-n-000"
              >
                Lees alle {aantal} beoordelingen op Google ↗
              </a>
            </div>
          </Onthul>

          <Onthul vertraging={120}>
            <div className="flex h-full flex-col justify-center rounded-[18px] border border-paars/15 bg-n-000/60 p-s5">
              {GOOGLE_CITATEN.length > 0 ? (
                <ul className="grid gap-s3">
                  {GOOGLE_CITATEN.map((c) => (
                    <li key={c.naam + c.maand} className="rounded-merk bg-n-000 p-s3">
                      <blockquote className="text-[0.95rem] leading-relaxed">{c.tekst}</blockquote>
                      <p className="mt-s2 text-[0.82rem] text-n-500">
                        {c.naam} · {c.maand} · via Google
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <>
                  <p className="font-kop text-[1.35rem] font-semibold leading-snug">
                    {/* "over Limsolar" en niet "over ons": de reviews gaan over de
                        installateur, niet over Thuisbatterij-installaties. */}
                    Lees zelf wat klanten over Limsolar zeggen.
                  </p>
                  <p className="mt-s2 text-[0.95rem] leading-relaxed text-n-500">
                    Op het openbare Google-profiel van {LIMSOLAR.naam} lees je ze allemaal.
                    Peildatum van de score: {peildatum}.
                  </p>
                </>
              )}
              {mag("V4") && (
                <p className="mt-s4 border-t border-paars/10 pt-s3 text-[0.82rem] leading-relaxed text-n-500">
                  <Claim id="V4" />
                </p>
              )}
            </div>
          </Onthul>
        </div>
      </div>
    </section>
  );
}
