"use client";

import { euro, getal, jaren, type Berekening } from "@/lib/calc";
import { REKEN_DISCLAIMER } from "@/lib/site";
import { Knop } from "@/components/ui/Knop";
import { Claim } from "@/components/ui/Claim";
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
  terugleverkosten,
  onTerugleverkosten,
}: {
  uitkomst: Berekening & { route: string };
  onDoorgaan: () => void;
  terugleverkosten: number | undefined;
  onTerugleverkosten: (n: number | undefined) => void;
}) {
  return (
    <div>
      <p className="mb-s2 text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-paars">
        Jouw indicatie
      </p>
      <h3 className="mb-s4 text-[1.5rem]">Dit levert een thuisbatterij bij jou naar verwachting op</h3>

      <dl className="grid gap-s2 sm:grid-cols-2">
        <Kaart
          label="Extra zelfverbruik per jaar"
          waarde={`${getal(uitkomst.extra_zelfverbruik_kwh.min)} – ${getal(
            uitkomst.extra_zelfverbruik_kwh.max
          )} kWh`}
        />
        <Kaart
          label="Indicatieve besparing per jaar"
          waarde={`${euro(uitkomst.besparing_eur.min)} – ${euro(uitkomst.besparing_eur.max)}`}
          nadruk
        />
        <Kaart
          label="Passende capaciteit"
          waarde={`${new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 2 }).format(
            uitkomst.product.capaciteit_kwh
          )} kWh`}
          onder={<Claim id="P6" />}
        />
        <Kaart
          label="Indicatieve terugverdientijd"
          waarde={`${jaren(uitkomst.terugverdientijd_jaar.min)} – ${jaren(
            uitkomst.terugverdientijd_jaar.max
          )} jaar`}
        />
      </dl>

      {uitkomst.product_is_begrensd && (
        <p className="mt-s3 rounded-merk bg-paars-tint p-s3 text-[0.9rem] text-paars">
          Je overschot is groter dan wat dit systeem per jaar kan verwerken. Een grotere opstelling
          kan meer opleveren; wat dat kost, rekenen we in het gesprek voor je uit.
        </p>
      )}

      <Terugleverkosten waarde={terugleverkosten} onKies={onTerugleverkosten} />

      {/* De peildatum loopt via het claimregister en niet via een losse
          if-vergelijking. Zolang R2 niet is afgetekend valt de hele zin weg —
          zonder punt, zonder gat, zonder dat iemand er iets voor hoeft te doen.
          De rekendisclaimer zelf staat er wél altijd: die valt onder R1 en is
          verplicht, ook als er verder niets is bevestigd. */}
      <p className="mt-s4 text-[0.85rem] leading-relaxed text-n-500">
        {REKEN_DISCLAIMER} <Claim id="R2" />
      </p>

      <div className="mt-s4 rounded-merk bg-n-100 p-s3">
        <h4 className="mb-s2 font-kop text-[1.05rem] font-semibold">Wat je hierboven níét ziet</h4>
        <ul className="mb-s3 space-y-s1 text-[0.9rem] text-n-500">
          <li>Welk systeem precies bij jouw meterkast past, en of er meerwerk nodig is.</li>
          <li>Wat de installatie bij jouw woning kost, met alles erbij.</li>
          <li>Wat je eigen kwartierdata laten zien — dat is nauwkeuriger dan elke schatting.</li>
        </ul>
        <Knop onClick={onDoorgaan}>Vraag een advies op maat aan</Knop>
        <p className="mt-s2 text-center text-[0.8rem] text-n-500">
          Vrijblijvend. Wij bellen je op het dagdeel dat jij kiest.
        </p>
      </div>
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
  waarde: string;
  onder?: React.ReactNode;
  nadruk?: boolean;
}) {
  return (
    <div
      className={`rounded-merk border p-s3 ${
        nadruk ? "border-paars bg-paars-tint" : "border-n-200 bg-n-000"
      }`}
    >
      <dt className="text-[0.8rem] font-semibold uppercase tracking-wide text-n-500">{label}</dt>
      <dd className="mt-s1 font-kop text-[1.4rem] font-extrabold text-paars">{waarde}</dd>
      {onder && <p className="mt-s1 text-[0.8rem] text-n-500">{onder}</p>}
    </div>
  );
}
