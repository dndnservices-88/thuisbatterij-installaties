import Image, { type StaticImageData } from "next/image";
import { CLAIMS, isLive, mag, type ClaimId } from "@/lib/claims";

import sgze from "@/public/beeld/keurmerk-sgze.webp";
import installq from "@/public/beeld/keurmerk-installq.webp";
import warmtefonds from "@/public/beeld/keurmerk-warmtefonds.webp";

/**
 * De keurmerkenstrip, onderin het paarse heroblok.
 *
 * Stond eerst als losse witte balk tussen kopbalk en hero. Die balk duwde de
 * kop en de knop naar beneden zonder zelf iets te verkopen; nu loopt hij mee in
 * het paars en staat de hero een stuk hoger.
 *
 * De rij beweegt van links naar rechts en staat twee keer in de HTML, zodat het
 * einde naadloos aansluit op het begin. De tweede kopie krijgt aria-hidden: een
 * schermlezer hoort de merken dan één keer in plaats van dubbel. Bij hover staat
 * hij stil, en voor wie animaties heeft uitgezet in zijn systeeminstellingen
 * beweegt hij helemaal niet — dat is geen extraatje maar een toegankelijkheids-
 * eis, en beweging die je niet kunt stoppen is voor sommige mensen fysiek
 * vervelend.
 *
 * ⚠️ ALLES HIERONDER IS VOORBEELD. Geen van deze drie merken is aangetoond,
 * en dus staat elk van de drie in het claimregister op "open". Gevolg: in de
 * preview zie je ze met een gele markering, en zodra NEXT_PUBLIC_LIVE=true is
 * rendert deze balk helemaal niet. Dat is precies de afspraak "dit moeten we
 * later allemaal aanpassen als we live gaan" — hier afgedwongen in code in
 * plaats van op een lijstje.
 *
 * Waarom die hardheid: een keurmerklogo is een zwaardere mededeling dan de zin
 * eronder. Het oog leest een beeldmerk als een oordeel van een onafhankelijke
 * partij, niet als een bewering van de adverteerder. Een vertrouwens- of
 * kwaliteitsmerk voeren zonder toestemming van de houder staat op de zwarte
 * lijst van bijlage I bij de richtlijn oneerlijke handelspraktijken: misleidend
 * per definitie, zonder verdere belangenafweging, met een boetemaximum van 4%
 * van de jaaromzet. Er is geen versie van "we zetten hem er vast op".
 *
 * Elk merk heeft daarom twee bewijsstukken nodig, niet één: dat de aansluiting
 * bestaat én dat de houder Limsolar toestaat het beeldmerk te voeren.
 *
 * En één inhoudelijk punt dat geen juridische maar een merkkeuze is: het
 * Nationaal Warmtefonds is géén keurmerk. Het is een financier. Zijn logo in
 * een rij keurmerken zetten zegt tegen de bezoeker "wij zijn gekeurd door drie
 * partijen", terwijl het in werkelijkheid zegt "je kunt hiervoor lenen". In een
 * lopende rij is dat verschil helemaal niet meer te maken — een scheidingslijn
 * die voorbijschuift leest niemand als scheiding. Daarom zit het Warmtefonds
 * niet in de strip maar staat het eronder als zin. Zie ook regel V8.
 */

type Merk = {
  claim: ClaimId;
  bron: StaticImageData;
  /** Wat het merk is. Komt in de alt-tekst én in het onderschrift. */
  naam: string;
  /** Wat het merk over Limsolar zégt. Bewust kort en letterlijk. */
  zegt: string;
};

const KEURMERKEN: Merk[] = [
  {
    claim: "V1",
    bron: sgze,
    naam: "Stichting Garantiefonds ZonneEnergie",
    zegt: "Aanbetaling en garantie gedekt",
  },
  {
    claim: "V7",
    bron: installq,
    naam: "InstallQ",
    zegt: "Erkend installatiebedrijf",
  },
];

const FINANCIERS: Merk[] = [
  {
    claim: "V8",
    bron: warmtefonds,
    naam: "Nationaal Warmtefonds",
    zegt: "Financiering mogelijk",
  },
];

