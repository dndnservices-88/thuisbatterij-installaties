import { test } from "node:test";
import assert from "node:assert/strict";

import { bevestigingAanKlant, magBevestigingVersturen, meldingAanAdviseur } from "./berichten";
import { controleer } from "./leadcontrole";
import { centen, euro } from "./calc";
import type { Lead } from "./opslag";

/**
 * Tests voor de twee mails.
 *
 * Deze zijn geschreven ná drie fouten die alleen boven water kwamen door de
 * mails met de hand uit te printen en te lezen. Alle drie waren onzichtbaar
 * voor de typecontrole en voor de build:
 *
 *  1. euro(0,109) gaf "€ 0". In de bevestigingsmail stond dus dat de klant
 *     niets aan terugleverkosten betaalt, terwijl de terugverdientijd
 *     eronder mét die 10,9 cent was doorgerekend.
 *  2. Boven de bedragen in de meldingsmail stond "Wat de klant op zijn scherm
 *     zag", terwijl het onze eigen hercontrole is. Bij een afwijking — precies
 *     het geval waarvoor die hercontrole bestaat — was dat bijschrift onjuist.
 *  3. De HTML-versie sneed met slice(regels.length ? 5 : 4) een stuk uit de
 *     blokkenlijst. Dat klopte alleen zonder waarschuwing; mét waarschuwing
 *     schoof alles op en stond de indicatie twee keer in de mail.
 *
 * De les: een mail is uitvoer die niemand leest tot een klant hem leest.
 */

const SNAPSHOT_MET_TLK = {
  antwoorden: {
    zonnepanelen: "ja",
    panelen: { soort: "aantal", aantal: 14 },
    verbruik: { soort: "kwh", kwh: 4100 },
    contract: "vast",
    eigenaar: true,
    terugleverkosten: 0.109,
  },
  uitkomst: null,
  zachte_lead: false,
};

function maakLead(overschrijf: Partial<Lead> = {}): Lead {
  const controle = controleer(overschrijf.calc_snapshot ?? SNAPSHOT_MET_TLK);
  // Dezelfde afscherming als in app/api/lead/route.ts: bij huurder en geen_pv
  // bestaat er wel een route maar geen bedragen. Zonder deze regel valt de
  // helper om op `besparing_eur.midden` van undefined — en dan test je je
  // testopstelling in plaats van de mail.
  const g =
    controle.uitkomst && controle.uitkomst.route !== "huurder" && controle.uitkomst.route !== "geen_pv"
      ? controle.uitkomst
      : null;
  return {
    id: "test-1",
    voornaam: "Sander",
    achternaam: "de Wit",
    telefoon: "0612345678",
    email: "sander@example.com",
    postcode: "1689 ZX",
    huisnummer: "62",
    toevoeging: "A",
    dagdeel: "ochtend",
    consent_tekst: "Toestemmingstekst",
    consent_versie: "1.0",
    consent_tijdstip: "2026-08-24T10:00:00.000Z",
    ip_adres: "84.24.1.9",
    user_agent: "Mozilla/5.0",
    pagina_url: "https://thuisbatterij-installaties.nl/",
    attributie: { utm_source: "google", gclid: "ABC123" },
    calc_snapshot: SNAPSHOT_MET_TLK,
    calc_controle: {
      route: controle.uitkomst?.route ?? null,
      besparing_midden: g?.besparing_eur.midden ?? null,
      terugverdientijd_midden: g?.terugverdientijd_jaar.midden ?? null,
      terugleverkosten: g?.terugleverkosten_eur ?? null,
      rekenversie: g?.rekenversie ?? null,
      komt_overeen: controle.komt_overeen,
    },
    bron_domein: "thuisbatterij-installaties.nl",
    event_id: "e1",
    variant: "rekensom",
    ...overschrijf,
  };
}

// ── Fout 1: het tarief ──────────────────────────────────────────────────────

test("een kWh-tarief wordt in centen getoond en niet afgerond naar nul", () => {
  // Let op: Intl zet een harde spatie (U+00A0) tussen € en het getal, geen
  // gewone. Vergelijken met een letterlijke "€ 0" faalt daarop met twee
  // strings die in de foutmelding identiek lijken. Vandaar match op het getal.
  assert.doesNotMatch(euro(0.109), /0,109/, "euro() hoort af te ronden — daarom bestaat centen()");
  assert.match(centen(0.109), /0,109/);
});

test("de bevestigingsmail noemt het terugleverkostentarief dat is doorgerekend", () => {
  const lead = maakLead();
  const controle = controleer(SNAPSHOT_MET_TLK);
  const mail = bevestigingAanKlant(lead, controle);

  assert.match(mail.tekst, /0,109/, "het tarief moet leesbaar in de mail staan");
  assert.doesNotMatch(
    mail.tekst,
    /€ 0 per teruggeleverde kWh/,
    "nooit '€ 0' melden bij een som die met 10,9 cent is gerekend"
  );
});

