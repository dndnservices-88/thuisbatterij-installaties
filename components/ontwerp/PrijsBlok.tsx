"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import fotoBanner from "@/public/beeld/banner-batterij-garage.webp";
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

  // Variant D (keuze Dieudonné 13 nov 2026): staande sfeerfoto links in de
  // kaart, prijs en twee knoppen rechts. Alleen de goedkoopste variant (P9,
  // 1-fase); de 3-fase-prijs staat op /aanbod. Foto is tijdelijk een
  // huiskamerbeeld; wordt vervangen door een garage/meterkast-beeld.
  return (
    <div className="mt-s4 grid max-w-[540px] grid-cols-[120px_1fr] gap-s3 rounded-merk border border-white/15 bg-white/[0.07] p-s2 sm:grid-cols-[150px_1fr] sm:p-s3">
      <div className="relative min-h-[170px] overflow-hidden rounded-[8px]">
        <Image
          src={fotoBanner}
          alt="Thuisbatterij van 10 kWh in een bijkeuken, naast de meterkast"
          fill
          sizes="150px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0">
        <AlsClaim id="P2">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#CBB6E8]">
            Thuisbatterij 10 kWh incl. installatie
          </p>
          {vanaf && (
            <p className="font-kop text-[2rem] font-extrabold leading-tight text-n-000">
              <span className="text-[0.95rem] font-semibold text-n-200">vanaf </span>
              {vanaf}
            </p>
          )}
          <p className="mt-[2px] text-[0.78rem] leading-snug text-n-200">
            <Claim id="P9" />.
          </p>
        </AlsClaim>
        {!open && (
          <div className="mt-s3 grid gap-s2">
            <Knop
              onClick={() => {
                meld("terugbel_open");
                setOpen(true);
              }}
            >
              Bel mij terug
            </Knop>
            <Link
              href="/aanbod#prijzen"
              className="inline-flex min-h-[48px] items-center justify-center rounded-merk border border-white/50 px-s3 font-kop text-[1rem] font-semibold text-n-000 hover:bg-white/10"
            >
              Bekijk de prijzen
            </Link>
          </div>
        )}
      </div>
      {open && (
        <div className="col-span-2 rounded-merk bg-n-000 p-s4 text-n-900">
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
