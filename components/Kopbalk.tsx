import Image from "next/image";
import Link from "next/link";
import logoWit from "@/public/beeld/logo-wit.webp";

/**
 * Smalle balk bovenaan met het merk. Bewust zonder navigatie en zonder tweede
 * knop: één actie per pagina, en dat is de calculator. Elke extra keuze hierboven
 * kost leads.
 *
 * De achtergrond is hetzelfde paars als de hero, zodat balk en hero op de
 * startpagina in elkaar overlopen en het geen losse strook wordt.
 */
export default function Kopbalk() {
  return (
    <header className="bg-paars px-s3 pt-s4">
      <div className="mx-auto max-w-inhoud">
        <Link href="/" aria-label="Thuisbatterij Installaties, naar de startpagina">
          <Image
            src={logoWit}
            alt="Thuisbatterij Installaties"
            priority
            sizes="260px"
            className="h-[24px] w-auto sm:h-[28px]"
          />
        </Link>
      </div>
    </header>
  );
}
