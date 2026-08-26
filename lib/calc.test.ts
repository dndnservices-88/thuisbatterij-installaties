import test from "node:test";
import assert from "node:assert/strict";
import {
  bereken,
  CONSTANTEN,
  doorzet,
  ASSORTIMENT,
  tariefVoorAntwoord,
  TERUGLEVERKOSTEN_OPTIES,
  waardePerKwh,
} from "./calc.ts";
import type { Antwoorden } from "./calc.ts";

/**
 * De drie testcases uit Limsolar_Specificatie_Calculator_16aug2026.md, sectie 8.
 * Draaien met: npm test
 *
 * ────────────────────────────────────────────────────────────────────────────
 * BIJGESTELD OP 24 AUGUSTUS 2026, rekenversie 1.1.0.
 *
 * De specificatie mikte voor case A op "rond de 8 jaar". Dat getal berustte op
 * tariefaannames die de markt van augustus 2026 niet draagt: het rustte op een
 * leveringstarief van € 0,28 en een terugleververgoeding van € 0,05, en beide
 * staan er nu ongunstiger voor. Met eerlijk opgezochte tarieven komt case A op
 * ongeveer 10,4 jaar.
 *
 * De verleiding is dan om de constanten terug te draaien tot de test weer groen
 * is. Dat is precies verkeerd om: dan test je of de rekensom het gewenste
 * antwoord geeft in plaats van het juiste. De test is bijgesteld, de tarieven
 * niet — en de norm die overeind blijft is de norm die er werkelijk toe doet:
 * ruim onder de grens van 12 jaar, en niet de 13,0 jaar van de geleverde site.
 * ────────────────────────────────────────────────────────────────────────────
 */

const basis: Antwoorden = {
  zonnepanelen: "ja",
  panelen: { soort: "aantal", aantal: 14 },
  verbruik: { soort: "kwh", kwh: 4100 },
  contract: "vast",
  eigenaar: true,
};

test("case A — de persona uit het brandbook blijft een lead en komt niet op 13 jaar", () => {
  const u = bereken(basis);
  assert.equal(u.route, "lead");
  if (u.route !== "lead") return;
  // De geleverde site kwam op 13,0 jaar door met een generieke systeemprijs te
  // rekenen in plaats van met het eigen aanbod. Dat is de kerncorrectie, en die
  // moet blijven werken ook nu de tarieven ongunstiger zijn geworden.
  assert.ok(u.terugverdientijd_jaar.midden > 9, `middenwaarde ${u.terugverdientijd_jaar.midden}`);
  assert.ok(
    u.terugverdientijd_jaar.midden < CONSTANTEN.GRENS_NIET_RENDABEL,
    `middenwaarde ${u.terugverdientijd_jaar.midden} moet onder de grens blijven`
  );
  assert.equal(u.product.id, "instap-10-kwh");
});

test("case A blijft een lead met een marge van minstens een jaar tot de grens", () => {
  // Aparte test, omdat dit de gevoeligste plek in de hele rekenkern is: een
  // kwart cent op het leveringstarief schuift case A over de grens van 12 jaar
  // en dan verdwijnt de belangrijkste persona uit het brandbook in het
  // niet-rendabel-scherm. Zakt deze test, dan is dat geen testprobleem maar een
  // signaal dat het aanbod of de prijs opnieuw langs Limsolar moet.
  const u = bereken(basis);
  if (u.route !== "lead") return assert.fail("case A is geen lead meer");
  assert.ok(
    CONSTANTEN.GRENS_NIET_RENDABEL - u.terugverdientijd_jaar.midden >= 1,
    `nog maar ${CONSTANTEN.GRENS_NIET_RENDABEL - u.terugverdientijd_jaar.midden} jaar marge`
  );
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
  // En de standaard blijft nul als de bezoeker niets aanraakt.
  const u = bereken(basis);
  if (u.route === "huurder" || u.route === "geen_pv") return assert.fail("verkeerde route");
  assert.equal(u.terugleverkosten_eur, 0);
});

