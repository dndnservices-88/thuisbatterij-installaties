"use client";

import { useMemo, useState } from "react";
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

  // Compact sinds 13 nov 2026 (Dieudonné: "banner veel te groot"): één strook
  // met prijs + knop en één regel kleine tekst. Garanties staan al in de balk
  // eronder en de rekentool staat ernaast, dus die zijn hier weggelaten.
  return (
    <div className="mt-s4 max-w-[520px] rounded-merk border border-white/15 bg-white/[0.07] px-s3 py-s3">
      <div className="flex flex-wrap items-center justify-between gap-s3">
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
        </AlsClaim>
        {!open && (
          <Knop
            volleBreedte={false}
            onClick={() => {
              meld("terugbel_open");
              setOpen(true);
            }}
          >
            Bel mij terug
          </Knop>
        )}
      </div>
      <AlsClaim id="P2">
        <p className="mt-s1 text-[0.8rem] leading-snug text-n-200">
          <Claim id="P2" />.
        </p>
      </AlsClaim>

      {open && (
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
