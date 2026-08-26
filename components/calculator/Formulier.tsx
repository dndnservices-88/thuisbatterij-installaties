"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Antwoorden, Uitkomst } from "@/lib/calc";
import { CONSENT } from "@/lib/site";
import { leesAttributie } from "@/lib/klikids";
import { meld } from "@/lib/tracking";
import { Knop } from "@/components/ui/Knop";
import { Veld, GetalVeld } from "@/components/ui/Veld";

/**
 * Scherm A (gegevens) en scherm B (dagdeel).
 *
 * Twee keuzes die hier bewust zo staan:
 *  • Niet meer velden dan nodig. Elk extra veld kost leads en je kwalificeert
 *    toch telefonisch.
 *  • De consent-checkbox is verplicht en staat NIET vooraf aangevinkt. Het
 *    telemarketingverbod voor de energiesector geldt sinds 1 juli 2026; het hele
 *    belmodel rust op deze zin en op het bewijs dat hij is aangevinkt.
 *
 * Het dagdeel staat op een apart scherm ná de gegevens. Dat maakt van "we nemen
 * contact op" een afspraak en verhoogt de bereikratio.
 */

type Dagdeel = "ochtend" | "middag" | "avond";

const DAGDELEN: [Dagdeel, string][] = [
  ["ochtend", "Ochtend — 09:00 tot 12:00"],
  ["middag", "Middag — 12:00 tot 18:00"],
  ["avond", "Avond — tot 21:00"],
];

