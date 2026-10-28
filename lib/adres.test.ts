import { test } from "node:test";
import assert from "node:assert/strict";

import { leesPdok, normaliseerHuisnummer, normaliseerPostcode, pdokZoekUrl } from "./adres";

// Antwoord zoals PDOK het op 28 okt 2026 gaf voor 1689ZX + 62 (ingekort).
const ZWAAG = {
  response: {
    numFound: 3,
    docs: [
      { woonplaatsnaam: "Zwaag", postcode: "1689ZX", provincienaam: "Noord-Holland", huisnummer: 62, straatnaam: "Jelle Zijlstraweg" },
      { woonplaatsnaam: "Zwaag", huisletter: "A", postcode: "1689ZX", provincienaam: "Noord-Holland", huisnummer: 62, straatnaam: "Jelle Zijlstraweg" },
      { woonplaatsnaam: "Zwaag", huisletter: "B", postcode: "1689ZX", provincienaam: "Noord-Holland", huisnummer: 62, straatnaam: "Jelle Zijlstraweg" },
    ],
  },
};

test("postcode: spatie en kleine letters worden genormaliseerd; ongeldig = null", () => {
  assert.equal(normaliseerPostcode("1689 zx"), "1689ZX");
  assert.equal(normaliseerPostcode("0123AB"), null);
  assert.equal(normaliseerPostcode("1689Z"), null);
});

test("huisnummer: alleen cijfers, niet 0", () => {
  assert.equal(normaliseerHuisnummer(" 62 "), "62");
  assert.equal(normaliseerHuisnummer("0"), null);
  assert.equal(normaliseerHuisnummer("62a"), null);
});

test("zoek-URL filtert op postcode, huisnummer en type adres", () => {
  const u = new URL(pdokZoekUrl("1689ZX", "62"));
  assert.deepEqual(u.searchParams.getAll("fq"), ["postcode:1689ZX", "huisnummer:62", "type:adres"]);
});

test("PDOK-antwoord: straat, woonplaats, provincie en toevoegingen", () => {
  const r = leesPdok(ZWAAG);
  assert.equal(r.gevonden, true);
  assert.equal(r.straat, "Jelle Zijlstraweg");
  assert.equal(r.woonplaats, "Zwaag");
  assert.equal(r.provincie, "Noord-Holland");
  assert.deepEqual(r.toevoegingen, ["A", "B"]);
  assert.equal(r.toevoeging_klopt, null);
});

test("toevoeging: bestaande klopt (hoofdletterongevoelig), onbekende niet", () => {
  assert.equal(leesPdok(ZWAAG, "a").toevoeging_klopt, true);
  assert.equal(leesPdok(ZWAAG, "C").toevoeging_klopt, false);
});

test("letter plus nummertoevoeging wordt A-1", () => {
  const r = leesPdok({ response: { docs: [{ straatnaam: "X", huisletter: "A", huisnummertoevoeging: "1" }, { straatnaam: "X", huisnummertoevoeging: "2" }] } });
  assert.deepEqual(r.toevoegingen, ["2", "A-1"]);
  assert.equal(leesPdok({ response: { docs: [{ straatnaam: "X", huisletter: "A", huisnummertoevoeging: "1" }] } }, "a1").toevoeging_klopt, true);
});

test("niets gevonden of rommel = gevonden false, nooit een fout", () => {
  assert.equal(leesPdok({ response: { docs: [] } }).gevonden, false);
  assert.equal(leesPdok(null).gevonden, false);
  assert.equal(leesPdok("rommel").gevonden, false);
});

import { adresregel } from "./berichten";
import type { Lead } from "./opslag";

test("adresregel in de melding: gevonden, niet gevonden, niet gecontroleerd, foute toevoeging", () => {
  const basis = { huisnummer: "62", toevoeging: "A", postcode: "1689ZX" } as Lead;
  assert.equal(
    adresregel({ ...basis, adres_controle: { gevonden: true, straat: "Jelle Zijlstraweg", woonplaats: "Zwaag", provincie: "Noord-Holland", toevoeging_klopt: true } }),
    "Jelle Zijlstraweg 62A, 1689ZX Zwaag (Noord-Holland)"
  );
  assert.match(adresregel({ ...basis, adres_controle: { gevonden: false, toevoeging_klopt: null } }), /NIET gevonden/);
  assert.match(adresregel({ ...basis, adres_controle: null }), /niet gecontroleerd/);
  assert.match(
    adresregel({ ...basis, adres_controle: { gevonden: true, straat: "X", woonplaats: "Y", toevoeging_klopt: false } }),
    /bestaat niet in de BAG/
  );
});
