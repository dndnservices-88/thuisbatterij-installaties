import { test } from "node:test";
import assert from "node:assert/strict";
import { CONSENT } from "./site";

test("toestemming v1.5: gelaagd, WhatsApp in de eerste laag (prikbord r. 62/67, 17 nov 2026)", () => {
  assert.equal(CONSENT.versie, "1.5");
  assert.match(CONSENT.eersteLaag, /mag mij bellen, mailen en WhatsAppen over mijn berekening/);
  assert.match(CONSENT.eersteLaag, /Intrekken kan altijd\.$/);
  // Opgeslagen tekst = eerste laag + uitklapper (juridische chat stap 1 §5).
  assert.ok(CONSENT.tekst.startsWith(CONSENT.eersteLaag));
  assert.ok(CONSENT.tekst.endsWith(CONSENT.uitklapper));
  assert.match(CONSENT.tekst, /intrekken/);
});