test("'weet ik niet' rekent nooit gunstiger dan nul", () => {
  // De kern van vraag 5. Wie niet weet of hij terugleverkosten betaalt, mag
  // geen cent voordeel krijgen van die onwetendheid: dan zouden wij een tarief
  // invullen dat de bezoeker nooit heeft opgegeven, en dat is precies de
  // aanname die hier niet gemaakt mag worden. Verdwijnt deze test, dan kan
  // iemand "weet ik niet" ooit op een gemiddeld markttarief zetten omdat dat
  // "realistischer" oogt — en dan verkoopt de calculator een belofte.
  const onbekend = bereken({
    ...basis,
    terugleverkosten: tariefVoorAntwoord("weet_niet"),
    terugleverkosten_antwoord: "weet_niet",
  });
  const niets = bereken({
    ...basis,
    terugleverkosten: tariefVoorAntwoord("geen"),
    terugleverkosten_antwoord: "geen",
  });
  if (onbekend.route === "huurder" || onbekend.route === "geen_pv") return assert.fail("route");
  if (niets.route === "huurder" || niets.route === "geen_pv") return assert.fail("route");
  assert.equal(onbekend.terugleverkosten_eur, 0);
  assert.equal(onbekend.besparing_eur.midden, niets.besparing_eur.midden);
  assert.equal(onbekend.terugverdientijd_jaar.midden, niets.terugverdientijd_jaar.midden);
  // Maar het antwoord zelf blijft wél te onderscheiden — daar hangt de zin in
  // de adviseurmail aan.
  assert.equal(onbekend.terugleverkosten_antwoord, "weet_niet");
  assert.equal(niets.terugleverkosten_antwoord, "geen");
});

test("tariefVoorAntwoord geeft alleen bij een echt tarief een bedrag terug", () => {
  assert.equal(tariefVoorAntwoord(undefined), undefined);
  assert.equal(tariefVoorAntwoord("geen"), undefined);
  assert.equal(tariefVoorAntwoord("weet_niet"), undefined);
  assert.equal(tariefVoorAntwoord("laag"), 0.109);
  assert.equal(tariefVoorAntwoord("hoog"), 0.182);
});

test("de vier keuzes bij vraag 5 zijn uniek en kennen geen verzonnen bedragen", () => {
  const ids = TERUGLEVERKOSTEN_OPTIES.map((o) => o.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const o of TERUGLEVERKOSTEN_OPTIES) {
    assert.ok([0, 0.109, 0.182].includes(o.waarde), `${o.id} heeft een onbekend bedrag`);
  }
});

test("de schakelaar kan de som alleen gunstiger maken, nooit ongunstiger", () => {
  const zonder = bereken(basis);
  const met = bereken({ ...basis, terugleverkosten: 0.109 });
  if (zonder.route === "huurder" || zonder.route === "geen_pv") return assert.fail("route");
  if (met.route === "huurder" || met.route === "geen_pv") return assert.fail("route");
  assert.ok(met.besparing_eur.midden > zonder.besparing_eur.midden);
  assert.ok(met.terugverdientijd_jaar.midden < zonder.terugverdientijd_jaar.midden);
  assert.equal(met.terugleverkosten_eur, 0.109);
});

test("onzinnige terugleverkosten vallen terug op de conservatieve standaard", () => {
  // Niet omdat de knoppen zulke waarden kunnen sturen, maar omdat de waarde in
  // het antwoordobject staat en dat object ook uit een opgeslagen lead of een
  // gedeelde link terug kan komen. Een negatief bedrag mag de uitkomst nooit
  // slechter maken dan de standaard.
  const basisUitkomst = bereken(basis);
  for (const raar of [-0.5, Number.NaN, Number.POSITIVE_INFINITY]) {
    const u = bereken({ ...basis, terugleverkosten: raar });
    if (u.route === "huurder" || u.route === "geen_pv") return assert.fail("route");
    if (basisUitkomst.route === "huurder" || basisUitkomst.route === "geen_pv")
      return assert.fail("route");
    assert.equal(u.waarde_per_kwh, basisUitkomst.waarde_per_kwh, `bij invoer ${raar}`);
  }
});

test("de waarde per kWh is leveringstarief min terugleververgoeding plus terugleverkosten", () => {
  // Deze test bestaat om één reden: als iemand ooit de volgorde van de min en
  // de plus omdraait, blijft de calculator gewoon getallen produceren en valt
  // het niemand op. Dan verkoop je een half jaar lang een verkeerde belofte.
  assert.equal(
    waardePerKwh("vast"),
    CONSTANTEN.LEVERINGSTARIEF - CONSTANTEN.TERUGLEVERVERGOEDING + CONSTANTEN.TERUGLEVERKOSTEN
  );
  assert.equal(waardePerKwh("dynamisch"), waardePerKwh("vast") + CONSTANTEN.DYN_MARGE);
  assert.equal(waardePerKwh("onbekend"), waardePerKwh("vast"));
});

// ── Rekenversie 1.2.0: de monotonie-fout ────────────────────────────────────
// Tot 1.1.0 was het directe verbruik 35% van de OPWEK. Daardoor kromp de
// avondbehoefte bij elk extra paneel en werd de terugverdientijd langer naarmate
// iemand meer zon had. Een tweepersoonshuishouden met 16 panelen kwam op 26,8
// jaar en werd afgewezen, terwijl hetzelfde huishouden met 8 panelen op 12,1 jaar
// uitkwam en wél een lead werd. Die tests hieronder pinnen vast dat dit niet kan
// terugkeren — ze horen te breken vóór een bezoeker het merkt.

