import test from "node:test";
import assert from "node:assert/strict";
import {
  controleerMelding,
  conversieregel,
  sheetTijd,
  alsSheetrij,
  isUitkomst,
  SHEETKOPPEN,
  WAARDEN,
  CONVERSIENAAM,
  UITKOMSTVERSIE,
} from "./uitkomst.ts";

/**
 * Deze test bestaat omdat de terugkoppelingsloop op twee manieren stil faalt.
 *
 * De eerste is het tijdstempel. Google weigert een offset met een dubbele punt,
 * maar de fout die je terugkrijgt gaat niet over de dubbele punt — hij gaat over
 * een kopregel of over een datum in de toekomst. Je kunt er een halve dag aan
 * kwijt zijn voordat je ziet waar het echt op vastloopt.
 *
 * De tweede is het lege klik-ID. Een regel met een leeg Google Click ID wordt
 * geslikt en nooit toegewezen. Je import meldt netjes nul fouten en je
 * conversies komen nergens aan.
 *
 * Draaien met: npm test
 */

// ─── Tijdstempel: het formaat waar ORJN een ochtend aan kwijt was ────────────

test("sheetTijd geeft geen dubbele punt in een offset, want die weigert Google", () => {
  const t = sheetTijd("2026-08-25T10:00:00Z");
  assert.equal(t.includes("+"), false, "er hoort helemaal geen offset in te staan");
  assert.match(t, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
});

test("sheetTijd rekent om naar Amsterdamse tijd, zomertijd", () => {
  // 25 augustus valt in de zomertijd: UTC+2.
  assert.equal(sheetTijd("2026-08-25T10:00:00Z"), "2026-08-25 12:00:00");
});

test("sheetTijd rekent om naar Amsterdamse tijd, wintertijd", () => {
  // 25 januari valt in de wintertijd: UTC+1. Een handgeschreven offset van +0200
  // zou hier een uur mis zitten en dat zie je nergens aan terug.
  assert.equal(sheetTijd("2026-01-25T10:00:00Z"), "2026-01-25 11:00:00");
});

test("sheetTijd geeft middernacht als 00 en niet als 24", () => {
  // 22:00 UTC in de zomer is middernacht in Amsterdam, de dag erna.
  assert.equal(sheetTijd("2026-08-25T22:00:00Z"), "2026-08-26 00:00:00");
});

test("sheetTijd weigert een onzindatum in plaats van 'Invalid Date' door te geven", () => {
  assert.throws(() => sheetTijd("geen datum"));
});

// ─── Validatie ───────────────────────────────────────────────────────────────

test("uitkomst zonder lead_id wordt geweigerd", () => {
  const r = controleerMelding({ uitkomst: "sale" });
  assert.equal(r.ok, false);
});

test("onbekende uitkomst wordt geweigerd, niet stil omgezet", () => {
  const r = controleerMelding({ lead_id: "abc", uitkomst: "gewonnen" });
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.fout, /uitkomst moet/);
});

test("isUitkomst herkent alleen de vastgelegde waarden", () => {
  assert.equal(isUitkomst("sale"), true);
  assert.equal(isUitkomst("Sale"), false);
  assert.equal(isUitkomst(""), false);
  assert.equal(isUitkomst(undefined), false);
});

test("zonder tijdstip is het tijdstip nu, en de versie gaat mee", () => {
  const nu = new Date("2026-08-26T09:00:00Z");
  const r = controleerMelding({ lead_id: "abc", uitkomst: "score_a" }, nu);
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.melding.tijdstip, nu.toISOString());
    assert.equal(r.melding.versie, UITKOMSTVERSIE);
  }
});

test("een tijdstip in de toekomst wordt geweigerd", () => {
  // Google valideert in fases: eerst formaat, dan 'te ver in de toekomst', pas
  // daarna het klik-ID. Hier tegenhouden scheelt een import die faalt op een
  // regel waar verder niets mis mee is.
  const nu = new Date("2026-08-26T09:00:00Z");
  const r = controleerMelding(
    { lead_id: "abc", uitkomst: "sale", tijdstip: "2026-08-27T09:00:00Z" },
    nu
  );
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.fout, /toekomst/);
});

test("een tijdstip in het verleden blijft staan zoals aangeleverd", () => {
  const nu = new Date("2026-08-26T09:00:00Z");
  const r = controleerMelding(
    { lead_id: "abc", uitkomst: "sale", tijdstip: "2026-08-20T14:30:00Z" },
    nu
  );
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.melding.tijdstip, "2026-08-20T14:30:00.000Z");
});

test("een negatieve orderwaarde wordt geweigerd", () => {
  const r = controleerMelding({ lead_id: "abc", uitkomst: "sale", orderwaarde: -1 });
  assert.equal(r.ok, false);
});

test("toelichting blijft binnen en gaat nooit de conversieregel in", () => {
  const r = controleerMelding({
    lead_id: "abc",
    uitkomst: "geen_sale",
    toelichting: "klant koos voor een concurrent",
  });
  assert.equal(r.ok, true);
  if (r.ok) {
    const c = conversieregel(r.melding.uitkomst, r.melding.tijdstip, { gclid: "Cj0KAQ" });
    assert.equal(c.regel, null);
  }
});

