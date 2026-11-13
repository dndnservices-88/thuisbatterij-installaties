"use client";

import { useMemo, useState } from "react";
import { CLAIMS, mag } from "@/lib/claims";
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

  return (
    <div className="mt-s4 max-w-[520px] rounded-merk border border-white/15 bg-white/[0.07] p-s3 sm:p-s4">
      {/* Prijs en knop op één regel: zo staat de knop op een laptopscherm
          (±800 px hoog) boven de vouw (gemeten 13 nov 2026). */}
      <div className="flex flex-wrap items-end justify-between gap-s3">
        <AlsClaim id="P2">
          <p className="text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-[#CBB6E8]">
            Thuisbatterij met installatie
          </p>
          {vanaf && (
            <p className="mt-s1 font-kop text-[2.2rem] font-extrabold leading-none text-n-000">
              <span className="text-[1rem] font-semibold text-n-200">vanaf </span>
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
        <p className="mt-s2 text-[0.9rem] leading-snug text-n-200">
          <Claim id="P2" />.
        </p>
      </AlsClaim>

      {(mag("U3") || mag("U4")) && (
        <ul className="mt-s3 space-y-[6px] text-[0.9rem] text-n-000">
          {(["U3", "U4"] as const)
            .filter((id) => mag(id))
            .map((id) => (
              <li key={id} className="flex items-start gap-s2">
                <span aria-hidden="true" className="mt-[1px] text-[#CBB6E8]">
                  ✓
                </span>
                <span>
                  <Claim id={id} />
                </span>
              </li>
            ))}
        </ul>
      )}

      {!open ? (
        <a href="#calculator" className="mt-s3 inline-block text-[0.92rem] font-semibold text-n-000 underline">
          of reken eerst uit wat het jou oplevert
        </a>
      ) : (
        <div className="mt-s4 rounded-merk bg-n-000 p-s4 text-n-900">
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
