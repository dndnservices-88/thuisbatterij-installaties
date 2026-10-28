import { test } from "node:test";
import assert from "node:assert/strict";
import { CONSENT } from "./site";

test("toestemming v1.4 noemt WhatsApp als kanaal (prikbord r. 27, 28 okt 2026)", () => {
  assert.equal(CONSENT.versie, "1.4");
  assert.match(CONSENT.tekst, /telefonisch, per e-mail en via WhatsApp benaderen/);
  assert.match(CONSENT.tekst, /intrekken/);
});
