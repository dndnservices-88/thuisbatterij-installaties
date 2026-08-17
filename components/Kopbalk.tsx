import Image from "next/image";
import Link from "next/link";
import { DOMEIN } from "@/lib/site";
import logoKleur from "@/public/beeld/logo-kleur.webp";

/**
 * Smalle balk bovenaan met het merk. Bewust zonder navigatie en zonder tweede
 * knop: één actie per pagina, en dat is de calculator. Elke extra keuze hierboven
 * kost leads.
 *
 * De balk is wit en niet paars. Op paars liep hij over in de hero: geen koprand,
 * dus las het oog het logo als onderdeel van het heroblok in plaats van als
 * afzender. Wit geeft die rand wél, en op wit kan het kleurenlogo gebruikt
 * worden — het merk zoals het is ontworpen.
 *
 * De afsluitlijn is geel en niet grijs. Grijs op wit verdween tegen de paarse
 * hero eronder; geel is de accentkleur uit het brandbook en houdt stand tegen
 * zowel wit als paars. Dit is de enige plek waar geel als vlak wordt gebruikt —
 * als tekstkleur mag het nooit (1,18:1 op wit).
 */
export default function Kopbalk() {
  return (
    <header className="border-b-[3px] border-geel bg-n-000 px-s3 py-s3">
      <div className="mx-auto max-w-inhoud">
        <Link
          href="/"
          className="inline-block"
          aria-label="Thuisbatterij Installaties, naar de startpagina"
        >
          <Image
            src={logoKleur}
            alt="Thuisbatterij Installaties"
            priority
            sizes="340px"
            className="h-[30px] w-auto sm:h-[38px]"
          />
          {/* Het woordmerk zegt dit ook al. De URL staat er toch onder omdat de
              bezoeker uit een advertentie komt en het domein moet herkennen —
              vandaar klein en grijs, als onderschrift en niet als tweede logo. */}
          <span className="mt-s1 block text-[0.72rem] tracking-[0.06em] text-n-500 sm:text-[0.8rem]">
            {DOMEIN}
          </span>
        </Link>
      </div>
    </header>
  );
}