function Merkje({ merk }: { merk: Merk }) {
  const regel = CLAIMS[merk.claim];
  const markeer = !isLive && regel.status !== "bevestigd";

  return (
    // Wit blokje om elk merk heen. Niet als vormgrapje: alle drie de logo's
    // hebben zelf een witte achtergrond, dus op het paars zouden het losse
    // witte rechthoeken worden. Een blokje met ruimte eromheen leest als een
    // keuze in plaats van als een fout.
    <figure
      className={[
        "flex shrink-0 items-center gap-s2 rounded-merk bg-n-000 px-s3 py-s2",
        markeer ? "ring-2 ring-[#A08A00]" : "",
      ].join(" ")}
    >
      <Image
        src={merk.bron}
        // Geen "keurmerk" in de alt-tekst: een schermlezer hoort dan een
        // oordeel dat we niet hebben aangetoond. Alleen de naam.
        alt={merk.naam}
        sizes="200px"
        className="h-[34px] w-auto sm:h-[40px]"
      />
      {/* Wél de gele rand, géén "V1 · open" per blokje. De rij herhaalt zich
          twaalf keer; dat label er twaalf keer bij maakt de strip onleesbaar en
          dan kun je de vormgeving niet meer beoordelen, wat het enige doel van
          de preview is. De codes staan één keer in de regel erboven, met de
          rand als koppeling: geel omrand = nog niet aangetoond. */}
      <figcaption className="text-[0.78rem] leading-tight text-n-500">
        {merk.zegt}
      </figcaption>
    </figure>
  );
}

export default function Keurmerken() {
  const keurmerken = KEURMERKEN.filter((m) => mag(m.claim));
  const financiers = FINANCIERS.filter((m) => mag(m.claim));
  // Niets aangetoond, niets te tonen. Geen lege balk, geen restrand.
  if (keurmerken.length + financiers.length === 0) return null;

  // Welke er in de preview geel omrand staan. Alleen de merken uit de strip:
  // het Warmtefonds staat eronder als zin en heeft dus geen rand, en die er
  // toch bij noemen maakt de uitleg zelf onwaar.
  //
  // Zodra het bewijs binnen is en de status op 'bevestigd' gaat, valt een merk
  // hier vanzelf uit; is de lijst leeg, dan verdwijnt de waarschuwingsregel.
  // Niets handmatig weg te halen, dus ook niets om te vergeten.
  const open = keurmerken.filter((m) => CLAIMS[m.claim].status !== "bevestigd");

  // Met twee merken is één rij smaller dan het scherm, en dan zie je een gat
  // voorbijkomen. Daarom de rij een aantal keer herhalen tot hij zeker breder
  // is dan de breedste telefoon of monitor.
  const rij = Array.from({ length: 6 }, () => keurmerken).flat();

  return (
    <section aria-label="Aansluitingen en erkenningen" className="mt-s5">
      {!isLive && open.length > 0 && (
        <p className="mb-s3 text-[0.8rem] text-n-200">
          <span className="placeholder-label">Voorbeeld</span> Geel omrand ={" "}
          nog niet aangetoond:{" "}
          {open.map((m) => `${m.claim} ${m.naam}`).join(", ")}. Deze logo&apos;s
          staan er alleen om de vormgeving te beoordelen; in live-modus verdwijnt
          de strip van de pagina en komt pas terug als per merk zowel de
          aansluiting als de toestemming voor het beeldmerk op papier staat.
        </p>
      )}

      {keurmerken.length > 0 && (
        // De vervaging links en rechts is er zodat de blokjes niet halverwege
        // tegen de schermrand aan kapotgesneden worden; ze verdwijnen nu.
        <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]">
          <div className="flex w-max animate-strip gap-s2 hover:[animation-play-state:paused] motion-reduce:animate-none">
            {[0, 1].map((kopie) => (
              <div key={kopie} className="flex shrink-0 gap-s2" aria-hidden={kopie === 1}>
                {rij.map((m, i) => (
                  <Merkje key={`${kopie}-${m.claim}-${i}`} merk={m} />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Geen verwijzing naar een pagina die er nog niet is: een link naar
          "de voorwaarden" die nergens heen gaat is zelf al een misleidende
          mededeling. Zodra V8 op bevestigd staat, hoort hier de vindplaats
          van rente, looptijd en voorwaarden te staan. */}
      {financiers.length > 0 && (
        <p className="mt-s3 max-w-lees text-[0.8rem] text-n-200">
          Financiering via het Nationaal Warmtefonds is mogelijk. Dat is een
          financier en geen keurmerk, en daarom staat het niet tussen de merken
          hierboven. Of het in jouw situatie kan, en tegen welke voorwaarden,
          bespreken we in het adviesgesprek.
        </p>
      )}
    </section>
  );
}