test("meer panelen maakt de terugverdientijd nooit langer", () => {
  let vorige = Infinity;
  for (const aantal of [6, 8, 10, 12, 14, 16, 18, 20, 24]) {
    const u = bereken({ ...basis, panelen: { soort: "aantal", aantal } });
    if (u.route === "huurder" || u.route === "geen_pv") return assert.fail("route");
    assert.ok(
      u.terugverdientijd_jaar.midden <= vorige + 0.05,
      `${aantal} panelen geeft ${u.terugverdientijd_jaar.midden} jaar, meer dan de ${vorige} bij minder panelen`
    );
    vorige = Math.min(vorige, u.terugverdientijd_jaar.midden);
  }
});

test("het directe verbruik is nooit groter dan het dagdeel van het jaarverbruik", () => {
  // De kern van de correctie in één regel: je kunt overdag niet meer zon
  // gebruiken dan je overdag stroom verbruikt, hoeveel panelen je ook legt.
  for (const aantal of [6, 12, 20, 30, 40]) {
    const u = bereken({ ...basis, panelen: { soort: "aantal", aantal } });
    if (u.route === "huurder" || u.route === "geen_pv") return assert.fail("route");
    assert.ok(
      u.direct_verbruik_kwh <= u.jaarverbruik_kwh * CONSTANTEN.DAGAANDEEL_VERBRUIK + 1,
      `${aantal} panelen: direct ${u.direct_verbruik_kwh} van jaarverbruik ${u.jaarverbruik_kwh}`
    );
    assert.ok(u.avondbehoefte_kwh > 0, `${aantal} panelen laat geen avondbehoefte over`);
  }
});

test("het profiel dat ten onrechte werd afgewezen, is nu een lead", () => {
  // 12 panelen, 2-3 personen, vast contract, geen terugleverkosten. Kwam in
  // 1.1.0 op 13,9–20,8 jaar en dus in het niet-rendabel-scherm. Dit is de
  // grootste groep huiseigenaren met zonnepanelen in Nederland.
  const u = bereken({
    zonnepanelen: "ja",
    panelen: { soort: "aantal", aantal: 12 },
    verbruik: { soort: "huishouden", grootte: "2-3" },
    contract: "vast",
    eigenaar: true,
  });
  assert.equal(u.route, "lead");
  if (u.route !== "lead") return;
  assert.ok(
    u.terugverdientijd_jaar.midden < CONSTANTEN.GRENS_NIET_RENDABEL,
    `middenwaarde ${u.terugverdientijd_jaar.midden}`
  );
});

test("restcycli leveren alleen iets op bij een dynamisch contract", () => {
  const vast = bereken({ ...basis, contract: "vast" });
  const onbekend = bereken({ ...basis, contract: "onbekend" });
  const dyn = bereken({ ...basis, contract: "dynamisch" });
  for (const u of [vast, onbekend]) {
    if (u.route === "huurder" || u.route === "geen_pv") return assert.fail("route");
    assert.equal(u.restcycli_kwh, 0);
    assert.equal(u.handelsopbrengst_eur, 0);
  }
  if (dyn.route === "huurder" || dyn.route === "geen_pv") return assert.fail("route");
  assert.ok(dyn.restcycli_kwh >= 0);
  assert.equal(
    dyn.handelsopbrengst_eur,
    Math.round(dyn.restcycli_kwh * CONSTANTEN.HANDELSMARGE_RESTCYCLI)
  );
});

test("de handelspost blijft klein genoeg om geen verkooppraatje te worden", () => {
  // Bewaking, geen berekening. Zou deze post ooit meer dan een kwart van de
  // besparing worden, dan verkopen we handel in plaats van zelfverbruik — en
  // handel is precies de post waar de ACM op let en die na 2027 kan wegvallen.
  for (const aantal of [8, 12, 16, 20]) {
    const u = bereken({ ...basis, contract: "dynamisch", panelen: { soort: "aantal", aantal } });
    if (u.route === "huurder" || u.route === "geen_pv") return assert.fail("route");
    const aandeel = u.handelsopbrengst_eur / u.besparing_eur.midden;
    assert.ok(aandeel < 0.25, `${aantal} panelen: handel is ${Math.round(aandeel * 100)}% van de besparing`);
  }
});

test("de contractkeuze reist mee in de snapshot", () => {
  // De adviseurmail leunt hierop: zonder contract in de uitkomst weet de
  // verkoper niet of het handelsbedrag in de som zat.
  for (const contract of ["vast", "dynamisch", "onbekend"] as const) {
    const u = bereken({ ...basis, contract });
    if (u.route === "huurder" || u.route === "geen_pv") return assert.fail("route");
    assert.equal(u.contract, contract);
  }
});
