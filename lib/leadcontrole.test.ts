import { test } from "node:test";
import assert from "node:assert/strict";

import { controleer, leesAntwoorden } from "./leadcontrole";

/**
 * Tests voor de server-side hercontrole.
 *
 * Deze code staat tussen een POST van buiten en een bevestigingsmail aan een
 * klant. Alles wat hier doorheen komt, wordt door ons uitgesproken. Er is geen
 * scherm waarop iemand het nog even nakijkt.
 *
 * De aanvaller hoeft geen hacker te zijn. Eén nieuwsgierige bezoeker met het
 * netwerktabblad open, of een script dat iemand op ons formulier loslaat, is
 * genoeg. Daarom testen we niet of de gelukkige route werkt — dat doet
 * calc.test.ts al — maar of de ongelukkige routes dichtzitten.
 */

const GOED = {
  zonnepanelen: "ja",
  panelen: { soort: "aantal", aantal: 14 },
  verbruik: { soort: "kwh", kwh: 4100 },
  contract: "vast",
  eigenaar: true,
};

function snapshot(antwoorden: unknown, extra: Record<string, unknown> = {}) {
  return { antwoorden, uitkomst: null, zachte_lead: false, ...extra };
}

// ── Wat er niet doorheen mag ────────────────────────────────────────────────

test("rommel in plaats van een snapshot levert geen antwoorden op", () => {
  for (const rommel of [null, undefined, "tekst", 42, [], {}, { antwoorden: null }]) {
    assert.equal(leesAntwoorden(rommel), null, `${JSON.stringify(rommel)} hoort geweigerd te worden`);
  }
});

test("een onbekende contractsoort wordt niet overgenomen", () => {
  assert.equal(leesAntwoorden(snapshot({ ...GOED, contract: "gratis" })), null);
});

test("verbruik wordt begrensd, zodat één verzonnen getal geen fantasiebesparing oplevert", () => {
  const absurd = leesAntwoorden(snapshot({ ...GOED, verbruik: { soort: "kwh", kwh: 9_999_999 } }));
  assert.equal(absurd, null, "boven de grens weigeren we het hele antwoordblok");

  const netAan = leesAntwoorden(snapshot({ ...GOED, verbruik: { soort: "kwh", kwh: 99_000 } }));
  assert.ok(netAan, "onder de grens mag het wél door");
});

test("het aantal panelen wordt begrensd", () => {
  assert.equal(leesAntwoorden(snapshot({ ...GOED, panelen: { soort: "aantal", aantal: 5000 } })), null);
});

test("alleen de twee tarieven uit de schakelaar worden geaccepteerd", () => {
  // Wél: precies de waarden die de knop kan zetten.
  for (const t of [0.109, 0.182]) {
    const a = leesAntwoorden(snapshot({ ...GOED, terugleverkosten: t }));
    assert.equal(a?.terugleverkosten, t);
  }
  // Niet: een zelfbedacht tarief. Dat is de meest lucratieve knop om aan te
  // draaien — hoe hoger, hoe korter de terugverdientijd in de mail.
  for (const t of [0.5, 1, 99, -0.2, NaN]) {
    const a = leesAntwoorden(snapshot({ ...GOED, terugleverkosten: t }));
    assert.equal(a?.terugleverkosten, undefined, `${t} hoort genegeerd te worden`);
  }
});

// ── De vergelijking ─────────────────────────────────────────────────────────

test("een verzonnen besparing wordt betrapt en de eigen som wint", () => {
  const gelogen = snapshot(GOED, {
    uitkomst: {
      route: "lead",
      besparing_eur: { laag: 2000, midden: 2600, hoog: 3200 },
      terugverdientijd_jaar: { laag: 2, midden: 2.5, hoog: 3 },
      terugleverkosten_eur: 0,
      rekenversie: "1.1.0",
    },
  });

  const c = controleer(gelogen);
  assert.equal(c.komt_overeen, false);
  assert.match(c.opmerking ?? "", /2600/);
  assert.ok(c.uitkomst, "er moet wel een eigen uitkomst zijn");
  assert.ok(
    c.uitkomst!.route !== "huurder" && c.uitkomst!.route !== "geen_pv" && c.uitkomst!.besparing_eur.midden < 1000,
    "de hercontrole hoort het nuchtere bedrag te geven, niet het gemelde"
  );
});

test("een eerlijke melding komt overeen", () => {
  const eerlijk = controleer(snapshot(GOED));
  const u = eerlijk.uitkomst!;
  assert.equal(u.route, "lead");

  const gemeld = snapshot(GOED, { uitkomst: u });
  assert.equal(controleer(gemeld).komt_overeen, true);
});

test("een afwijkende route valt op, ook als het bedrag toevallig klopt", () => {
  const c = controleer(
    snapshot(GOED, {
      uitkomst: {
        route: "niet_rendabel",
        besparing_eur: { laag: 0, midden: 383, hoog: 0 },
        terugverdientijd_jaar: { laag: 0, midden: 10.4, hoog: 0 },
        terugleverkosten_eur: 0,
        rekenversie: "1.1.0",
      },
    })
  );
  assert.equal(c.komt_overeen, false);
  assert.match(c.opmerking ?? "", /oute/);
});

test("zonder gemelde uitkomst is er niets om mee te vergelijken", () => {
  const c = controleer(snapshot(GOED));
  assert.equal(c.komt_overeen, null);
  assert.ok(c.uitkomst, "we rekenen wél zelf door");
});

test("een huurder levert een route op maar geen bedragen", () => {
  const c = controleer(snapshot({ ...GOED, eigenaar: false }));
  assert.equal(c.uitkomst?.route, "huurder");
});
