"use client";

import { euro, getal, jaren, TERUGLEVERKOSTEN_OPTIES, type Berekening, type TerugleverAntwoord } from "@/lib/calc";
import { mag } from "@/lib/claims";
import { REKEN_DISCLAIMER } from "@/lib/site";
import { Knop } from "@/components/ui/Knop";
import { Claim } from "@/components/ui/Claim";
import { TelOpBereik } from "@/components/ui/TelOp";
import Financiering from "@/components/Financiering";
import Terugleverkosten from "./Terugleverkosten";

/**
 * Het resultaat.
 *
 * Alles als bandbreedte, nooit één bedrag — dat is een acceptatiecriterium én
 * de reden dat het claimrisico laag blijft. Het advies op maat blijft bewust
 * achter het gesprek: welk systeem precies, wat het bij deze woning kost, en of
 * er meerwerk aan de meterkast nodig is.
 */
export default function Resultaat({
  uitkomst,
  onDoorgaan,
  antwoord,
  onTerugleverkosten,
}: {
  uitkomst: Berekening & { route: string };
  onDoorgaan: () => void;
  antwoord: TerugleverAntwoord | undefined;
  onTerugleverkosten: (id: TerugleverAntwoord) => void;
}) {
  // Alleen bij "weet ik niet". Wie heeft geantwoord dat hij niets betaalt, hoeft
  // niet te horen dat het korter kan als hij wél betaalt — dat is geen hulp maar
  // een duwtje richting een gunstiger antwoord, en dat is precies wat we niet
  // doen. Bij "weet ik niet" is het wél informatie: die bezoeker kijkt naar een
  // getal dat op een onbekende staat en hoort te weten welke kant dat op valt.
  const onbekend = antwoord === "weet_niet" || antwoord === undefined;

  // Prijs en terugverdientijd horen bij elkaar: wie de terugverdientijd ziet,
  // kan de prijs terugrekenen. Daarom hangen ze allebei aan claim P6 (prijs per
  // capaciteit). Zolang die live niet bevestigd is, toont de site alleen de
  // besparing en de maat; in de preview staat alles.
  const prijsZichtbaar = mag("P6");
  const cap = new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 2 }).format(uitkomst.product.capaciteit_kwh);
  const gekozen = TERUGLEVERKOSTEN_OPTIES.find((o) => o.id === antwoord);

  // Opbouw sinds 7 okt 2026 (op verzoek van Dieudonné: minder scrollen, knop
  // direct in beeld): eerst de besparing, dan maat/prijs en terugverdientijd,
  // dan meteen de knop. Alles wat uitleg is, staat in twee uitklapregels.
  return (
    <div>
      <p className="mb-s1 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-paars">
        Jouw indicatie
      </p>
      <h3 className="mb-s3 text-[1.1rem] font-semibold text-n-500">
        Met een thuisbatterij bespaar je naar verwachting
      </h3>

      <div className="rounded-merk border border-paars bg-paars-tint p-s3">
        <p className="font-kop text-[1.9rem] font-extrabold leading-tight text-paars">
          <TelOpBereik min={uitkomst.besparing_eur.min} max={uitkomst.besparing_eur.max} opmaak={euro} />
        </p>
        <p className="text-[0.85rem] text-n-500">per jaar</p>
      </div>

      <dl className="mt-s2 grid grid-cols-2 gap-s2">
        <Kaart
          label="Thuisbatterij van"
          waarde={`${cap} kWh`}
          onder={prijsZichtbaar ? `vanaf ${euro(uitkomst.product.prijs_eur)} incl. installatie` : "prijs in het adviesgesprek"}
        />
        {prijsZichtbaar ? (
          <Kaart
            label="Terugverdientijd"
            waarde={`${jaren(uitkomst.terugverdientijd_jaar.min)} – ${jaren(uitkomst.terugverdientijd_jaar.max)} jaar`}
            onder="prijs ÷ besparing"
          />
        ) : (
          <Kaart
            label="Extra eigen stroom"
            waarde={`${getal(uitkomst.extra_zelfverbruik_kwh.min)} – ${getal(uitkomst.extra_zelfverbruik_kwh.max)} kWh`}
            onder="per jaar"
          />
        )}
      </dl>

      {uitkomst.product_is_begrensd && (
        <p className="mt-s2 text-[0.8rem] text-paars">
          Je overschot is groter dan de grootste batterij aankan; wat meer opslag kost, rekenen we in
          het gesprek uit.
        </p>
      )}

      <div className="mt-s3">
        <Knop onClick={onDoorgaan}>Vraag een advies op maat aan →</Knop>
        <p className="mt-s1 text-center text-[0.8rem] text-n-500">
          Vrijblijvend. Wij bellen je op het dagdeel dat jij kiest.
        </p>
      </div>

      <Financiering compact />

      <div className="mt-s3 border-t border-n-200">
        <details className="group border-b border-n-200">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-s2 py-s2 text-[0.88rem] marker:content-none">
            <span>
              Gerekend met:{" "}
              <span className="font-semibold text-paars">
                {gekozen ? gekozen.label.toLowerCase() : "geen terugleverkosten"}
              </span>
            </span>
            <span className="shrink-0 text-paars">
              aanpassen <span className="inline-block transition group-open:rotate-180">▾</span>
            </span>
          </summary>
          <div className="pb-s3">
            {onbekend && (
              <p className="mb-s2 text-[0.8rem] text-n-500">
                Je wist niet of je terugleverkosten betaalt, dus we rekenden zonder. Betaal je ze wel,
                dan valt de uitkomst gunstiger uit.
              </p>
            )}
            <Terugleverkosten antwoord={antwoord} onKies={onTerugleverkosten} />
          </div>
        </details>
        <details className="group border-b border-n-200">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-s2 py-s2 text-[0.88rem] marker:content-none">
            <span>Hoe we dit berekenden</span>
            <span className="shrink-0 text-paars">
              <span className="inline-block transition group-open:rotate-180">▾</span>
            </span>
          </summary>
          <div className="space-y-s2 pb-s3 text-[0.82rem] leading-relaxed text-n-500">
            <p>
              Extra eigen gebruik van je zonnestroom: {getal(uitkomst.extra_zelfverbruik_kwh.min)} –{" "}
              {getal(uitkomst.extra_zelfverbruik_kwh.max)} kWh per jaar.{" "}
              <Claim id="P6" />.
            </p>
            <p>
              {REKEN_DISCLAIMER} <Claim id="R2" />
            </p>
          </div>
        </details>
      </div>

      {/* R1: de mededeling dát het een indicatie is, staat altijd zichtbaar. */}
      <p className="mt-s2 text-[0.75rem] leading-relaxed text-n-500">
        Indicatie op basis van jouw antwoorden en landelijke gemiddelden.
      </p>
    </div>
  );
}

function Kaart({
  label,
  waarde,
  onder,
  nadruk = false,
}: {
  label: string;
  waarde: React.ReactNode;
  onder?: React.ReactNode;
  nadruk?: boolean;
}) {
  return (
    <div
      className={`rounded-merk border p-s2 ${
        nadruk ? "border-paars bg-paars-tint" : "border-n-200 bg-n-000"
      }`}
    >
      <dt className="text-[0.75rem] text-n-500">{label}</dt>
      <dd className="mt-[2px] font-kop text-[1.1rem] font-extrabold leading-tight text-paars">{waarde}</dd>
      {onder && <p className="mt-[2px] text-[0.75rem] leading-snug text-n-500">{onder}</p>}
    </div>
  );
}