test("zonder terugleverkosten staat er geen zin over terugleverkosten in", () => {
  const zonder = { ...SNAPSHOT_MET_TLK, antwoorden: { ...SNAPSHOT_MET_TLK.antwoorden, terugleverkosten: undefined } };
  const controle = controleer(zonder);
  const mail = bevestigingAanKlant(maakLead({ calc_snapshot: zonder }), controle);
  assert.doesNotMatch(mail.tekst, /terugleverkosten betaalt/);
});

// ── Fout 2: het bijschrift boven de bedragen ────────────────────────────────

test("de meldingsmail schrijft de bedragen niet toe aan het scherm van de klant", () => {
  const controle = controleer(SNAPSHOT_MET_TLK);
  const mail = meldingAanAdviseur(maakLead(), controle);

  assert.doesNotMatch(
    mail.tekst,
    /op zijn scherm zag/,
    "deze bedragen komen uit de hercontrole; bij een afwijking zag de klant iets anders"
  );
  assert.match(mail.tekst, /Onze doorrekening/);
});

test("bij een afwijking staat er een waarschuwing met beide bedragen", () => {
  const gelogen = {
    ...SNAPSHOT_MET_TLK,
    uitkomst: {
      route: "lead",
      besparing_eur: { laag: 2000, midden: 2600, hoog: 3200 },
      terugverdientijd_jaar: { laag: 2, midden: 2.5, hoog: 3 },
      terugleverkosten_eur: 0.109,
      rekenversie: "1.1.0",
    },
  };
  const controle = controleer(gelogen);

  assert.equal(controle.komt_overeen, false);

  const mail = meldingAanAdviseur(maakLead({ calc_snapshot: gelogen }), controle);
  assert.match(mail.tekst, /LET OP: de herberekening wijkt af/);
  assert.match(mail.tekst, /2600/, "het gemelde bedrag moet zichtbaar zijn");
  assert.match(mail.tekst, /ONZE getallen/);
});

// ── Fout 3: de HTML-opbouw ──────────────────────────────────────────────────

function tel(hooiberg: string, naald: string): number {
  return hooiberg.split(naald).length - 1;
}

test("de indicatie staat precies één keer in de HTML, ook mét waarschuwing", () => {
  const controle = controleer(SNAPSHOT_MET_TLK);
  const mail = meldingAanAdviseur(maakLead(), controle);

  // Deze lead heeft gegarandeerd minstens één waarschuwing: de entiteit staat
  // nog niet vast. Juist dat geval liep in de oude opbouw mis.
  assert.match(mail.tekst, /Let op/);
  assert.equal(tel(mail.html, "Extra zelfverbruik"), 1, "indicatie mag niet verdubbelen");
  assert.equal(tel(mail.html, "Toestemming (bewaar dit"), 1);
});

test("naam, nummer en belvenster staan niet nogmaals in het grijze blok", () => {
  const controle = controleer(SNAPSHOT_MET_TLK);
  const mail = meldingAanAdviseur(maakLead(), controle);
  assert.equal(tel(mail.html, "0612345678"), 2, "één keer als telefoonlink, één keer als linktekst");
  assert.equal(tel(mail.html, "Bellen:"), 1);
});

test("elk blok uit de tekstversie komt ook in de HTML terug", () => {
  const controle = controleer(SNAPSHOT_MET_TLK);
  const mail = meldingAanAdviseur(maakLead(), controle);
  for (const kop of ["Ingevuld:", "Herkomst:", "Toestemming (bewaar dit"]) {
    assert.ok(mail.html.includes(kop), `${kop} ontbreekt in de HTML-versie`);
  }
});

// ── De poort ────────────────────────────────────────────────────────────────

test("zonder contactpunt gaat er geen bevestiging naar een klant", () => {
  // CONTACT.ingevuld staat op false zolang de entiteitskeuze niet rond is.
  const poort = magBevestigingVersturen();
  assert.equal(poort.mag, false);
  assert.match(poort.reden ?? "", /CONTACT/);
});

test("een huurder krijgt geen bedragen te zien in de bevestigingsmail", () => {
  const huurder = {
    ...SNAPSHOT_MET_TLK,
    antwoorden: { ...SNAPSHOT_MET_TLK.antwoorden, eigenaar: false },
  };
  const controle = controleer(huurder);
  const mail = bevestigingAanKlant(maakLead({ calc_snapshot: huurder }), controle);

  assert.doesNotMatch(mail.tekst, /Indicatieve besparing/);
  assert.match(mail.tekst, /geen doorrekening/);
});

test("de meldingsmail zet naam en nummer in het onderwerp", () => {
  const controle = controleer(SNAPSHOT_MET_TLK);
  const mail = meldingAanAdviseur(maakLead(), controle);
  assert.match(mail.onderwerp, /Sander de Wit/);
  assert.match(mail.onderwerp, /1689 ZX/);
});
