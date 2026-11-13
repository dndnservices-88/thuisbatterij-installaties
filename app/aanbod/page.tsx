import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Sectie } from "@/components/ui/Sectie";
import { Footer } from "@/components/secties/Secties";
import { AlsClaim, Claim } from "@/components/ui/Claim";
import { KnopLink } from "@/components/ui/Knop";
import { AANBOD } from "@/lib/aanbod";
import { euro } from "@/lib/calc";
import { mag } from "@/lib/claims";
import { CONTACT, LIMSOLAR } from "@/lib/site";
import AanbodTerugbel from "./AanbodTerugbel";
import Calculator from "@/components/calculator/Calculator";

export const metadata: Metadata = {
  title: "Ons aanbod — thuisbatterij inclusief installatie | Thuisbatterij Installaties",
  description:
    "Thuisbatterijen voor 1-fase en 3-fase, met vanaf-prijzen inclusief btw en installatie door Limsolar. Reken uit wat het jou oplevert of laat je terugbellen.",
  alternates: { canonical: "/aanbod" },
};

const kwh = (n: number) => new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 2 }).format(n);

/**
 * Aanbodpagina (13 nov 2026, verzoek Dieudonné: knop "Bekijk het aanbod").
 * Prijzen uit de prijslijst Limsolar 13 okt × 1,21 (claim P8), geen merknamen
 * (besluit P6). Elke kaart: "Bel mij terug" (formulier onderaan) en "Reken uit".
 */
