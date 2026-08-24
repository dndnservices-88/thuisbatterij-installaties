"use client";

import { TERUGLEVERKOSTEN_OPTIES } from "@/lib/calc";
import { meld } from "@/lib/tracking";

/**
 * De terugleverkosten-schakelaar.
 *
 * Waarom dit geen vraag 6 is, maar een keuze ná het resultaat:
 *
 * Terugleverkosten zijn verreweg de grootste post in de hele som. Wie ze betaalt,
 * ziet zijn terugverdientijd van ruim tien jaar naar ongeveer zeven zakken. Het
 * is dus precies het soort getal dat je als verkoper standaard zou willen
 * meerekenen — en precies daarom doen wij dat niet. De calculator vraagt nergens
 * wie je leverancier is, dus een bedrag meerekenen zou een bewering zijn over een
 * contract dat wij niet kennen. Onbewezen, en dan hoort het er niet in.
 *
 * De uitweg is niet om het weg te laten, maar om het aan de bezoeker te geven.
 * Standaard staat hij op nul: de zuinigste uitkomst is wat je als eerste ziet.
 * Zet de bezoeker hem aan, dan is dat zíjn invoer over zíjn contract, en die
 * keuze gaat mee in de lead-snapshot. De adviseur ziet vóór het telefoontje
 * waarmee gerekend is en kan het als eerste natrekken.
 *
 * Als vaste lijst en niet als vrij invoerveld, want een vrij veld nodigt uit tot
 * een fantasiebedrag en dan staat er een terugverdientijd op het scherm die
 * nergens op slaat.
 */
export default function Terugleverkosten({
  waarde,
  onKies,
}: {
  waarde: number | undefined;
  onKies: (n: number | undefined) => void;
}) {
  const huidig = waarde ?? 0;

  return (
    <section className="mt-s4 rounded-merk border border-n-200 bg-n-000 p-s3">
      <h4 className="mb-s1 font-kop text-[1.05rem] font-semibold">
        Betaal je terugleverkosten aan je energieleverancier?
      </h4>
      <p className="mb-s3 text-[0.85rem] leading-relaxed text-n-500">
        Sommige leveranciers rekenen een bedrag per kilowattuur die je teruglevert. Juist die kosten
        vermijd je met een batterij. Wij weten niet wie jouw leverancier is, dus rekenen we
        standaard met nul. Weet jij het wel, zet het dan hieronder — het staat meestal op je
        jaarafrekening of in je contractvoorwaarden.
      </p>

      <div
        role="radiogroup"
        aria-label="Terugleverkosten van je energieleverancier"
        className="grid gap-s2 sm:grid-cols-3"
      >
        {TERUGLEVERKOSTEN_OPTIES.map((o) => {
          const gekozen = huidig === o.waarde;
          return (
            <button
              key={o.waarde}
              type="button"
              role="radio"
              aria-checked={gekozen}
              onClick={() => {
                // undefined en niet 0 bij de standaardkeuze: zo blijft in de
                // snapshot zichtbaar dat de bezoeker niets heeft aangeraakt.
                const nieuw = o.waarde === 0 ? undefined : o.waarde;
                onKies(nieuw);
                meld("calc_terugleverkosten", { bedrag: o.waarde });
              }}
              className={`rounded-merk border p-s2 text-left transition ${
                gekozen
                  ? "border-paars bg-paars-tint"
                  : "border-n-200 bg-n-000 hover:border-paars"
              }`}
            >
              <span className="block text-[0.95rem] font-semibold text-paars">{o.label}</span>
              <span className="mt-s1 block text-[0.78rem] leading-tight text-n-500">{o.onder}</span>
            </button>
          );
        })}
      </div>

      {huidig > 0 && (
        <p className="mt-s3 text-[0.8rem] leading-relaxed text-n-500">
          De bedragen hierboven zijn opnieuw berekend met het tarief dat jij hebt gekozen. Dit is
          jouw opgave over jouw contract; wij controleren hem in het adviesgesprek voordat er iets
          op papier komt.
        </p>
      )}
    </section>
  );
}
