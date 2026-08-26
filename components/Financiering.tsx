import Image from "next/image";
import { CLAIMS, isLive, mag, type ClaimRegel } from "@/lib/claims";

import warmtefonds from "@/public/beeld/keurmerk-warmtefonds.webp";

/**
 * Het Nationaal Warmtefonds, onder de uitkomst van de rekensom.
 *
 * Stond eerst als zin onder de keurmerkenstrip in de hero. Twee redenen om het
 * hierheen te halen.
 *
 * De inhoudelijke: het Warmtefonds neemt een géldbezwaar weg, en dat bezwaar
 * bestaat nog niet als de bezoeker net binnen is. Het ontstaat op het moment dat
 * er een bedrag en een terugverdientijd op het scherm staan. Daar hoort het
 * antwoord, niet drie schermen eerder.
 *
 * De juridische: het Warmtefonds is een financier en geen keurmerk. Ze lenen aan
 * de huiseigenaar, niet aan de installateur, en ze keuren de installateur ook
 * niet. Hun beeldmerk bovenaan naast het eigen logo leest als "wij zijn een
 * Warmtefondspartner", en dat is een sterkere mededeling dan wat waar is:
 * financiering via het Warmtefonds is mogelijk. Hoe lager en hoe dichter bij de
 * context van geld, hoe kleiner het verschil tussen wat er staat en wat er
 * gelezen wordt.
 *
 * De grens in de tekst hieronder is bewust hard. Er staat wat er kan, niet wat
 * het kost: geen rentepercentage, geen looptijd, geen maandbedrag. Die drie zijn
 * kredietvoorwaarden, en die mag je niet noemen zonder de bijbehorende
 * verplichte informatie erbij. Zodra V8 is afgetekend hoort hier de vindplaats
 * van de voorwaarden te staan — een link naar een pagina die er nog niet is, is
 * zelf al een misleidende mededeling.
 *
 * Rendert niet in live-modus zolang V8 op "open" staat: zowel dat financiering
 * via het fonds in dit geval daadwerkelijk kan, als de toestemming om het
 * beeldmerk te voeren, moet op papier staan.
 */
export default function Financiering() {
  if (!mag("V8")) return null;

  // Expliciet als ClaimRegel getypeerd, niet als CLAIMS.V8 rechtstreeks.
  // TypeScript weet anders dat de status nú letterlijk "open" is en noemt de
  // vergelijking hieronder zinloos — terecht op dit moment, maar de hele opzet
  // is dat die status verandert zodra het bewijs binnen is. Met het bredere
  // type blijft de code kloppen na die wijziging.
  const regel: ClaimRegel = CLAIMS.V8;
  const markeer = !isLive && regel.status !== "bevestigd";

  return (
    <aside
      className={[
        "mt-s4 flex items-start gap-s3 rounded-merk border border-n-200 bg-n-000 p-s3",
        markeer ? "ring-2 ring-[#A08A00]" : "",
      ].join(" ")}
    >
      <Image
        src={warmtefonds}
        // Geen "keurmerk" en geen "partner" in de alt-tekst: een schermlezer
        // hoort dan een verband dat er niet is. Alleen de naam.
        alt="Nationaal Warmtefonds"
        sizes="160px"
        className="h-[38px] w-auto shrink-0 sm:h-[46px]"
      />
      <div>
        <p className="text-[0.9rem] leading-relaxed text-n-500">
          Je hoeft dit niet in één keer te betalen: financiering via het
          Nationaal Warmtefonds is mogelijk. Of het in jouw situatie kan, en
          tegen welke voorwaarden, bespreken we in het adviesgesprek.
        </p>
        {markeer && (
          <p className="mt-s1">
            <span className="placeholder-label">
              V8 · {regel.status}
            </span>{" "}
            <span className="text-[0.78rem] text-n-500">
              Voorbeeld — verdwijnt in live-modus tot dit is aangetoond.
            </span>
          </p>
        )}
      </div>
    </aside>
  );
}
