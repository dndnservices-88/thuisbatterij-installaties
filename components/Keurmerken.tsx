import Image, { type StaticImageData } from "next/image";
import { CLAIMS, isLive, mag, type ClaimId } from "@/lib/claims";

import sgze from "@/public/beeld/keurmerk-sgze.webp";
import installq from "@/public/beeld/keurmerk-installq.webp";
import warmtefonds from "@/public/beeld/keurmerk-warmtefonds.webp";

/**
 * De keurmerkenbalk, direct onder de kopbalk.
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
 * een rij keurmerken zetten zegt tegen de bezoeker "wij zijn gekeurd door
 * vier partijen", terwijl het in werkelijkheid zegt "je kunt hiervoor lenen".
 * Daarom staat hij hieronder apart, achter een scheiding, met zijn eigen
 * onderschrift. Zie ook regel V8 in het register.
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
    <figure
      className={[
        "flex items-center gap-s2 rounded-merk bg-n-000 px-s2 py-s2",
        markeer ? "ring-2 ring-[#A08A00]" : "border border-n-200",
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
      <figcaption className="text-[0.78rem] leading-tight text-n-500">
        {merk.zegt}
        {markeer && (
          <span className="placeholder-label ml-s1 inline-block">
            {regel.id} · {regel.status}
          </span>
        )}
      </figcaption>
    </figure>
  );
}

export default function Keurmerken() {
  const zichtbaar = [...KEURMERKEN, ...FINANCIERS].filter((m) => mag(m.claim));
  // Niets aangetoond, niets te tonen. Geen lege balk, geen restrand.
  if (zichtbaar.length === 0) return null;

  const keurmerken = KEURMERKEN.filter((m) => mag(m.claim));
  const financiers = FINANCIERS.filter((m) => mag(m.claim));

  return (
    <section
      aria-label="Aansluitingen en erkenningen"
      className="border-b border-n-200 bg-n-100 px-s3 py-s3"
    >
      <div className="mx-auto max-w-inhoud">
        {!isLive && (
          <p className="mb-s3 rounded-merk border-2 border-[#A08A00] bg-[#FFF9C4] p-s3 text-[0.85rem]">
            <strong>Voorbeeld.</strong> Deze logo&apos;s staan er alleen om de
            vormgeving te beoordelen. Alle drie staan in het claimregister op{" "}
            <em>open</em>: zodra <code>NEXT_PUBLIC_LIVE</code> op{" "}
            <code>true</code> staat, verdwijnt deze hele balk van de pagina. Ze
            komen pas terug als per merk zowel de aansluiting als de
            toestemming voor het beeldmerk op papier staat.
          </p>
        )}

        <div className="flex flex-wrap items-stretch gap-s2">
          {keurmerken.map((m) => (
            <Merkje key={m.claim} merk={m} />
          ))}

          {financiers.length > 0 && (
            <>
              {/* De scheiding is er niet voor de vorm. Links staat wie ons
                  keurt, rechts staat wie de klant geld leent. Dat mag niet in
                  één rij opgaan. */}
              <span aria-hidden className="hidden w-px self-stretch bg-n-200 sm:block" />
              {financiers.map((m) => (
                <Merkje key={m.claim} merk={m} />
              ))}
            </>
          )}
        </div>

        {/* Geen verwijzing naar een pagina die er nog niet is: een link naar
            "de voorwaarden" die nergens heen gaat is zelf al een misleidende
            mededeling. Zodra V8 op bevestigd staat, hoort hier de vindplaats
            van rente, looptijd en voorwaarden te staan. */}
        {financiers.length > 0 && (
          <p className="mt-s2 max-w-lees text-[0.78rem] text-n-500">
            Het Nationaal Warmtefonds is een financier en geen keurmerk. Of
            financiering in jouw situatie kan, en tegen welke voorwaarden,
            bespreken we in het adviesgesprek.
          </p>
        )}
      </div>
    </section>
  );
}