export default function Formulier({
  antwoorden,
  uitkomst,
  eventId,
  zacht,
}: {
  antwoorden: Antwoorden;
  uitkomst: Uitkomst;
  eventId: string;
  zacht: boolean;
}) {
  const [scherm, setScherm] = useState<"a" | "b" | "klaar">("a");
  const [v, setV] = useState({
    voornaam: "",
    achternaam: "",
    telefoon: "",
    email: "",
    postcode: "",
    huisnummer: "",
    toevoeging: "",
  });
  const [consent, setConsent] = useState(false);
  const [fouten, setFouten] = useState<Record<string, string>>({});
  const [bezig, setBezig] = useState(false);
  const [serverfout, setServerfout] = useState<string | null>(null);

  useEffect(() => {
    meld("lead_form_view", { zacht });
  }, [zacht]);

  function controleer() {
    const f: Record<string, string> = {};
    if (v.voornaam.trim().length < 2) f.voornaam = "Vul je voornaam in.";
    if (v.achternaam.trim().length < 2) f.achternaam = "Vul je achternaam in.";
    if (v.telefoon.replace(/\D/g, "").length < 10) f.telefoon = "Vul een geldig telefoonnummer in.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v.email)) f.email = "Vul een geldig e-mailadres in.";
    if (!/^[1-9][0-9]{3}\s?[A-Za-z]{2}$/.test(v.postcode.trim()))
      f.postcode = "Vul een postcode in, bijvoorbeeld 1689 ZX.";
    if (!v.huisnummer.trim()) f.huisnummer = "Vul je huisnummer in.";
    if (!consent) f.consent = "Zonder deze toestemming mogen wij je niet bellen.";
    setFouten(f);
    return Object.keys(f).length === 0;
  }

  async function verstuur(dagdeel: Dagdeel) {
    setBezig(true);
    setServerfout(null);
    meld("lead_timeslot", { dagdeel });

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...v,
          dagdeel,
          consent_tekst: CONSENT.tekst,
          consent_versie: CONSENT.versie,
          event_id: eventId,
          attributie: leesAttributie(),
          // Invoer én getoonde uitkomst: de adviseur ziet vóór het telefoontje
          // precies wat de klant op het scherm zag (claimregister R4).
          calc_snapshot: { antwoorden, uitkomst, zachte_lead: zacht },
          pagina_url: window.location.href,
        }),
      });
      if (!res.ok) throw new Error(await res.text());

      // Eén gebeurtenis, drie afnemers. GA4, de Google Ads-conversie en de
      // Meta-tag hangen in GTM allemaal onder dit ene event.
      //
      // event_id en transaction_id zijn hetzelfde nummer onder twee namen, en
      // dat is met opzet: Meta ontdubbelt op event_id tegen wat de server via
      // de CAPI stuurt, Google Ads ontdubbelt op transaction_id tegen een
      // herladen bedankscherm. Eén bron, dus ze kunnen niet uit elkaar lopen.
      meld("Lead", { event_id: eventId, transaction_id: eventId, zacht });
      setScherm("klaar");
    } catch (e) {
      setServerfout(
        "Er ging iets mis bij het verzenden. Probeer het nog een keer, of bel ons als het blijft hangen."
      );
      console.error(e);
    } finally {
      setBezig(false);
    }
  }

  if (scherm === "klaar") {
    return (
      <div>
        <h3 className="mb-s3 text-[1.4rem]">Gelukt — we bellen je</h3>
        <p className="text-[0.95rem] leading-relaxed text-n-500">
          Je berekening is verstuurd. Je krijgt een bevestiging per e-mail met de uitkomst en het
          dagdeel dat je hebt gekozen. Wij bellen je op dat moment voor een adviesgesprek van een
          minuut of tien.
        </p>
        <p className="mt-s3 text-[0.95rem] leading-relaxed text-n-500">
          Blijkt uit dat gesprek dat een thuisbatterij bij jou niet uitkomt, dan zeggen we dat. Dat
          is geen beleefdheidsfrase: wij hebben er niets aan om iemand iets te verkopen dat zich niet
          terugverdient.
        </p>
      </div>
    );
  }

  if (scherm === "b") {
    return (
      <div>
        <h3 className="mb-s2 text-[1.4rem]">Wanneer bellen we je?</h3>
        <p className="mb-s3 text-[0.9rem] text-n-500">
          Kies een dagdeel dat jou uitkomt. Dan hoef je niet te wachten op een onbekend nummer.
        </p>
        <div className="grid gap-s2">
          {DAGDELEN.map(([w, l]) => (
            <Knop key={w} soort="primair" disabled={bezig} onClick={() => verstuur(w)}>
              {l}
            </Knop>
          ))}
        </div>
        {serverfout && (
          <p role="alert" className="mt-s3 text-[0.9rem] font-semibold text-red-700">
            {serverfout}
          </p>
        )}
        <button
          type="button"
          onClick={() => setScherm("a")}
          className="mt-s4 text-[0.9rem] font-semibold text-n-500 underline"
        >
          ← Terug
        </button>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (controleer()) setScherm("b");
      }}
    >
      <h3 className="mb-s2 text-[1.4rem]">Waar mogen we je advies naartoe sturen?</h3>
      <p className="mb-s4 text-[0.9rem] text-n-500">
        Zes velden, meer niet. De rest bespreken we telefonisch.
      </p>

      <div className="grid gap-s3 sm:grid-cols-2">
        <Veld
          id="voornaam"
          label="Voornaam"
          autoComplete="given-name"
          value={v.voornaam}
          fout={fouten.voornaam}
          onChange={(e) => setV({ ...v, voornaam: e.target.value })}
        />
        <Veld
          id="achternaam"
          label="Achternaam"
          autoComplete="family-name"
          value={v.achternaam}
          fout={fouten.achternaam}
          onChange={(e) => setV({ ...v, achternaam: e.target.value })}
        />
        <Veld
          id="telefoon"
          label="Telefoonnummer"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={v.telefoon}
          fout={fouten.telefoon}
          onChange={(e) => setV({ ...v, telefoon: e.target.value })}
        />
        <Veld
          id="email"
          label="E-mailadres"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={v.email}
          fout={fouten.email}
          onChange={(e) => setV({ ...v, email: e.target.value })}
        />
        <Veld
          id="postcode"
          label="Postcode"
          autoComplete="postal-code"
          value={v.postcode}
          fout={fouten.postcode}
          onChange={(e) => setV({ ...v, postcode: e.target.value.toUpperCase() })}
        />
        <div className="grid grid-cols-[2fr_1fr] gap-s2">
          <GetalVeld
            id="huisnummer"
            label="Huisnummer"
            value={v.huisnummer}
            fout={fouten.huisnummer}
            onChange={(e) => setV({ ...v, huisnummer: e.target.value.replace(/\D/g, "") })}
          />
          <Veld
            id="toevoeging"
            label="Toevoeging"
            value={v.toevoeging}
            onChange={(e) => setV({ ...v, toevoeging: e.target.value })}
          />
        </div>
      </div>

      <label
        htmlFor="consent"
        className={`mt-s4 flex cursor-pointer gap-s2 rounded-merk border p-s3 text-[0.88rem] leading-relaxed ${
          fouten.consent ? "border-red-700" : "border-n-200"
        }`}
      >
        <input
          id="consent"
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-[3px] h-[20px] w-[20px] flex-none accent-[#370060]"
        />
        <span className="text-n-500">
          {CONSENT.tekst.replace(" Zie de privacyverklaring.", " ")}
          <Link href="/privacyverklaring" className="font-semibold text-paars underline">
            Zie de privacyverklaring
          </Link>
          .
        </span>
      </label>
      {fouten.consent && (
        <p role="alert" className="mt-s1 text-[0.85rem] font-semibold text-red-700">
          {fouten.consent}
        </p>
      )}

      <Knop type="submit" className="mt-s4">
        Volgende
      </Knop>
    </form>
  );
}
