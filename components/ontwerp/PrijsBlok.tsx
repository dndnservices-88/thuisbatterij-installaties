"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import fotoMarstek from "@/public/beeld/marstek-10kwh.webp";
import { CLAIMS } from "@/lib/claims";
import { meld, nieuwEventId } from "@/lib/tracking";
import { AlsClaim, Claim } from "@/components/ui/Claim";
import { Knop } from "@/components/ui/Knop";
import Formulier from "@/components/calculator/Formulier";

/**
 * Prijs boven de vouw + "Bel mij terug" (13 nov 2026, prikbord r. 34).
 *
 * Besluit Dieudonné 13 nov: bezoekers willen niet alleen zien wat het bespaart
 * maar ook direct wat het kost. De advertenties noemen de vanaf-prijs; die moet
 * dus zonder scrollen terug te vinden zijn. Het grote bedrag komt uit de tekst
 * van claim P2 zelf, zodat advertentie, prijsblok en claimregister niet uit
 * elkaar kunnen lopen. Valt P2 weg, dan verdwijnt het bedrag en blijft alleen
 * de terugbelknop.
 *
 * Op mobiel staat dit blok boven de rekentool (linkerkolom komt eerst).
 */
export default function PrijsBlok() {
  const [open, setOpen] = useState(false);
  const eventId = useMemo(() => nieuwEventId(), []);
  const vanaf = CLAIMS.P2.tekst.match(/€\s?[\d.]+/)?.[0];

  // Paarse strook met transparante batterij (13 nov 2026, keuze Dieudonné na
  // previews: "het paarse voorbeeld was het beste"). Zachte lichte gloed achter
  // de donkere batterij; geen witte tegel, geen merknaam (besluit P6).
  // Knoppen: geel "Bel mij terug" + omlijnd "Bekijk het aanbod" (→ /aanbod).
  return (
    <div className="mt-s4 max-w-[540px] rounded-merk border border-white/15 bg-white/[0.07] px-s3 py-s3">
      <div className="flex items-center gap-s3">
        <div className="relative shrink-0">
          <div aria-hidden="true" className="absolute inset-[-10px] rounded-full bg-white/25 blur-[18px]" />
          <Image
            src={fotoMarstek}
            alt="Voorbeeld van een thuisbatterij van 10 kWh"
            width={72}
            height={88}
            className="relative drop-shadow-[0_6px_14px_rgba(0,0,0,0.45)]"
          />
        </div>
        <div className="min-w-0 flex-1">
          <AlsClaim id="P2">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#CBB6E8]">
              Thuisbatterij 10 kWh incl. installatie
            </p>
            {vanaf && (
              <p className="font-kop text-[1.9rem] font-extrabold leading-tight text-n-000">
                <span className="text-[0.95rem] font-semibold text-n-200">vanaf </span>
                {vanaf}
              </p>
            )}
            <p className="mt-[2px] text-[0.78rem] leading-snug text-n-200">
              <Claim id="P2" />.
            </p>
          </AlsClaim>
        </div>
      </div>

      {!open ? (
        <div className="mt-s3 grid grid-cols-2 gap-s2">
          <Knop
            onClick={() => {
              meld("terugbel_open");
              setOpen(true);
            }}
          >
            Bel mij terug
          </Knop>
          <Link
            href="/aanbod"
            className="inline-flex min-h-[52px] items-center justify-center rounded-merk border border-white/50 px-s3 font-kop text-[1rem] font-semibold text-n-000 hover:bg-white/10"
          >
            Bekijk het aanbod
          </Link>
        </div>
      ) : (
        <div className="mt-s3 rounded-merk bg-n-000 p-s4 text-n-900">
          <Formulier soort="terugbel" eventId={eventId} zacht={false} />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-s3 text-[0.85rem] font-semibold text-n-500 underline"
          >
            Sluiten
          </button>
        </div>
      )}
    </div>
  );
}
