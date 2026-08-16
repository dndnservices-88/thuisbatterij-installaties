"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { bewaarConsent, leesConsent, pasConsentToe, type ConsentKeuze } from "@/lib/tracking";
import { vangKlikIds } from "@/lib/klikids";

/**
 * Cookiebanner.
 *
 * Twee dingen die hier bewust zo staan:
 *  1. Weigeren is even makkelijk als accepteren — twee gelijkwaardige knoppen.
 *     Een weggestopte weigerknop is op zichzelf een overtreding.
 *  2. Klik-ID's worden altijd vastgelegd, ook zonder toestemming. Dat mag:
 *     het is functionele, first-party opslag voor de eigen leadadministratie,
 *     niet voor het volgen over websites heen. De advertentiescripts van Meta
 *     en Google blijven wél uit tot iemand accepteert.
 */
export default function ConsentBanner() {
  const [keuze, setKeuze] = useState<ConsentKeuze | null | "onbekend">("onbekend");

  useEffect(() => {
    vangKlikIds();
    const bestaand = leesConsent();
    setKeuze(bestaand);
    if (bestaand) pasConsentToe(bestaand);
  }, []);

  function kies(k: ConsentKeuze) {
    bewaarConsent(k);
    pasConsentToe(k);
    setKeuze(k);
  }

  if (keuze === "onbekend" || keuze !== null) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookievoorkeuren"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-n-200 bg-n-000 px-s3 py-s3 shadow-[0_-4px_24px_rgba(0,0,0,0.12)]"
    >
      <div className="mx-auto flex max-w-inhoud flex-col gap-s3 sm:flex-row sm:items-center">
        <p className="flex-1 text-[0.9rem] text-n-500">
          Wij gebruiken cookies die nodig zijn om de site te laten werken. Met jouw toestemming
          plaatsen we ook cookies van Google en Meta om te meten welke advertenties tot een
          berekening leiden. Je kunt dit later wijzigen.{" "}
          <Link href="/privacyverklaring" className="font-semibold text-paars underline">
            Privacyverklaring
          </Link>
        </p>
        <div className="flex gap-s2">
          <button
            onClick={() => kies("alleen_noodzakelijk")}
            className="min-h-[48px] flex-1 rounded-merk border border-n-200 px-s3 font-kop text-[0.95rem] font-semibold text-paars hover:border-paars sm:flex-none"
          >
            Alleen noodzakelijk
          </button>
          <button
            onClick={() => kies("alles")}
            className="min-h-[48px] flex-1 rounded-merk bg-paars px-s3 font-kop text-[0.95rem] font-semibold text-n-000 hover:bg-paars-donker sm:flex-none"
          >
            Accepteren
          </button>
        </div>
      </div>
    </div>
  );
}
