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
  // Sinds rekenversie 1.6.0 (17 nov 2026, prikbord r. 61 + 65): het instapmodel
  // van 10 kWh voorop, met een eigen besparing; het advies (vuistregel ÷200)
  // als tweede optie. Gerekend zoals Limsolar aanbiedt (dynamisch contract +
  // automatisch handelen, min kosten). Terugverdientijd niet als eerste getal,
  // alleen 1-fase; 3-fase als losse regel. Het eigen contract van de bezoeker
  // als vergelijking (niet bij een dynamisch contract: dat is al het aanbod).
  const i = uitkomst.instap;
  const toonAdvies = uitkomst.product.capaciteit_kwh > 10.5;
  const contractNaam = { vast: "vast of variabel", dynamisch: "dynamisch", onbekend: "je huidige contract" }[
    uitkomst.vergelijking.contract
  ];

  return (
    <div>
      <p className="mb-s1 inline-flex items-center gap-s1 rounded-full bg-paars-tint px-s2 py-[3px] text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-paars">
        Salderen stopt op 1 januari 2027
      </p>
      <h3 className="mb-s3 mt-s2 text-[1.1rem] font-semibold text-n-500">
        Met een thuisbatterij van 10 kWh bespaar je naar verwachting
      </h3>

      <div className="rounded-merk border border-paars bg-paars-tint p-s3">
        <p className="font-kop text-[1.9rem] font-extrabold leading-tight text-paars">
          <TelOpBereik min={i.besparing_eur.min} max={i.besparing_eur.max} opmaak={euro} />
        </p>
        <p className="text-[0.85rem] text-n-500">
          per jaar, met een dynamisch contract en automatisch handelen zoals Limsolar het aanbiedt
          (inclusief {euro(uitkomst.constanten.JAARLIJKSE_KOSTEN)} per jaar aan kosten)
        </p>
      </div>

      <dl className="mt-s2 grid grid-cols-2 gap-s2">
        <Kaart
          nadruk
          label="Instapmodel"
          waarde="10 kWh"
          onder={
            prijsZichtbaar && mag("P9") ? (
              <>vanaf {euro(i.product.prijs_eur)} (1-fase), incl. installatie</>
            ) : (
              "prijs in het adviesgesprek"
            )
          }
        />
        {toonAdvies ? (
          <Kaart
            label="Meer opslag"
            waarde={`${cap} kWh`}
            onder={
              prijsZichtbaar
                ? `vanaf ${euro(uitkomst.product.prijs_eur)} (1-fase), bespaart ${euro(uitkomst.besparing_eur.min)} – ${euro(uitkomst.besparing_eur.max)} per jaar`
                : `bespaart ${euro(uitkomst.besparing_eur.min)} – ${euro(uitkomst.besparing_eur.max)} per jaar`
            }
          />
        ) : (
          <Kaart
            label="Extra eigen stroom"
            waarde={`${getal(uitkomst.extra_zelfverbruik_kwh.min)} – ${getal(uitkomst.extra_zelfverbruik_kwh.max)} kWh`}
            onder="per jaar"
          />
        )}
      </dl>

      <div className="mt-s2 space-y-[3px] text-[0.83rem] leading-snug text-n-500">
        {/* Terugverdientijd inklapbaar (DIRECTIE r. 65, akkoord D. 17 nov 19:20):
            niet weghalen — verzwijgen kan als misleidende omissie gelden —
            maar ook niet als eerste getal. */}
        {prijsZichtbaar && (
          <details className="group rounded-merk border border-n-200 px-s2 py-[6px]">
            <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-paars marker:content-none">
              Terugverdientijd bekijken
              <span aria-hidden="true" className="transition group-open:rotate-180">▾</span>
            </summary>
            <div className="mt-[6px] space-y-[3px]">
              <p>
                10 kWh: {jaren(i.terugverdientijd_jaar.min)} – {jaren(i.terugverdientijd_jaar.max)} jaar (1-fase).
                {toonAdvies &&
                  ` ${cap} kWh: ${jaren(uitkomst.terugverdientijd_jaar.min)} – ${jaren(uitkomst.terugverdientijd_jaar.max)} jaar.`}
              </p>
              <p>
                Bij een 3-fase-aansluiting: 10 kWh vanaf {euro(i.product_3fase.prijs_eur)}, terugverdientijd{" "}
                {jaren(i.terugverdientijd_3fase_jaar.min)} – {jaren(i.terugverdientijd_3fase_jaar.max)} jaar.
              </p>
              <p>Prijs gedeeld door de besparing per jaar.</p>
            </div>
          </details>
        )}
        {uitkomst.vergelijking.contract !== "dynamisch" && (
          <p>
            Ter vergelijking, met {contractNaam} zonder automatisch handelen:{" "}
            {euro(uitkomst.vergelijking.besparing_eur.min)} – {euro(uitkomst.vergelijking.besparing_eur.max)} per
            jaar.
          </p>
        )}
        <p>Welke capaciteit bij jou past, bepaalt Limsolar in de offerte.</p>
      </div>

      {uitkomst.product_is_begrensd && (
        <p className="mt-s2 text-[0.8rem] text-paars">
          Je overschot is groter dan de grootste batterij aankan; wat meer opslag kost, rekenen we in
          het gesprek uit.
        </p>
      )}

      <div className="mt-s3">
        <Knop onClick={onDoorgaan}>Vraag een advies op maat aan →</Knop>
        <p className="mt-s1 text-center text-[0.8rem] text-n-500">
          Vrijblijvend. Wij bellen je zo snel mogelijk, of op het dagdeel dat jij kiest.
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