// ─── De conversieregel ───────────────────────────────────────────────────────

test("sale met gclid levert een volledige regel op", () => {
  const c = conversieregel("sale", "2026-08-25T10:00:00Z", { gclid: "Cj0KAQjw" });
  assert.notEqual(c.regel, null);
  if (c.regel) {
    assert.equal(c.regel.klik_id, "Cj0KAQjw");
    assert.equal(c.regel.conversienaam, CONVERSIENAAM.sale);
    assert.equal(c.regel.conversietijd, "2026-08-25 12:00:00");
    assert.equal(c.regel.waarde, WAARDEN.sale);
    assert.equal(c.regel.valuta, "EUR");
  }
});

test("zonder klik-ID komt er geen regel, met een reden erbij", () => {
  const c = conversieregel("sale", "2026-08-25T10:00:00Z", {});
  assert.equal(c.regel, null);
  if (c.regel === null) assert.match(c.reden, /geen klik-ID/);
});

test("een leeg gclid telt als geen gclid", () => {
  // Dit is het stille lek: een lege string is waarheidswaarde onwaar in een
  // if, maar "  " niet. Een regel met een spatie als klik-ID wordt geslikt en
  // nooit toegewezen.
  const c = conversieregel("sale", "2026-08-25T10:00:00Z", { gclid: "   " });
  assert.equal(c.regel, null);
});

test("gbraid zonder gclid gaat niet in de gclid-kolom", () => {
  const c = conversieregel("sale", "2026-08-25T10:00:00Z", { gbraid: "abc123" });
  assert.equal(c.regel, null);
  if (c.regel === null) assert.match(c.reden, /gbraid/);
});

test("uitkomsten zonder conversieactie leveren geen regel op", () => {
  // score_a wordt wél geregistreerd maar gaat bewust niet naar Google: bij
  // startvolume haalt geen enkele actie de dertig per maand als je het volume
  // over drie signalen verdeelt.
  for (const u of [
    "niet_bereikbaar",
    "score_a",
    "score_b",
    "score_c",
    "geen_sale",
    "afspraak_nagekomen",
  ] as const) {
    const c = conversieregel(u, "2026-08-25T10:00:00Z", { gclid: "Cj0KAQ" });
    assert.equal(c.regel, null, `${u} hoort geen conversieregel op te leveren`);
  }
});

test("precies twee uitkomsten hebben een conversieactie, en waarden lopen op", () => {
  const namen = Object.keys(CONVERSIENAAM).sort();
  assert.deepEqual(namen, ["afspraak_geboekt", "sale"]);
  assert.deepEqual(Object.keys(WAARDEN).sort(), namen);
  assert.ok(WAARDEN.afspraak_geboekt! < WAARDEN.sale!);
});

test("elke conversienaam hoort bij een geldige uitkomst en heeft een waarde", () => {
  // Vangt de fout waarbij je een actie toevoegt aan de ene tabel en de andere
  // vergeet: dan komt er een regel met waarde undefined of andersom een waarde
  // zonder naam, en de import weigert hem zonder bruikbare melding.
  for (const naam of Object.keys(CONVERSIENAAM)) {
    assert.equal(isUitkomst(naam), true, `${naam} is geen bekende uitkomst`);
    assert.equal(typeof WAARDEN[naam as keyof typeof WAARDEN], "number");
  }
});

test("geen enkele conversiewaarde is nul", () => {
  // Een conversie met waarde nul verstoort waardegebaseerd bieden: Google telt
  // hem mee als gebeurtenis maar leert er niets van.
  for (const [naam, waarde] of Object.entries(WAARDEN)) {
    assert.ok(waarde! > 0, `${naam} heeft waarde nul`);
  }
});

test("de sheetrij heeft evenveel kolommen als de template, in dezelfde volgorde", () => {
  const c = conversieregel("afspraak_geboekt", "2026-08-25T10:00:00Z", { gclid: "Cj0KAQ" });
  assert.notEqual(c.regel, null);
  if (c.regel) {
    const rij = alsSheetrij(c.regel);
    assert.equal(rij.length, SHEETKOPPEN.length);
    assert.deepEqual(SHEETKOPPEN.slice(), [
      "Google Click ID",
      "Conversion Name",
      "Conversion Time",
      "Conversion Value",
      "Conversion Currency",
    ]);
    assert.equal(rij[0], "Cj0KAQ");
    assert.equal(rij[4], "EUR");
  }
});

test("de hele keten: binnenkomende melding tot sheetrij", () => {
  const nu = new Date("2026-08-26T09:00:00Z");
  const r = controleerMelding(
    { lead_id: "lead-1", uitkomst: "sale", tijdstip: "2026-08-25T10:00:00Z", door: "D" },
    nu
  );
  assert.equal(r.ok, true);
  if (!r.ok) return;
  const c = conversieregel(r.melding.uitkomst, r.melding.tijdstip, { gclid: "Cj0KAQjw", utm_source: "google" });
  assert.notEqual(c.regel, null);
  if (c.regel) {
    assert.deepEqual(alsSheetrij(c.regel), [
      "Cj0KAQjw",
      "TBI Sale",
      "2026-08-25 12:00:00",
      "350",
      "EUR",
    ]);
  }
});
