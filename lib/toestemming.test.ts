import test from "node:test";
import assert from "node:assert/strict";
import { toestemmingUitCookieHeader } from "./toestemming.ts";
import { magNaarMeta } from "./opslag.ts";

/**
 * De server leest sinds 6 oktober 2026 zelf de cookiekeuze. Faalt dat stil,
 * dan gaat er data naar Meta van iemand die marketing weigerde — of juist
 * niets van iemand die toestemde. Beide zie je nergens aan terug.
 */

const enc = (o: unknown) => encodeURIComponent(JSON.stringify(o));

test("cookie met marketing=ja wordt server-side herkend", () => {
  const h = `foo=1; tbi_consent=${enc({ statistieken: true, marketing: true, versie: 2, tijdstip: "" })}; bar=2`;
  assert.deepEqual(toestemmingUitCookieHeader(h), { statistieken: true, marketing: true, bron: "cookie" });
});

test("cookie met marketing=nee blijft nee", () => {
  const h = `tbi_consent=${enc({ statistieken: true, marketing: false, versie: 2, tijdstip: "" })}`;
  assert.equal(toestemmingUitCookieHeader(h).marketing, false);
});

test("oude cookiewaarde 'alles' telt als ja, 'alleen_noodzakelijk' als nee", () => {
  assert.equal(toestemmingUitCookieHeader("tbi_consent=alles").marketing, true);
  assert.equal(toestemmingUitCookieHeader("tbi_consent=alleen_noodzakelijk").marketing, false);
});

test("geen cookie, lege header of onzin telt als geen toestemming", () => {
  for (const h of [null, undefined, "", "andere=1", "tbi_consent=%E0%A4%A", "tbi_consent={kapot"]) {
    const t = toestemmingUitCookieHeader(h);
    assert.equal(t.marketing, false, String(h));
    assert.equal(t.bron, "geen_keuze", String(h));
  }
});

test("een cookie die alleen op tbi_consent eindigt telt niet", () => {
  // x_tbi_consent is een andere cookie; die mag niet als toestemming gelden.
  assert.equal(toestemmingUitCookieHeader("x_tbi_consent=alles").marketing, false);
});

test("Meta krijgt alleen iets bij marketing=ja", () => {
  assert.equal(magNaarMeta({ cookie_toestemming: { statistieken: true, marketing: true, bron: "cookie" } }), true);
  assert.equal(magNaarMeta({ cookie_toestemming: { statistieken: true, marketing: false, bron: "cookie" } }), false);
  assert.equal(magNaarMeta({ cookie_toestemming: { statistieken: false, marketing: false, bron: "geen_keuze" } }), false);
});
