import Image from "next/image";
import Link from "next/link";
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
 *
 * De regel "thuisbatterij-installaties.nl" onder het logo is eruit. Die stond er
 * omdat de bezoeker uit een advertentie komt en het domein moet herkennen, maar
 * het nieuwe woordmerk schrijft THUISBATTERIJ INSTALLATIES al voluit op twee
 * regels. Een derde regel die vrijwel hetzelfde zegt maakte de balk alleen maar
 * hoger, en elke pixel hier duwt de calculator verder onder de vouw. Netto is de
 * balk nu 16 pixels korter ondanks het grotere logo.
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
          {/* Groter dan de 38 van hiervoor. Het woordmerk staat sinds de nieuwe
              bestanden op twee regels: de verhouding ging van 8:1 naar 4:1. Op
              38 pixels hoog wordt elke tekstregel 15 pixels, en dat is te klein
              om als afzender te werken. Op 48 is het 19. */}
          <Image
            src={logoKleur}
            alt="Thuisbatterij Installaties"
            priority
            sizes="200px"
            className="h-[38px] w-auto sm:h-[48px]"
          />
        </Link>
      </div>
    </header>
  );
}
