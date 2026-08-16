import test from "node:test";
import assert from "node:assert/strict";
import { bereken, CONSTANTEN, doorzet, ASSORTIMENT } from "./calc.ts";
import type { Antwoorden } from "./calc.ts";

/**
 * De drie testcases uit Limsolar_Specificatie_Calculator_16aug2026.md, sectie 8.
 * Draaien met: npm test
 */

const basis: Antwoorden = {
  zonnepanelen: "ja",
  panelen: { soort: "aantal", aantal: 14 },
  verbruik: { soort: "kwh", kwh: 4100 },
  contract: "vast",
  eigenaar: true,
};

test("case A — de persona uit het brandbook komt rond de 8 jaar uit, niet op 13", () => {
  const u = bereken(basis);
  assert.equal(u.route, "lead");
  if (u.route !== "lead") return;
  // De geleverde site kwam op 13,0 jaar door met een generieke systeemprijs te
  // rekenen in plaats van met het eigen aanbod. Dit is de kerncorrectie.
  assert.ok(u.terugverdientijd_jaar.midden > 7, `middenwaarde ${u.terugverdientijd_jaar.midden}`);
  assert.ok(u.terugverdientijd_jaar.midden < 10, `middenwaarde ${u.terugverdientijd_jaar.midden}`);
  assert.equal(u.product.id, "marstek-venus-e-3-0");
});

test("case B — te klein huishouden eindigt in het niet-rendabel-scherm", () => {
  const u = bereken({
    ...basis,
    panelen: { soort: "aantal", aantal: 6 },
    verbruik: { soort: "kwh", kwh: 1800 },
  });
  assert.equal(u.route, "niet_rendabel");
});

test("case C — dynamisch contract levert meer op en de capaciteit schiet niet door", () => {
  const invoer: Antwoorden = {
    ...basis,
    panelen: { soort: "aantal", aantal: 20 },
    verbruik: { soort: "kwh", kwh: 5500 },
    contract: "dynamisch",
  };
  const dyn = bereken(invoer);
  const vast = bereken({ ...invoer, contract: "vast" });
  assert.equal(dyn.route, "lead");
  if (dyn.route !== "lead" || vast.route === "huurder" || vast.route === "geen_pv") return;
  assert.ok(dyn.besparing_eur.midden > vast.besparing_eur.midden);
  // Capaciteit mag nooit groter zijn dan een product dat werkelijk bestaat.
  const grootste = Math.max(...ASSORTIMENT.map((p) => p.capaciteit_kwh));
  assert.ok(dyn.product.capaciteit_kwh <= grootste);
  assert.equal(dyn.product_is_begrensd, true);
});

test("huurder wordt gediskwalificeerd vóór er iets berekend wordt", () => {
  assert.equal(bereken({ ...basis, eigenaar: false }).route, "huurder");
});

test("geen zonnepanelen krijgt een eigen route", () => {
  assert.equal(bereken({ ...basis, zonnepanelen: "nee" }).route, "geen_pv");
});

test("de dubbele begrenzing werkt: opslag wordt door de avondbehoefte gekapt", () => {
  // Veel panelen, weinig verbruik: het overschot is groot maar er is 's avonds
  // weinig af te nemen. Zonder deze begrenzing adviseer je een te groot systeem.
  const u = bereken({
    ...basis,
    panelen: { soort: "aantal", aantal: 30 },
    verbruik: { soort: "kwh", kwh: 4000 },
  });
  if (u.route === "huurder" || u.route === "geen_pv") return assert.fail("verkeerde route");
  assert.ok(u.opslagpotentieel_kwh < u.overschot_kwh);
  assert.equal(u.opslagpotentieel_kwh, u.avondbehoefte_kwh);
});

test("elk resultaat is een bandbreedte, nooit één getal", () => {
  const u = bereken(basis);
  if (u.route !== "lead") return assert.fail("verkeerde route");
  assert.ok(u.besparing_eur.min < u.besparing_eur.max);
  assert.ok(u.extra_zelfverbruik_kwh.min < u.extra_zelfverbruik_kwh.max);
  assert.ok(u.terugverdientijd_jaar.min < u.terugverdientijd_jaar.max);
});

test("elk product in het assortiment heeft een bekende prijs", () => {
  for (const p of ASSORTIMENT) {
    assert.ok(p.prijs_eur > 0, `${p.naam} heeft geen prijs`);
    assert.ok(doorzet(p) > 0);
  }
});

test("terugleverkosten staan conservatief op nul zolang ze onbevestigd zijn", () => {
  assert.equal(CONSTANTEN.TERUGLEVERKOSTEN, 0);
});
