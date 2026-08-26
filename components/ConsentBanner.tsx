"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  bewaarConsent,
  leesConsent,
  nieuweToestemming,
  pasConsentToe,
  CONSENT_VERSIE,
  HEROPEN_EVENT,
  type Toestemming,
} from "@/lib/tracking";
import { vangKlikIds } from "@/lib/klikids";

/**
 * Cookiebanner met toestemming per categorie.
 *
 * Vier dingen die hier bewust zo staan:
 *
 *  1. Weigeren is even makkelijk als accepteren — twee even grote knoppen, naast
 *     elkaar, op dezelfde regel. Een weggestopte weigerknop is op zichzelf een
 *     overtreding, ook als de tekst erboven klopt.
 *
 *  2. "Noodzakelijk" staat er wel bij maar is niet uit te zetten, en de schakelaar
 *     is dus zichtbaar uitgeschakeld in plaats van weggelaten. Wat je niet toont,
 *     kan de bezoeker niet controleren.
 *
 *  3. Klik-ID's worden altijd vastgelegd, ook zonder toestemming. Dat mag: het is
 *     functionele, first-party opslag voor de eigen leadadministratie, niet voor
 *     het volgen over websites heen. De tags in Tag Manager blijven wél uit tot
 *     iemand accepteert.
 *
 *  4. De banner is te heropenen vanuit de voettekst. Een toestemming die je niet
 *     kunt intrekken, is geen geldige toestemming.
 */
export default function ConsentBanner() {
  const [zichtbaar, setZichtbaar] = useState(false);
  const [instellen, setInstellen] = useState(false);
  const [statistieken, setStatistieken] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    vangKlikIds();
    const bestaand = leesConsent();

    if (!bestaand) {
      setZichtbaar(true);
      return;
    }

    pasConsentToe(bestaand);
    setStatistieken(bestaand.statistieken);
    setMarketing(bestaand.marketing);

    // Keuze uit het oude cookieformaat: stilzwijgend overzetten naar het nieuwe.
    // Dat mag omdat de vertaling volledig is (zie ontleedConsent). De bezoeker
    // hoeft niets opnieuw te kiezen, en zonder deze regel zou hij bij elk bezoek
    // door de oude waarde blijven lopen.
    if (bestaand.versie < CONSENT_VERSIE) {
      bewaarConsent(nieuweToestemming({ statistieken: bestaand.statistieken, marketing: bestaand.marketing }));
    }
  }, []);

  // Heropenen vanuit de voettekst, met de huidige keuze al ingevuld.
  useEffect(() => {
    function heropen() {
      const bestaand = leesConsent();
      setStatistieken(bestaand?.statistieken ?? false);
      setMarketing(bestaand?.marketing ?? false);
      setInstellen(true);
      setZichtbaar(true);
    }
    window.addEventListener(HEROPEN_EVENT, heropen);
    return () => window.removeEventListener(HEROPEN_EVENT, heropen);
  }, []);

  const leg = useCallback((keuze: { statistieken: boolean; marketing: boolean }) => {
    const t: Toestemming = nieuweToestemming(keuze);
    bewaarConsent(t);
    pasConsentToe(t);
    setStatistieken(keuze.statistieken);
    setMarketing(keuze.marketing);
    setZichtbaar(false);
    setInstellen(false);
  }, []);

  if (!zichtbaar) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookievoorkeuren"
      aria-modal="false"
      className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto border-t border-n-200 bg-n-000 px-s3 py-s3 shadow-[0_-4px_24px_rgba(0,0,0,0.12)]"
    >
      <div className="mx-auto max-w-inhoud">
        <div className="flex flex-col gap-s3 sm:flex-row sm:items-center">
          <p className="flex-1 text-[0.9rem] text-n-500">
            Wij gebruiken cookies die nodig zijn om de site te laten werken. Met jouw toestemming
            meten we ook hoe de site gebruikt wordt en welke advertenties tot een berekening leiden.
            Je kunt dit later wijzigen via de link onderaan de pagina.{" "}
            <Link href="/privacyverklaring" className="font-semibold text-paars underline">
              Privacyverklaring
            </Link>
          </p>
          <div className="flex gap-s2">
            <button
              onClick={() => leg({ statistieken: false, marketing: false })}
              className="min-h-[48px] flex-1 rounded-merk border border-n-200 px-s3 font-kop text-[0.95rem] font-semibold text-paars hover:border-paars sm:flex-none"
            >
              Alleen noodzakelijk
            </button>
            <button
              onClick={() => leg({ statistieken: true, marketing: true })}
              className="min-h-[48px] flex-1 rounded-merk bg-paars px-s3 font-kop text-[0.95rem] font-semibold text-n-000 hover:bg-paars-donker sm:flex-none"
            >
              Alles accepteren
            </button>
          </div>
        </div>

        {!instellen && (
          <button
            onClick={() => setInstellen(true)}
            aria-expanded={false}
            className="mt-s2 text-[0.85rem] font-semibold text-paars underline"
          >
            Zelf instellen
          </button>
        )}

        {instellen && (
          <div className="mt-s3 border-t border-n-200 pt-s3">
            <Categorie
              titel="Noodzakelijk"
              uitleg="Nodig om de site te laten werken en om jouw keuze hier te onthouden. Hier zit ook de vastlegging van hoe je op de site kwam, voor onze eigen administratie."
              aan
              vast
            />
            <Categorie
              titel="Statistieken"
              uitleg="Meet welke stappen van de berekening mensen afmaken en waar ze afhaken. Zonder deze cookies weten we niet welk deel van de site niet werkt."
              aan={statistieken}
              onWijzig={setStatistieken}
            />
            <Categorie
              titel="Marketing"
              uitleg="Meet welke advertentie tot een berekening leidde, bij Google en Meta. Zonder deze cookies betalen we voor advertenties zonder te weten welke iets opleveren."
              aan={marketing}
              onWijzig={setMarketing}
            />
            <button
              onClick={() => leg({ statistieken, marketing })}
              className="mt-s3 min-h-[48px] w-full rounded-merk border border-paars px-s3 font-kop text-[0.95rem] font-semibold text-paars hover:bg-paars hover:text-n-000 sm:w-auto"
            >
              Mijn keuze bewaren
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Categorie({
  titel,
  uitleg,
  aan,
  vast = false,
  onWijzig,
}: {
  titel: string;
  uitleg: string;
  aan: boolean;
  vast?: boolean;
  onWijzig?: (waarde: boolean) => void;
}) {
  return (
    <label className="mb-s3 flex cursor-pointer items-start gap-s2 last:mb-0">
      <input
        type="checkbox"
        checked={aan}
        disabled={vast}
        onChange={(e) => onWijzig?.(e.target.checked)}
        className="mt-[3px] h-[18px] w-[18px] shrink-0 accent-paars disabled:cursor-not-allowed disabled:opacity-60"
      />
      <span className="text-[0.85rem] text-n-500">
        <span className="font-kop font-semibold text-paars">{titel}</span>
        {vast && <span className="ml-s1 text-[0.78rem]">(altijd aan)</span>}
        <br />
        {uitleg}
      </span>
    </label>
  );
}