export default function Aanbod() {
  // Inbegrepen: op elke kaart, direct onder de prijzen (Dieudonné 13 nov: "in
  // één oogopslag bij de prijzen", geen apart blok). Elke claim langs mag().
  const inbegrepen: React.ReactNode[] = [
    <>Installatie door {LIMSOLAR.naam}</>,
    ...(mag("U3") ? [<Claim key="u3" id="U3" />] : []),
    ...(mag("U4") ? [<Claim key="u4" id="U4" />] : []),
    ...(mag("V1") ? [<Claim key="v1" id="V1" />] : []),
  ];

  return (
    <main>
      {/* Kop met de rekentool er direct naast (Dieudonné 13 nov: "reken uit wat
          het jou oplevert" meteen kunnen beginnen). */}
      <section className="bg-paars px-s3 py-s5 text-n-000 sm:py-s6">
        <div className="mx-auto grid max-w-inhoud items-start gap-s5 lg:grid-cols-[1.05fr_0.95fr] lg:gap-s6">
          <div>
            <Link href="/" className="text-[0.9rem] font-semibold text-[#CBB6E8] underline">
              ← Naar de startpagina
            </Link>
            <h1 className="mt-s3 max-w-[22ch] text-n-000">Thuisbatterij inclusief installatie</h1>
            <p className="mt-s3 max-w-[52ch] text-[1.05rem] leading-relaxed text-n-200">
              Voor elke aansluiting een passende batterij. Alle prijzen zijn vanaf-prijzen, inclusief
              btw en inclusief installatie door {LIMSOLAR.naam} Reken hiernaast uit wat het jou
              oplevert, of laat je terugbellen.
            </p>
            <div className="mt-s4 flex flex-wrap gap-s2">
              <KnopLink href="#terugbellen">Bel mij terug</KnopLink>
              <Link
                href="#prijzen"
                className="inline-flex min-h-[52px] items-center rounded-merk border border-white/40 px-s4 font-kop font-semibold text-n-000 hover:bg-white/10"
              >
                Bekijk de prijzen
              </Link>
            </div>
          </div>
          <div id="rekentool" className="scroll-mt-s5">
            <div className="mb-s3 flex items-baseline justify-between gap-s3">
              <p className="font-kop text-[1.15rem] font-semibold">Wat levert het bij jou op?</p>
              <p className="text-[0.82rem] text-n-200">Zes vragen · uitkomst direct</p>
            </div>
            <div className="rounded-merk text-n-900 shadow-[0_30px_80px_-24px_rgba(0,0,0,0.55)] [&>div]:border-0">
              <Calculator />
            </div>
          </div>
        </div>
      </section>

      <AlsClaim id="P8">
        <Sectie id="prijzen" fond="grijs">
          <h2 className="text-[1.6rem]">Prijzen per type</h2>
          <p className="mt-s1 text-[0.92rem] text-n-500">
            De meeste woningen hebben een 1-fase-aansluiting. Heb je een zwaardere aansluiting (3 × 25 A),
            kijk dan bij 3-fase.
          </p>
          {/* Alle types in één raster (Dieudonné 13 nov: geen leeg vlak naast
              1-fase); de fase staat op elke kaart. */}
          <div className="mt-s4 grid gap-s3 sm:grid-cols-2 lg:grid-cols-3">
            {AANBOD.map((t) => (
              <article key={t.id} className="flex flex-col overflow-hidden rounded-merk border border-n-200 bg-n-000">
                <div className="relative aspect-[4/5] bg-n-100">
                  <Image src={t.foto} alt={`${t.titel}, ${t.fase}-fase`} fill sizes="(min-width:1024px) 360px, 100vw" className="object-cover" />
                  <span className="absolute left-s2 top-s2 rounded-full bg-paars px-s2 py-[3px] text-[0.75rem] font-semibold text-n-000">
                    {t.fase}-fase
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-s4">
                  <h3 className="text-[1.15rem]">{t.titel}</h3>
                  <p className="mt-s1 text-[0.8rem] font-semibold uppercase tracking-[0.1em] text-paars">
                    {t.fase}-fase · {t.backup}
                  </p>
                  <p className="mt-s2 text-[0.9rem] text-n-500">{t.omschrijving}</p>
                  <ul className="mt-s3 divide-y divide-n-200 border-y border-n-200 text-[0.95rem]">
                    {t.regels.map((r) => (
                      <li key={r.capaciteit_kwh} className="flex justify-between py-[7px]">
                        <span>{kwh(r.capaciteit_kwh)} kWh</span>
                        <span className="font-semibold text-paars">vanaf {euro(r.prijs_eur)}</span>
                      </li>
                    ))}
                  </ul>
                  <ul className="mt-s3 space-y-[3px] text-[0.82rem] text-n-900">
                    <li className="font-semibold text-paars">Inbegrepen:</li>
                    {inbegrepen.map((x, i) => (
                      <li key={i} className="flex gap-s1">
                        <span aria-hidden="true" className="text-paars">✓</span>
                        <span>{x}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex flex-col gap-s2 pt-s4">
                    <KnopLink href="#terugbellen" soort="secundair" volleBreedte>
                      Bel mij terug
                    </KnopLink>
                    <Link href="#rekentool" className="text-center text-[0.9rem] font-semibold text-paars underline">
                      Reken uit wat het jou oplevert
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-s5 text-[0.8rem] leading-relaxed text-n-500">
            <Claim id="P8" />. De rekentool rekent met capaciteiten tot 20 kWh. Welke batterij en capaciteit bij
            jouw woning past en de definitieve prijs staan in de offerte van {LIMSOLAR.naam} Foto&apos;s ter
            illustratie.
          </p>
        </Sectie>
      </AlsClaim>

      {/* Terugbellen loopt door in hetzelfde grijze vlak als de prijzen
          (Dieudonné 13 nov: geen los groot blok). Links waarom, rechts het
          korte formulier. */}
      <section id="terugbellen" className="scroll-mt-s5 bg-n-100 px-s3 pb-s6">
        <div className="mx-auto grid max-w-inhoud items-center gap-s5 rounded-merk bg-paars p-s4 text-n-000 sm:p-s5 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="text-[1.6rem] text-n-000">Liever eerst even praten?</h2>
            <p className="mt-s2 text-[1rem] leading-relaxed text-n-200">
              Laat je gegevens achter, dan bellen we je terug. We bespreken de prijs en welke batterij bij
              jouw woning past.
            </p>
            <ul className="mt-s3 space-y-[6px] text-[0.95rem]">
              <li>✓ Vrijblijvend, een gesprek van ongeveer tien minuten</li>
              <li>✓ Zo snel mogelijk, of op het dagdeel dat jij kiest</li>
              <li>
                ✓ Of bel zelf:{" "}
                <a href={`tel:${CONTACT.telefoon.replace(/\s/g, "")}`} className="font-semibold underline">
                  {CONTACT.telefoon}
                </a>
              </li>
            </ul>
          </div>
          <AanbodTerugbel />
        </div>
      </section>

      <Footer />
    </main>
  );
}
