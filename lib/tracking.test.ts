import test from "node:test";
import assert from "node:assert/strict";
import {
  ontleedConsent,
  schrijfConsent,
  consentSignalen,
  nieuweToestemming,
  CONSENT_VERSIE,
  type Toestemming,
} from "./tracking.ts";

/**
 * Deze test bestaat om één reden: de toestemmingslaag faalt stil.
 *
 * Een fout in de cookiemigratie levert geen foutmelding op en geen kapot scherm.
 * Hij levert een bezoeker op die ooit heeft geweigerd en van wie nu toch gemeten
 * wordt, of andersom — en dat merk je pas als iemand ernaar vraagt. Precies de
 * les uit fase 7 met de mails, nu toegepast vóór het misgaat.
 *
 * Draaien met: npm test
 */

// ─── Oude cookies blijven werken ─────────────────────────────────────────────

test("oude cookie 'alles' vertaalt naar beide categorieën aan", () => {
  const t = ontleedConsent("alles");
  assert.ok(t);
  assert.equal(t.statistieken, true);
  assert.equal(t.marketing, true);
  assert.equal(t.versie, 1, "moet herkenbaar blijven als oud formaat, anders wordt hij nooit overgezet");
});

test("oude cookie 'alleen_noodzakelijk' vertaalt naar beide categorieën uit", () => {
  const t = ontleedConsent("alleen_noodzakelijk");
  assert.ok(t);
  assert.equal(t.statistieken, false);
  assert.equal(t.marketing, false);
  assert.equal(t.versie, 1);
});

// ─── Geen keuze is geen toestemming ──────────────────────────────────────────

test("ontbrekende, lege en onleesbare cookies geven null en dus opnieuw vragen", () => {
  assert.equal(ontleedConsent(null), null);
  assert.equal(ontleedConsent(undefined), null);
  assert.equal(ontleedConsent(""), null);
  assert.equal(ontleedConsent("{kapot"), null);
  assert.equal(ontleedConsent("null"), null);
  assert.equal(ontleedConsent("[]"), null);
});

test("een cookie met een ontbrekende categorie telt niet half mee", () => {
  // Anders zou een half geschreven cookie stilzwijgend als 'uit' gelden voor de
  // ene helft en als geldige keuze voor de andere. Dan vraag je het niet meer.
  assert.equal(ontleedConsent(JSON.stringify({ statistieken: true })), null);
  assert.equal(ontleedConsent(JSON.stringify({ marketing: true })), null);
  assert.equal(ontleedConsent(JSON.stringify({ statistieken: "ja", marketing: "nee" })), null);
});

// ─── Heen en terug ───────────────────────────────────────────────────────────

test("schrijven en teruglezen levert dezelfde keuze op", () => {
  for (const statistieken of [true, false]) {
    for (const marketing of [true, false]) {
      const origineel = nieuweToestemming({ statistieken, marketing });
      const terug = ontleedConsent(schrijfConsent(origineel));
      assert.ok(terug);
      assert.equal(terug.statistieken, statistieken);
      assert.equal(terug.marketing, marketing);
      assert.equal(terug.versie, CONSENT_VERSIE);
      assert.equal(terug.tijdstip, origineel.tijdstip);
    }
  }
});

test("een verse keuze krijgt het huidige formaat en een tijdstip", () => {
  const t = nieuweToestemming({ statistieken: true, marketing: false });
  assert.equal(t.versie, CONSENT_VERSIE);
  assert.ok(t.tijdstip.length > 0, "zonder tijdstip is niet aantoonbaar wanneer er is gekozen");
  assert.ok(!Number.isNaN(Date.parse(t.tijdstip)));
});

// ─── Vertaling naar Consent Mode v2 ──────────────────────────────────────────

const maak = (statistieken: boolean, marketing: boolean): Toestemming =>
  nieuweToestemming({ statistieken, marketing });

test("marketing stuurt de drie advertentiesignalen, statistieken alleen analytics", () => {
  const s = consentSignalen(maak(true, false));
  assert.equal(s.analytics_storage, "granted");
  assert.equal(s.ad_storage, "denied");
  assert.equal(s.ad_user_data, "denied");
  assert.equal(s.ad_personalization, "denied");

  const m = consentSignalen(maak(false, true));
  assert.equal(m.analytics_storage, "denied");
  assert.equal(m.ad_storage, "granted");
  assert.equal(m.ad_user_data, "granted");
  assert.equal(m.ad_personalization, "granted");
});

test("er worden altijd zes signalen gezet, niet vier", () => {
  // Wat je niet declareert, vult Google zelf in. Dat is precies het soort
  // stilzwijgende aanname waar deze hele laag omheen gebouwd is.
  const s = consentSignalen(maak(false, false));
  assert.deepEqual(Object.keys(s).sort(), [
    "ad_personalization",
    "ad_storage",
    "ad_user_data",
    "analytics_storage",
    "functionality_storage",
    "security_storage",
  ]);
});

test("weigeren zet alle vier de keuzesignalen op denied", () => {
  const s = consentSignalen(maak(false, false));
  assert.equal(s.ad_storage, "denied");
  assert.equal(s.ad_user_data, "denied");
  assert.equal(s.ad_personalization, "denied");
  assert.equal(s.analytics_storage, "denied");
});

test("noodzakelijke opslag blijft staan, ook bij volledige weigering", () => {
  const s = consentSignalen(maak(false, false));
  assert.equal(s.functionality_storage, "granted");
  assert.equal(s.security_storage, "granted");
});

test("een oude 'alles'-cookie geeft na vertaling volledige toestemming", () => {
  // De hele keten in één keer: oude waarde, vertaling, signalen.
  const t = ontleedConsent("alles");
  assert.ok(t);
  const s = consentSignalen(t);
  assert.equal(s.ad_storage, "granted");
  assert.equal(s.analytics_storage, "granted");
});
