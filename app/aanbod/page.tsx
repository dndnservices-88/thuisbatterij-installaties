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
import { LIMSOLAR } from "@/lib/site";
import AanbodTerugbel from "./AanbodTerugbel";

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
  return (
    <main>
      <Sectie fond="paars">
        <Link href="/" className="text-[0.9rem] font-semibold text-[#CBB6E8] underline">
          ← Terug naar de rekentool
        </Link>
        <h1 className="mt-s3 max-w-[22ch] text-n-000">Thuisbatterij inclusief installatie</h1>
        <p className="mt-s3 max-w-[60ch] text-[1.05rem] leading-relaxed text-n-200">
          Voor elke aansluiting een passende batterij. Alle prijzen zijn vanaf-prijzen, inclusief btw
          en inclusief installatie door {LIMSOLAR.naam}. Welke batterij bij jouw woning past, bespreken
          we aan de telefoon.
        </p>
        <div className="mt-s4 flex flex-wrap gap-s2">
          <KnopLink href="#terugbellen">Bel mij terug</KnopLink>
          <Link
            href="/#calculator"
            className="inline-flex min-h-[52px] items-center rounded-merk border border-white/40 px-s4 font-kop font-semibold text-n-000 hover:bg-white/10"
          >
            Reken uit wat het jou oplevert
          </Link>
        </div>
      </Sectie>

      <AlsClaim id="P8">
        <Sectie fond="grijs">
          {[1, 3].map((fase) => (
            <div key={fase} className="mb-s6 last:mb-0">
              <h2 className="text-[1.5rem]">{fase === 1 ? "Voor een 1-fase-aansluiting" : "Voor een 3-fase-aansluiting"}</h2>
              <p className="mt-s1 text-[0.9rem] text-n-500">
                {fase === 1
                  ? "De meeste woningen hebben een 1-fase-aansluiting."
                  : "Heb je een zwaardere aansluiting (3 × 25 A), dan kies je hieruit."}
              </p>
              <div className="mt-s4 grid gap-s3 sm:grid-cols-2 lg:grid-cols-3">
                {AANBOD.filter((t) => t.fase === fase).map((t) => (
                  <article key={t.id} className="flex flex-col overflow-hidden rounded-merk border border-n-200 bg-n-000">
                    <div className="relative aspect-[4/3] bg-n-100">
                      <Image src={t.foto} alt={`${t.titel}, ${fase}-fase`} fill sizes="(min-width:1024px) 360px, 100vw" className="object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col p-s4">
                      <h3 className="text-[1.15rem]">{t.titel}</h3>
                      <p className="mt-s1 text-[0.8rem] font-semibold uppercase tracking-[0.1em] text-paars">
                        {fase}-fase · {t.backup}
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
                      <div className="mt-auto flex flex-col gap-s2 pt-s4">
                        <KnopLink href="#terugbellen" soort="secundair" volleBreedte>
                          Bel mij terug
                        </KnopLink>
                        <Link href="/#calculator" className="text-center text-[0.9rem] font-semibold text-paars underline">
                          Reken uit wat het jou oplevert
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
          <p className="mt-s5 text-[0.8rem] leading-relaxed text-n-500">
            <Claim id="P8" />. De rekentool rekent met capaciteiten tot 20 kWh. Welke batterij en capaciteit bij
            jouw woning past en de definitieve prijs staan in de offerte van {LIMSOLAR.naam}. Foto&apos;s ter
            illustratie.
          </p>
        </Sectie>
      </AlsClaim>

      <Sectie fond="wit" smal>
        <h2>Wat zit erin</h2>
        <ul className="mt-s3 space-y-s2 text-[0.98rem]">
          <li>✓ Installatie en aansluiting door {LIMSOLAR.naam}</li>
          {mag("U3") && (
            <li>
              ✓ <Claim id="U3" />
            </li>
          )}
          {mag("U4") && (
            <li>
              ✓ <Claim id="U4" />
            </li>
          )}
          {mag("V1") && (
            <li>
              ✓ <Claim id="V1" />
            </li>
          )}
        </ul>
      </Sectie>

      <Sectie id="terugbellen" fond="tint" smal>
        <AanbodTerugbel />
      </Sectie>

      <Footer />
    </main>
  );
}
