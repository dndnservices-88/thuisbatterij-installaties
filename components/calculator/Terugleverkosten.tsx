"use client";

import { TERUGLEVERKOSTEN_OPTIES, type TerugleverAntwoord } from "@/lib/calc";
import { meld } from "@/lib/tracking";

/**
 * De terugleverkosten op het resultaatscherm.
 *
 * Dit wás de plek waar de bezoeker ze voor het eerst tegenkwam. Sinds 26
 * augustus 2026 is het vraag 5 in de reeks, en staat dit blok hier alleen nog om
 * het antwoord te kunnen herzien. Dat verschil is de moeite waard:
 *
 * Terugleverkosten zijn verreweg de grootste post in de hele som. Bij een
 * doorsnee tweepersoonshuishouden gaat de terugverdientijd van ruim veertien
 * jaar naar ruim zeven zodra ze meetellen — en daarmee verspringt de route van
 * "niet rendabel" naar een gewone lead. Zolang wij die aanname zelf invulden op
 * nul, bepaalden wij dus welk scherm iemand kreeg op grond van iets wat we nooit
 * gevraagd hadden. Dat is precies het soort aanname dat je niet stilzwijgend
 * hoort te maken, in geen van beide richtingen.
 *
 * Het blijft de invoer van de bezoeker en niet onze bewering: de calculator
 * vraagt nergens wie je leverancier is, dus een bedrag zelf meerekenen zou een
 * uitspraak zijn over een contract dat wij niet kennen. Wat de bezoeker kiest
 * gaat mee in de lead-snapshot, zodat de adviseur vóór het telefoontje ziet
 * waarmee gerekend is en het als eerste kan natrekken.
 *
 * Als vaste lijst en niet als vrij invoerveld, want een vrij veld nodigt uit tot
 * een fantasiebedrag en dan staat er een terugverdientijd op het scherm die
 * nergens op slaat.
 */
export default function Terugleverkosten({
  antwoord,
  onKies,
}: {
  antwoord: TerugleverAntwoord | undefined;
  onKies: (id: TerugleverAntwoord) => void;
}) {
  const gekozen = TERUGLEVERKOSTEN_OPTIES.find((o) => o.id === antwoord);

  return (
    <section className="mt-s4 rounded-merk border border-n-200 bg-n-000 p-s3">
      <h4 className="mb-s1 font-kop text-[1.05rem] font-semibold">
        Gerekend met: {gekozen ? gekozen.label.toLowerCase() : "geen terugleverkosten"}
      </h4>
      <p className="mb-s3 text-[0.85rem] leading-relaxed text-n-500">
        Dit is het antwoord dat je bij vraag 5 gaf, en het weegt zwaarder dan alle andere. Klopt het
        niet, of weet je het inmiddels wel? Pas het hieronder aan — de bedragen rekenen meteen
        opnieuw. Je vindt het op je jaarafrekening of in je contractvoorwaarden.
      </p>

      <div
        role="radiogroup"
        aria-label="Terugleverkosten van je energieleverancier"
        className="grid gap-s2 sm:grid-cols-2"
      >
        {TERUGLEVERKOSTEN_OPTIES.map((o) => {
          const actief = antwoord === o.id;
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={actief}
              onClick={() => {
                onKies(o.id);
                meld("calc_terugleverkosten", { antwoord: o.id, bedrag: o.waarde });
              }}
              className={`rounded-merk border p-s2 text-left transition ${
                actief ? "border-paars bg-paars-tint" : "border-n-200 bg-n-000 hover:border-paars"
              }`}
            >
              <span className="block text-[0.95rem] font-semibold text-paars">{o.label}</span>
              <span className="mt-s1 block text-[0.78rem] leading-tight text-n-500">{o.onder}</span>
            </button>
          );
        })}
      </div>

      {gekozen && gekozen.waarde > 0 && (
        <p className="mt-s3 text-[0.8rem] leading-relaxed text-n-500">
          De bedragen hierboven zijn berekend met het tarief dat jij hebt opgegeven. Dit is jouw
          opgave over jouw contract; wij controleren hem in het adviesgesprek voordat er iets op
          papier komt.
        </p>
      )}
    </section>
  );
}
