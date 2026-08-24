"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  bereken,
  type Antwoorden,
  type Contract,
  type Uitkomst,
} from "@/lib/calc";
import { meld, nieuwEventId } from "@/lib/tracking";
import { GetalVeld, Keuzekaart, Voortgang } from "@/components/ui/Veld";
import { Knop } from "@/components/ui/Knop";
import Resultaat from "./Resultaat";
import { GeenPv, Huurder, NietRendabel } from "./Uitzonderingen";
import Formulier from "./Formulier";

/**
 * De calculator. Vijf vraagschermen, dan het resultaat, dan het formulier.
 *
 * Antwoorden staan in één state-object en blijven bewaard bij terugnavigeren —
 * niemand vult twee keer in (specificatie sectie 7). Automatisch doorspringen
 * gebeurt alleen bij keuzeknoppen, niet bij getalinvoer.
 */

type Stap = 1 | 2 | 3 | 4 | 5 | "resultaat" | "formulier";

type Concept = {
  zonnepanelen?: "ja" | "nee" | "binnenkort";
  aantal?: string;
  dak_m2?: string;
  paneelmodus: "aantal" | "dak_m2";
  kwh?: string;
  huishouden?: "1" | "2-3" | "4-5" | "6+";
  verbruikmodus: "kwh" | "huishouden";
  contract?: Contract;
  eigenaar?: boolean;
  /** Geen vraag, maar een keuze op het resultaatscherm. Zie Terugleverkosten.tsx. */
  terugleverkosten?: number;
};

const leeg: Concept = { paneelmodus: "aantal", verbruikmodus: "kwh" };

