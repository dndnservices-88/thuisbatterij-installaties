#!/usr/bin/env node
/**
 * Stuurt één testlead naar /api/lead.
 *
 * Waarvoor: als je in Make een scenario bouwt, wil je het webhookvenster op
 * "Determine data structure" kunnen zetten en er dan één keer een realistische
 * lead in duwen. Handmatig het formulier doorlopen kan ook, maar dan zit je bij
 * elke wijziging weer vijf schermen te klikken.
 *
 * Gebruik:
 *   node scripts/testlead.mjs                      → naar http://localhost:3000
 *   node scripts/testlead.mjs https://jouw.vercel.app
 *   node scripts/testlead.mjs <url> niet-rendabel  → de zachte-leadroute
 *   node scripts/testlead.mjs <url> huurder        → de diskwalificatieroute
 *
 * ⚠️ Draai dit NOOIT tegen een live site met echte tracking aan: er gaat een
 * Lead-gebeurtenis naar Meta mee en die vervuilt je optimalisatie.
 */

const url = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const variant = process.argv[3] || "lead";

const ANTWOORDEN = {
  // Case A uit de calculatorspecificatie: de persona uit het brandbook.
  lead: {
    zonnepanelen: "ja",
    panelen: { soort: "aantal", aantal: 14 },
    verbruik: { soort: "kwh", kwh: 4100 },
    contract: "vast",
    eigenaar: true,
  },
  // Case B: te klein huishouden, eindigt in het niet-rendabel-scherm.
  "niet-rendabel": {
    zonnepanelen: "ja",
    panelen: { soort: "aantal", aantal: 6 },
    verbruik: { soort: "kwh", kwh: 1800 },
    contract: "vast",
    eigenaar: true,
  },
  huurder: {
    zonnepanelen: "ja",
    panelen: { soort: "aantal", aantal: 14 },
    verbruik: { soort: "kwh", kwh: 4100 },
    contract: "vast",
    eigenaar: false,
  },
};

const antwoorden = ANTWOORDEN[variant];
if (!antwoorden) {
  console.error(`Onbekende variant "${variant}". Kies uit: ${Object.keys(ANTWOORDEN).join(", ")}`);
  process.exit(1);
}

const stempel = new Date().toISOString().slice(11, 19).replace(/:/g, "");

const body = {
  voornaam: "Test",
  achternaam: `Lead ${stempel}`,
  telefoon: "0612345678",
  // Vang testmails op zonder een echt postvak te vervuilen. Vervang dit door je
  // eigen adres als je de bevestigingsmail écht wilt zien binnenkomen.
  email: process.env.TESTLEAD_EMAIL || "testlead@example.com",
  postcode: "1689 ZX",
  huisnummer: "62",
  toevoeging: "A",
  dagdeel: "ochtend",

  // De server negeert deze twee en vult ze uit lib/site.ts. Ze staan hier om te
  // kunnen controleren dát hij ze negeert: verander ze maar eens en kijk wat er
  // in het logboek belandt.
  consent_tekst: "DEZE TEKST HOORT GENEGEERD TE WORDEN",
  consent_versie: "999",

  event_id: `test-${Date.now()}`,
  attributie: {
    utm_source: "testscript",
    utm_medium: "cli",
    utm_campaign: "webhook-opzetten",
    gclid: "TEST-GCLID-0000",
  },
  calc_snapshot: {
    antwoorden,
    // Bewust leeg: de server rekent zelf opnieuw door. Vul hier een verzonnen
    // besparing in en je ziet komt_overeen op false springen.
    uitkomst: null,
    zachte_lead: variant === "niet-rendabel",
  },
  pagina_url: `${url}/?utm_source=testscript`,
};

console.log(`→ POST ${url}/api/lead   (variant: ${variant})`);

const res = await fetch(`${url}/api/lead`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

const tekst = await res.text();
console.log(`← ${res.status} ${res.statusText}`);
try {
  console.dir(JSON.parse(tekst), { depth: null });
} catch {
  console.log(tekst);
}

if (!res.ok) process.exit(1);
