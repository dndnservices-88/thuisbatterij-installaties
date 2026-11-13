"use client";

import { useMemo } from "react";
import Formulier from "@/components/calculator/Formulier";
import { nieuwEventId } from "@/lib/tracking";

/** Terugbelformulier onderaan /aanbod: zelfde korte formulier als in de hero. */
export default function AanbodTerugbel() {
  const eventId = useMemo(() => nieuwEventId(), []);
  return (
    <div className="rounded-merk bg-n-000 p-s4 sm:p-s5">
      <Formulier soort="terugbel" eventId={eventId} zacht={false} />
    </div>
  );
}