export default function Calculator() {
  const [stap, setStap] = useState<Stap>(1);
  const [c, setC] = useState<Concept>(leeg);
  const [zachteLead, setZachteLead] = useState(false);
  const gestart = useRef(false);
  const kop = useRef<HTMLDivElement>(null);

  // Eén event_id per bezoeker-sessie, zodat browser en server dezelfde
  // Lead-gebeurtenis met hetzelfde id melden en Meta ontdubbelt.
  const eventId = useMemo(() => nieuwEventId(), []);

  useEffect(() => {
    if (gestart.current) return;
    gestart.current = true;
    meld("calc_start");
  }, []);

  // Bij elke stapwissel naar de kop scrollen, anders staat de bezoeker op mobiel
  // halverwege het volgende scherm.
  useEffect(() => {
    if (stap !== 1) kop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stap]);

  const antwoorden: Antwoorden | null = useMemo(() => {
    if (!c.zonnepanelen || c.contract === undefined || c.eigenaar === undefined) return null;
    const panelen =
      c.paneelmodus === "aantal"
        ? { soort: "aantal" as const, aantal: Number(c.aantal || 0) }
        : { soort: "dak_m2" as const, m2: Number(c.dak_m2 || 0) };
    const verbruik =
      c.verbruikmodus === "kwh"
        ? { soort: "kwh" as const, kwh: Number(c.kwh || 0) }
        : { soort: "huishouden" as const, grootte: c.huishouden! };
    return {
      zonnepanelen: c.zonnepanelen,
      panelen,
      verbruik,
      contract: c.contract,
      eigenaar: c.eigenaar,
      terugleverkosten: c.terugleverkosten,
    };
  }, [c]);

  const uitkomst: Uitkomst | null = useMemo(
    () => (antwoorden ? bereken(antwoorden) : null),
    [antwoorden]
  );

  // De uitzonderingsroutes één keer melden zodra ze in beeld komen.
  const gemeld = useRef<string>("");
  useEffect(() => {
    if (stap !== "resultaat" || !uitkomst || gemeld.current === uitkomst.route) return;
    gemeld.current = uitkomst.route;
    if (uitkomst.route === "huurder") meld("calc_disqualified_huur");
    else if (uitkomst.route === "geen_pv") meld("calc_no_pv");
    else if (uitkomst.route === "niet_rendabel")
      meld("calc_not_viable", { terugverdientijd: uitkomst.terugverdientijd_jaar.midden });
    else
      meld("calc_result", {
        besparing_min: uitkomst.besparing_eur.min,
        besparing_max: uitkomst.besparing_eur.max,
        capaciteit: uitkomst.product.capaciteit_kwh,
        terugverdientijd: uitkomst.terugverdientijd_jaar.midden,
      });
  }, [stap, uitkomst]);

  function volgende(vanaf: number, antwoord: unknown) {
    meld(`calc_step_${vanaf}` as "calc_step_1", { antwoord: String(antwoord) });
    setStap(vanaf === 5 ? "resultaat" : ((vanaf + 1) as Stap));
  }

  function terug() {
    if (stap === "formulier") return setStap("resultaat");
    if (stap === "resultaat") return setStap(5);
    if (typeof stap === "number" && stap > 1) return setStap((stap - 1) as Stap);
  }

  const paneelGeldig =
    c.paneelmodus === "aantal" ? Number(c.aantal) > 0 : Number(c.dak_m2) > 0;
  const verbruikGeldig =
    c.verbruikmodus === "kwh" ? Number(c.kwh) > 0 : Boolean(c.huishouden);

  return (
    <div
      ref={kop}
      className="scroll-mt-s4 rounded-merk border border-n-200 bg-n-000 p-s3 shadow-sm sm:p-s4"
    >
      {typeof stap === "number" && (
        <>
          <Voortgang stap={stap} van={5} />
          <div className="mt-s4">
            {stap === 1 && (
              <Vraag titel="Heb je zonnepanelen?">
                <div className="grid gap-s2">
                  {(
                    [
                      ["ja", "Ja"],
                      ["binnenkort", "Binnenkort"],
                      ["nee", "Nee"],
                    ] as const
                  ).map(([w, l]) => (
                    <Keuzekaart
                      key={w}
                      gekozen={c.zonnepanelen === w}
                      onClick={() => {
                        if (w === "nee") {
                          // Zonder panelen zijn vraag 2 en 3 zinloos: door naar
                          // de eigendomsvraag, want die bepaalt of er überhaupt
                          // een gesprek mogelijk is. Contract vullen we op
                          // "onbekend" zodat het antwoordobject compleet is —
                          // anders blijft het resultaatscherm leeg.
                          setC({ ...c, zonnepanelen: w, contract: "onbekend" });
                          meld("calc_step_1", { antwoord: w });
                          setStap(5);
                        } else {
                          setC({ ...c, zonnepanelen: w });
                          volgende(1, w);
                        }
                      }}
                    >
                      {l}
                    </Keuzekaart>
                  ))}
                </div>
              </Vraag>
            )}

            {stap === 2 && (
              <Vraag titel="Hoeveel panelen liggen er?">
                {c.paneelmodus === "aantal" ? (
                  <>
                    <GetalVeld
                      id="panelen"
                      label="Aantal panelen"
                      value={c.aantal ?? ""}
                      onChange={(e) => setC({ ...c, aantal: e.target.value.replace(/\D/g, "") })}
                    />
                    <button
                      type="button"
                      className="mt-s2 text-[0.9rem] font-semibold text-paars underline"
                      onClick={() => setC({ ...c, paneelmodus: "dak_m2" })}
                    >
                      Weet ik niet — schat op dakoppervlak
                    </button>
                  </>
                ) : (
                  <>
                    <GetalVeld
                      id="dak"
                      label="Dakoppervlak met panelen"
                      hint="In vierkante meters. Wij rekenen met ongeveer twee panelen per vier m²."
                      value={c.dak_m2 ?? ""}
                      onChange={(e) => setC({ ...c, dak_m2: e.target.value.replace(/\D/g, "") })}
                    />
                    <button
                      type="button"
                      className="mt-s2 text-[0.9rem] font-semibold text-paars underline"
                      onClick={() => setC({ ...c, paneelmodus: "aantal" })}
                    >
                      Ik weet het aantal panelen wel
                    </button>
                  </>
                )}
                <Knop
                  className="mt-s4"
                  disabled={!paneelGeldig}
                  onClick={() => volgende(2, c.paneelmodus === "aantal" ? c.aantal : c.dak_m2)}
                >
                  Volgende
                </Knop>
              </Vraag>
            )}

            {stap === 3 && (
              <Vraag titel="Wat is je stroomverbruik per jaar?">
                {c.verbruikmodus === "kwh" ? (
                  <>
                    <GetalVeld
                      id="kwh"
                      label="Jaarverbruik in kWh"
                      hint="Staat op je jaarafrekening."
                      value={c.kwh ?? ""}
                      onChange={(e) => setC({ ...c, kwh: e.target.value.replace(/\D/g, "") })}
                    />
                    <button
                      type="button"
                      className="mt-s2 text-[0.9rem] font-semibold text-paars underline"
                      onClick={() => setC({ ...c, verbruikmodus: "huishouden" })}
                    >
                      Weet ik niet — schat op huishoudgrootte
                    </button>
                    <Knop
                      className="mt-s4"
                      disabled={!verbruikGeldig}
                      onClick={() => volgende(3, c.kwh)}
                    >
                      Volgende
                    </Knop>
                  </>
                ) : (
                  <>
                    <p className="mb-s3 text-[0.9rem] text-n-500">Hoeveel mensen wonen er?</p>
                    <div className="grid gap-s2">
                      {(["1", "2-3", "4-5", "6+"] as const).map((g) => (
                        <Keuzekaart
                          key={g}
                          gekozen={c.huishouden === g}
                          onClick={() => {
                            setC({ ...c, huishouden: g });
                            volgende(3, g);
                          }}
                        >
                          {g === "1" ? "1 persoon" : `${g} personen`}
                        </Keuzekaart>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="mt-s3 text-[0.9rem] font-semibold text-paars underline"
                      onClick={() => setC({ ...c, verbruikmodus: "kwh" })}
                    >
                      Ik weet mijn verbruik in kWh wel
                    </button>
                  </>
                )}
              </Vraag>
            )}

            {stap === 4 && (
              <Vraag
                titel="Wat voor energiecontract heb je?"
                onder="Dit maakt verschil: bij een dynamisch contract is een opgeslagen kilowattuur meer waard."
              >
                <div className="grid gap-s2">
                  {(
                    [
                      ["vast", "Vast of variabel"],
                      ["dynamisch", "Dynamisch"],
                      ["onbekend", "Weet ik niet"],
                    ] as const
                  ).map(([w, l]) => (
                    <Keuzekaart
                      key={w}
                      gekozen={c.contract === w}
                      onClick={() => {
                        setC({ ...c, contract: w });
                        volgende(4, w);
                      }}
                    >
                      {l}
                    </Keuzekaart>
                  ))}
                </div>
              </Vraag>
            )}

            {stap === 5 && (
              <Vraag
                titel="Is de woning je eigendom?"
                onder="Een thuisbatterij hoort bij de woning, dus dit bepaalt of het kan."
              >
                <div className="grid gap-s2">
                  <Keuzekaart
                    gekozen={c.eigenaar === true}
                    onClick={() => {
                      setC({ ...c, eigenaar: true });
                      volgende(5, "koop");
                    }}
                  >
                    Ja, ik ben eigenaar
                  </Keuzekaart>
                  <Keuzekaart
                    gekozen={c.eigenaar === false}
                    onClick={() => {
                      setC({ ...c, eigenaar: false });
                      volgende(5, "huur");
                    }}
                  >
                    Nee, ik huur
                  </Keuzekaart>
                </div>
              </Vraag>
            )}
          </div>
        </>
      )}

      {stap === "resultaat" && uitkomst && (
        <>
          {uitkomst.route === "huurder" && <Huurder />}
          {uitkomst.route === "geen_pv" && <GeenPv />}
          {uitkomst.route === "niet_rendabel" && (
            <NietRendabel
              uitkomst={uitkomst}
              onDoorgaan={() => {
                setZachteLead(true);
                setStap("formulier");
              }}
              terugleverkosten={c.terugleverkosten}
              onTerugleverkosten={(n) => setC({ ...c, terugleverkosten: n })}
            />
          )}
          {uitkomst.route === "lead" && (
            <Resultaat
              uitkomst={uitkomst}
              onDoorgaan={() => setStap("formulier")}
              terugleverkosten={c.terugleverkosten}
              onTerugleverkosten={(n) => setC({ ...c, terugleverkosten: n })}
            />
          )}
        </>
      )}

      {stap === "formulier" && antwoorden && uitkomst && (
        <Formulier
          antwoorden={antwoorden}
          uitkomst={uitkomst}
          eventId={eventId}
          zacht={zachteLead}
        />
      )}

      {stap !== 1 && stap !== "formulier" && (
        <button
          type="button"
          onClick={terug}
          className="mt-s4 text-[0.9rem] font-semibold text-n-500 underline"
        >
          ← Terug
        </button>
      )}
    </div>
  );
}

function Vraag({
  titel,
  onder,
  children,
}: {
  titel: string;
  onder?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-s2 text-[1.3rem]">{titel}</h3>
      {onder && <p className="mb-s3 text-[0.9rem] text-n-500">{onder}</p>}
      {children}
    </div>
  );
}
