"use client";

import { jaren, type Berekening } from "@/lib/calc";
import { Knop } from "@/components/ui/Knop";
import Terugleverkosten from "./Terugleverkosten";

/**
 * De drie uitkomsten die géén standaardlead zijn (specificatie 3.4).
 *
 * Deze schermen kosten leads en leveren marge op. Ze zijn ook het enige echte
 * onderscheid in deze markt: wij durven te zeggen wanneer het bij jou niet
 * uitkomt. Niet weghalen om het leadaantal op te krikken — de vergoeding hangt
 * aan een verkoop, niet aan een formulier.
 */

export function Huurder() {
  return (
    <Uitleg titel="Een thuisbatterij is hier helaas niet aan de orde">
      <p>
        Een thuisbatterij wordt vast op de woning aangesloten en hoort daarmee bij het huis. De
        eigenaar beslist daarover, niet de bewoner. Wij kunnen daar niets aan veranderen en gaan je
        er ook niet mee lastigvallen.
      </p>
      <p>
        Denk je dat je verhuurder ervoor openstaat? Bespreek het gerust met hem. Wij rekenen het
        graag door zodra de eigenaar meekijkt.
      </p>
    </Uitleg>
  );
}

export function GeenPv() {
  return (
    <Uitleg titel="Zonder zonnepanelen klopt deze rekensom niet">
      <p>
        Een thuisbatterij verdient zichzelf vooral terug door stroom die je zelf opwekt en anders
        voor weinig zou terugleveren, later op de dag alsnog te gebruiken. Zonder opwek is er geen
        overschot om op te slaan.
      </p>
      <p>
        Er blijft één route over: laden op goedkope uren van een dynamisch contract. Dat kan
        rendabel zijn, maar de uitkomst hangt sterk af van je verbruikspatroon en van de
        prijsverschillen per dag. Daar doen wij geen belofte over op basis van vijf vragen.
      </p>
      <p>
        Overweeg je zonnepanelen én een batterij? Kom dan terug zodra je weet hoeveel panelen er
        komen — dan is de berekening wél zinvol.
      </p>
    </Uitleg>
  );
}

/**
 * Let op de terugleverkosten-schakelaar hieronder. Die hoort juist hier te
 * staan, want dit is het enige scherm waar hij de uitkomst kan omdraaien: zet
 * de bezoeker hem aan, dan zakt de terugverdientijd en verspringt de route van
 * "niet rendabel" naar een gewone lead. Andersom kan niet — de schakelaar maakt
 * de som alleen gunstiger.
 *
 * Dat is geen achterdeurtje om dit scherm te omzeilen. Als iemand werkelijk
 * € 0,18 per teruggeleverde kWh betaalt, was "niet rendabel" simpelweg het
 * verkeerde antwoord, en dan hoort dat rechtgezet te worden.
 */
export function NietRendabel({
  uitkomst,
  onDoorgaan,
  terugleverkosten,
  onTerugleverkosten,
}: {
  uitkomst: Berekening;
  onDoorgaan: () => void;
  terugleverkosten: number | undefined;
  onTerugleverkosten: (n: number | undefined) => void;
}) {
  return (
    <Uitleg titel="Bij jouw verbruik komt een thuisbatterij krap uit">
      <p>
        Met de gegevens die je hebt ingevuld komen we op een terugverdientijd van ongeveer{" "}
        <strong>{jaren(uitkomst.terugverdientijd_jaar.midden)} jaar</strong>. Dat is lang, en wij
        adviseren dan liever niet.
      </p>
      <p>
        Dat komt meestal door een relatief laag verbruik of weinig panelen: er blijft simpelweg
        weinig over om op te slaan. Wordt je verbruik hoger — een warmtepomp, een elektrische auto,
        thuiswerken — dan verandert dit beeld.
      </p>
      <Terugleverkosten waarde={terugleverkosten} onKies={onTerugleverkosten} />
      <div className="pt-s2">
        <Knop soort="zacht" onClick={onDoorgaan}>
          Toch even laten meekijken?
        </Knop>
        <p className="mt-s2 text-[0.8rem] text-n-500">
          Wij bellen je dan, maar rekenen erop dat het antwoord nee blijft. Geen verkoopgesprek.
        </p>
      </div>
    </Uitleg>
  );
}

function Uitleg({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-s2 text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-paars">
        Eerlijk antwoord
      </p>
      <h3 className="mb-s3 text-[1.4rem]">{titel}</h3>
      <div className="space-y-s3 text-[0.95rem] leading-relaxed text-n-500">{children}</div>
    </div>
  );
}
