import { centen, euro, getal, jaren, type Uitkomst } from "./calc";
import { CLAIMS, mag } from "./claims";
import { CONTACT, ENTITEIT, ENTITEIT_VOLUIT, LIMSOLAR, REKEN_DISCLAIMER, DOMEIN } from "./site";
import type { Lead } from "./opslag";
import { zsmMoment } from "./beltijden";
import type { Leadcontrole } from "./leadcontrole";

/**
 * De teksten van de twee mails.
 *
 * Losgetrokken van de verzending (lib/mail.ts), zodat je ze kunt lezen en
 * testen zonder een API-sleutel en zonder iets te versturen.
 *
 * ── Waarom de bevestigingsmail strenger is dan de pagina ────────────────────
 *
 * Op de site kan een bezoeker doorklikken, terugscrollen en de disclaimer
 * teruglezen. Een mail leeft langer, wordt doorgestuurd, en komt maanden later
 * terug als bijlage bij een klacht. Wat hier in staat, staat op briefpapier.
 *
 * Daarom drie harde regels:
 *  1. De getallen komen uit de server-side hercontrole, niet uit de browser.
 *  2. Elke claim loopt langs mag(); wat niet bewezen is, staat er niet in.
 *  3. De mail gaat niet de deur uit zonder afzender en zonder contactpunt.
 *     Een toestemming die je niet kunt intrekken is geen toestemming, en een
 *     mail zonder afzender is geen mail maar een probleem.
 */

const DAGDEELTEKST: Record<Lead["dagdeel"], string> = {
  zsm: "zo snel mogelijk",
  ochtend: "in de ochtend, tussen 09:00 en 12:00",
  middag: "in de middag, tussen 12:00 en 18:00",
  avond: "in de avond, tot 21:00",
};

/** Simpele ontsnapping voor de HTML-variant. Alles wat de klant zelf intypte gaat hier langs. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * De regel die zegt wie wat doet. Ontbreekt de entiteit nog, dan noemen we
 * alleen Limsolar in plaats van een letterlijke "[ENTITEIT]" naar een klant te
 * sturen. Dat is geen oplossing maar een noodrem; de echte oplossing is de
 * entiteitskeuze afmaken.
 */
function attributieregel(): string {
  if (!ENTITEIT.ingevuld) {
    return `Installatie en uitvoering door ${LIMSOLAR.naam}, KvK ${LIMSOLAR.kvk}, ${LIMSOLAR.adres}, ${LIMSOLAR.postcode} ${LIMSOLAR.plaats}.`;
  }
  return `Advies en offerte namens ${LIMSOLAR.naam} door ${ENTITEIT_VOLUIT}. Installatie, levering, garantie en service door ${LIMSOLAR.naam}, KvK ${LIMSOLAR.kvk}, ${LIMSOLAR.adres}, ${LIMSOLAR.postcode} ${LIMSOLAR.plaats}.`;
}

/** De peildatumzin, maar alleen als claimregister R2 is afgetekend. */
function peildatumzin(): string {
  return mag("R2") ? " " + CLAIMS.R2.tekst : "";
}

/**
 * Mag de bevestigingsmail überhaupt verstuurd worden?
 *
 * Nee zolang er geen contactpunt is waar de klant zijn toestemming kan
 * intrekken. Dit is dezelfde constructie als de claimpoort: liever een
 * zichtbare weigering in het logboek dan een mail die niet klopt.
 */
export function magBevestigingVersturen(): { mag: boolean; reden?: string } {
  if (!CONTACT.ingevuld) {
    const waarom = CONTACT.telefoon_fictief
      ? "CONTACT.telefoon in lib/site.ts is een plaatshouder (het echte nummer is er nog niet). Een verzonnen nummer in een klantmail is erger dan geen mail."
      : "CONTACT in lib/site.ts is nog niet compleet.";
    return {
      mag: false,
      reden: `${waarom} Zonder werkend contactpunt om de toestemming in te trekken gaat er geen bevestiging naar een klant.`,
    };
  }
  if (!process.env.MAIL_VAN) {
    return { mag: false, reden: "MAIL_VAN ontbreekt; geen geverifieerd afzenderadres." };
  }
  return { mag: true };
}

/** De uitkomstregels, in gewone zinnen. Leeg als er niets te melden valt. */
function uitkomstregels(u: Uitkomst | null): string[] {
  if (!u || u.route === "huurder" || u.route === "geen_pv") return [];
  return [
    `Extra zelfverbruik: ${getal(u.extra_zelfverbruik_kwh.min)} tot ${getal(u.extra_zelfverbruik_kwh.max)} kWh per jaar`,
    `Indicatieve besparing: ${euro(u.besparing_eur.min)} tot ${euro(u.besparing_eur.max)} per jaar`,
    `Passende capaciteit: ${new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 2 }).format(u.product.capaciteit_kwh)} kWh`,
    `Indicatieve terugverdientijd: ${jaren(u.terugverdientijd_jaar.min)} tot ${jaren(u.terugverdientijd_jaar.max)} jaar`,
  ];
}

// ── Mail 1: bevestiging aan de klant ────────────────────────────────────────

export function bevestigingAanKlant(lead: Lead, controle: Leadcontrole) {
  const u = controle.uitkomst;
  const regels = uitkomstregels(u);
  const krap = u && u.route === "niet_rendabel";
  const tlk =
    u && u.route !== "huurder" && u.route !== "geen_pv" && u.terugleverkosten_eur > 0
      ? u.terugleverkosten_eur
      : 0;

  // Belmoment: bij "zsm" hangt de belofte af van het tijdstip van de aanvraag
  // (buiten belttijden: de eerstvolgende werkdag), zie lib/beltijden.ts.
  const moment = lead.dagdeel === "zsm" ? zsmMoment(new Date(lead.consent_tijdstip)) : DAGDEELTEKST[lead.dagdeel];
  const onderwerp =
    lead.dagdeel === "zsm"
      ? `Je berekening — we bellen je ${moment.split(":")[0]}`
      : `Je berekening en je belafspraak — ${DAGDEELTEKST[lead.dagdeel].split(",")[0]}`;

  const alinea: string[] = [];
  alinea.push(`Hallo ${lead.voornaam},`);
  alinea.push(
    `Je hebt op ${DOMEIN} een berekening gemaakt voor een thuisbatterij. Hieronder staat wat eruit kwam, zodat je het kunt teruglezen voordat we bellen.`
  );

  if (regels.length === 0) {
    alinea.push(
      "Uit je antwoorden kwam geen doorrekening — dat gebeurt bijvoorbeeld als je huurt of nog geen zonnepanelen hebt. We bellen je om te horen wat er wél mogelijk is."
    );
  } else if (krap) {
    alinea.push(
      "Met de gegevens die je invulde bleef er geen zonnestroom over om op te slaan. Je hebt aangegeven dat je toch even wilt overleggen, en dat doen we graag: in het gesprek kijken we samen of er iets in je situatie verandert, bijvoorbeeld meer panelen of een hoger verbruik."
    );
  }

  const consentAlinea = `Je hebt aangevinkt: "${lead.consent_tekst}" Dat was op ${new Date(
    lead.consent_tijdstip
  ).toLocaleString("nl-NL", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Amsterdam" })}. Wil je die toestemming intrekken, dan is één mail naar ${CONTACT.email} genoeg. Dat mag op elk moment en je hoeft er niets bij uit te leggen.`;

  const belAlinea = `Wij bellen je ${moment}. Het gesprek duurt ongeveer tien minuten. Komt het dan toch niet uit? Laat het weten via ${CONTACT.email} of ${CONTACT.telefoon}, dan verzetten we het.`;

  // centen() en niet euro(): het gaat hier om een tarief van tienden van centen.
  //
  // Drie mogelijke slotzinnen, want nul euro betekent twee verschillende dingen.
  // Wie zei dat hij niets betaalt, hoeft niets te doen. Wie het niet wist, kijkt
  // naar een uitkomst die nog kan meevallen — en dat hoort hij te weten vóór het
  // telefoongesprek, niet erna. Dat is geen verkooppraatje maar de enige
  // openstaande onbekende in zijn eigen som.
  const tlkZin =
    tlk > 0
      ? ` Je hebt zelf aangegeven dat je ${centen(tlk)} per teruggeleverde kWh aan terugleverkosten betaalt; daar is bovenstaande mee doorgerekend. Wij controleren dat aan de telefoon.`
      : u && u.route !== "huurder" && u.route !== "geen_pv" && u.terugleverkosten_antwoord === "weet_niet"
        ? " Je wist niet of je terugleverkosten betaalt, dus hebben we met nul gerekend — de voorzichtige kant. Zoek het voor het gesprek even op je jaarafrekening op: betaal je ze wel, dan valt bovenstaande gunstiger uit."
        : "";

  const disclaimerAlinea = `${REKEN_DISCLAIMER}${peildatumzin()}${tlkZin}`;

  const tekst = [
    ...alinea,
    ...(regels.length ? ["Jouw indicatie:", ...regels.map((r) => `- ${r}`)] : []),
    belAlinea,
    disclaimerAlinea,
    consentAlinea,
    attributieregel(),
  ].join("\n\n");

  const html = klantmailHtml({
    voornaam: lead.voornaam,
    u: regels.length ? (u as Exclude<Uitkomst, { route: "huurder" | "geen_pv" }>) : null,
    alineaZonderUitkomst: regels.length === 0 || krap ? alinea.slice(2) : [],
    dagdeel: moment,
    disclaimer: disclaimerAlinea,
    consent: consentAlinea,
    attributie: attributieregel(),
  });

  return { onderwerp, tekst, html };
}


// ── Opmaak van de klantmail ─────────────────────────────────────────────────
//
// Sinds 25 okt 2026 (verzoek Dieudonné: "beetje karig"): kopbalk met logo,
// besparing groot, drie blokken, "wat er nu gebeurt", gele belknop, en
// onderaan klein de verplichte tekst. De TEKST van disclaimer, toestemming en
// attributie is ongewijzigd en komt uit dezelfde variabelen als de platte
// tekstversie. Opgebouwd met tabellen en inline stijl voor Gmail, Outlook en
// Apple Mail. Logo's als PNG op de eigen site (webp toont Outlook niet).

/** Toestemming Limsolar voor hun logo in de bevestigingsmail (Dieudonné, 25 okt 2026). Op false = alleen tekst. */
export const LIMSOLAR_LOGO_IN_MAIL = true;

const MAIL_KLEUR = { paars: "#370060", tint: "#F4EFF8", geel: "#F5F415", rand: "#E3DCEB" };
const beeld = (pad: string) => `https://${DOMEIN}/beeld/mail/${pad}`;

function blok(label: string, waarde: string): string {
  return `<td width="33%" valign="top" style="padding:4px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${MAIL_KLEUR.rand};border-radius:10px"><tr><td style="padding:12px"><p style="margin:0;font-size:12px;color:#666">${esc(label)}</p><p style="margin:2px 0 0;font-size:17px;font-weight:800;color:${MAIL_KLEUR.paars};line-height:1.25">${esc(waarde)}</p></td></tr></table></td>`;
}

function stap(nr: number, vet: string, rest: string): string {
  return `<tr><td width="36" valign="top"><div style="width:26px;height:26px;border-radius:13px;background:${MAIL_KLEUR.paars};color:#ffffff;font-weight:bold;font-size:13px;line-height:26px;text-align:center">${nr}</div></td><td style="padding:2px 0 14px;font-size:15px;line-height:1.5"><strong>${esc(vet)}</strong> ${esc(rest)}</td></tr>`;
}

export function klantmailHtml(d: {
  voornaam: string;
  u: Exclude<Uitkomst, { route: "huurder" | "geen_pv" }> | null;
  alineaZonderUitkomst: string[];
  dagdeel: string;
  disclaimer: string;
  consent: string;
  attributie: string;
}): string {
  const P = MAIL_KLEUR.paars;
  const telLink = `tel:+31${CONTACT.telefoon.replace(/\s/g, "").replace(/^0/, "")}`;
  const kwh = new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 2 });
  const toonCijfers = d.u && d.u.route !== "niet_rendabel";

  const cijfers = toonCijfers && d.u
    ? `<tr><td style="padding:0 28px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${MAIL_KLEUR.tint};border:1px solid ${P};border-radius:12px"><tr><td style="padding:20px 22px">
   <p style="margin:0;font-size:13px;color:#555">Met een thuisbatterij bespaar je naar verwachting</p>
   <p style="margin:4px 0 0;font-size:30px;font-weight:800;color:${P};line-height:1.15">${esc(euro(d.u.besparing_eur.min))} – ${esc(euro(d.u.besparing_eur.max))}</p>
   <p style="margin:2px 0 0;font-size:13px;color:#555">per jaar</p>
  </td></tr></table>
 </td></tr>
 <tr><td style="padding:12px 24px 0">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
   ${blok("Batterij", `${kwh.format(d.u.product.capaciteit_kwh)} kWh`)}
   ${blok("Terugverdientijd", `${jaren(d.u.terugverdientijd_jaar.min)} – ${jaren(d.u.terugverdientijd_jaar.max)} jaar`)}
   ${blok("Extra eigen stroom", `${getal(d.u.extra_zelfverbruik_kwh.min)}–${getal(d.u.extra_zelfverbruik_kwh.max)} kWh/jaar`)}
  </tr></table>
 </td></tr>`
    : "";

  const zonderUitkomst = d.alineaZonderUitkomst.length
    ? `<tr><td style="padding:0 28px">${d.alineaZonderUitkomst.map((p) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6">${esc(p)}</p>`).join("")}</td></tr>`
    : "";

  const uitvoerder = LIMSOLAR_LOGO_IN_MAIL
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto"><tr><td style="font-size:12px;color:#666;padding-right:10px;vertical-align:middle">Installatie door</td><td style="vertical-align:middle"><img src="${beeld("logo-limsolar.png")}" width="140" alt="${esc(LIMSOLAR.naam)}" style="display:block;border:0;width:140px;height:auto"></td></tr></table>`
    : `<p style="margin:0;font-size:13px;color:#666">Installatie, levering en garantie door <strong style="color:#333">${esc(LIMSOLAR.naam)}</strong></p>`;

  return `<!doctype html>
<html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Je berekening</title></head>
<body style="margin:0;padding:0;background:#EEEAF2">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEEAF2"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;font-family:'Open Sans',Arial,sans-serif;color:#2b2b2b">
 <tr><td style="background:${P};padding:22px 28px"><img src="${beeld("logo-thuisbatterij-wit.png")}" width="170" alt="${esc(ENTITEIT.handelsnaam)}" style="display:block;border:0;width:170px;height:auto"></td></tr>
 <tr><td style="padding:28px 28px 8px">
  <p style="margin:0 0 6px;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:${P};font-weight:bold">Jouw indicatie</p>
  <h1 style="margin:0 0 14px;font-size:22px;line-height:1.3;color:#1a1a1a">Hallo ${esc(d.voornaam)}, ${toonCijfers ? "dit kwam er uit je berekening" : "bedankt voor je aanvraag"}</h1>
  <p style="margin:0 0 20px;font-size:15px;line-height:1.6">Je hebt op ${esc(DOMEIN)} een berekening gemaakt voor een thuisbatterij. Hieronder staat wat eruit kwam, zodat je het kunt teruglezen voordat we bellen.</p>
 </td></tr>
 ${cijfers}
 ${zonderUitkomst}
 <tr><td style="padding:26px 28px 6px">
  <p style="margin:0 0 12px;font-size:17px;font-weight:bold;color:#1a1a1a">Wat er nu gebeurt</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
   ${stap(1, `We bellen je ${d.dagdeel}.`, "Het gesprek duurt ongeveer tien minuten.")}
   ${stap(2, "We lopen je berekening samen na", "en beantwoorden je vragen.")}
   ${stap(3, `Past het, dan krijg je een offerte van ${LIMSOLAR.naam}.`, "Daarin staat welk systeem technisch past en wat het kost.")}
  </table>
 </td></tr>
 <tr><td align="center" style="padding:6px 28px">
  <a href="${telLink}" style="display:inline-block;background:${MAIL_KLEUR.geel};color:#1a1a1a;font-weight:bold;font-size:16px;text-decoration:none;padding:14px 26px;border-radius:10px">Bel ons: ${esc(CONTACT.telefoon)}</a>
  <p style="margin:10px 0 0;font-size:13px;color:#666">Past het moment niet? Laat het weten via <a href="mailto:${CONTACT.email}" style="color:${P}">${esc(CONTACT.email)}</a>, dan verzetten we het.</p>
 </td></tr>
 <tr><td style="padding:22px 28px 6px">
  <p style="margin:0 0 10px;font-size:12px;line-height:1.6;color:#777">${esc(d.disclaimer)}</p>
  <p style="margin:0 0 10px;font-size:12px;line-height:1.6;color:#777">${esc(d.consent)}</p>
 </td></tr>
 <tr><td align="center" style="padding:16px 28px 22px;border-top:1px solid #EEEEEE">${uitvoerder}</td></tr>
 <tr><td style="background:${MAIL_KLEUR.tint};padding:14px 28px;font-size:11px;line-height:1.6;color:#777;text-align:center">${esc(d.attributie)}</td></tr>
</table></td></tr></table></body></html>`;
}

// ── Mail 2: melding aan de adviseur ─────────────────────────────────────────

/**
 * Deze mail is een werkinstructie, geen nieuwsbrief. Hij is zo opgebouwd dat je
 * hem op een telefoon in drie seconden leest en meteen kunt bellen: naam en
 * nummer bovenaan, dan het dagdeel, dan pas de details.
 */
/**
 * Adresregel voor de melding aan het belteam (28 okt 2026). Met de
 * BAG-controle erbij, zodat het team niet hoeft te vragen wat al bekend is,
 * en wél weet wanneer het adres even nagevraagd moet worden.
 */
export function adresregel(lead: Lead): string {
  const nr = `${lead.huisnummer}${lead.toevoeging ? lead.toevoeging : ""}`;
  const a = lead.adres_controle;
  if (!a) return `${nr}, ${lead.postcode} (adres niet gecontroleerd)`;
  if (!a.gevonden) return `${nr}, ${lead.postcode} — NIET gevonden in de BAG, adres even navragen`;
  const basis = `${a.straat} ${nr}, ${lead.postcode} ${a.woonplaats}${a.provincie ? ` (${a.provincie})` : ""}`;
  return a.toevoeging_klopt === false ? `${basis} — toevoeging "${lead.toevoeging}" bestaat niet in de BAG, navragen` : basis;
}

export function meldingAanAdviseur(lead: Lead, controle: Leadcontrole) {
  const u = controle.uitkomst;
  const regels = uitkomstregels(u);
  const route = u ? u.route : "onbekend";
  const naam = `${lead.voornaam} ${lead.achternaam}`.trim();

  const kop =
    route === "niet_rendabel"
      ? "ZACHTE LEAD (niet rendabel, wil toch overleg)"
      : route === "huurder" || route === "geen_pv"
        ? `LEAD ZONDER DOORREKENING (${route})`
        : "NIEUWE LEAD";

  // Lead-ID erin (8 okt 2026): de Google Sheet bevat geen namen meer, dus het
  // belteam zoekt de rij op Lead-ID.
  const onderwerp = `${lead.dagdeel === "zsm" ? "ZSM BELLEN · " : ""}${kop} — ${naam}, ${lead.dagdeel === "zsm" ? "zo snel mogelijk" : lead.dagdeel} — ${lead.postcode} — ${lead.id}`;

  const waarschuwingen: string[] = [];
  if (controle.komt_overeen === false) {
    waarschuwingen.push(
      `LET OP: de herberekening wijkt af van wat de browser meldde. ${controle.opmerking ?? ""} De klant heeft in de mail ONZE getallen gekregen.`
    );
  }
  if (controle.komt_overeen === null && controle.opmerking) {
    waarschuwingen.push(`Let op: ${controle.opmerking}`);
  }
  if (!ENTITEIT.ingevuld) {
    waarschuwingen.push(
      "Let op: de entiteit in lib/site.ts staat nog op [ENTITEIT]. De bevestigingsmail noemt daarom alleen Limsolar."
    );
  }
  if (u && u.route !== "huurder" && u.route !== "geen_pv") {
    if (u.terugleverkosten_eur > 0) {
      waarschuwingen.push(
        `De klant heeft zelf terugleverkosten van ${centen(u.terugleverkosten_eur)} per kWh opgegeven. Trek dat als eerste na — hierop staat of valt de terugverdientijd.`
      );
    } else if (u.terugleverkosten_antwoord === "weet_niet") {
      // Nul euro met "weet ik niet" erachter is iets heel anders dan nul euro
      // met "ik betaal niets" erachter: in het eerste geval ligt er een vraag
      // open die de uitkomst nog gunstiger kan maken, in het tweede niet. In de
      // som schelen ze niets, aan de telefoon alles.
      waarschuwingen.push(
        "De klant weet niet of hij terugleverkosten betaalt. Er is met nul gerekend, de voorzichtige kant. Vraag naar zijn jaarafrekening — betaalt hij ze wel, dan valt de terugverdientijd fors korter uit dan wat hij op het scherm zag."
      );
    }
    // Twee kanten van dezelfde post. Bij een vast contract laten we geld liggen
    // dat de klant zou kunnen pakken; bij een dynamisch contract zit er een
    // bedrag in de som dat alleen klopt als er ook echt gestuurd wordt.
    if (u.contract === "dynamisch" && u.restcycli_kwh > 0) {
      waarschuwingen.push(
        `In de som zit ${euro(u.handelsopbrengst_eur)} per jaar uit ${getal(u.restcycli_kwh)} kWh restcycli: laden op goedkope uren. Dat geldt alleen mét actieve sturing. Kan Limsolar dat niet leveren, noem dit bedrag dan niet aan de telefoon.`
      );
    } else if (u.contract !== "dynamisch") {
      waarschuwingen.push(
        "De klant heeft geen dynamisch contract, dus er is niets gerekend voor laden op goedkope uren. Overweegt hij over te stappen, dan valt de terugverdientijd korter uit."
      );
    }
  }

  // De kop boven de bedragen. Deze regels komen uit de server-side
  // hercontrole, niet uit de snapshot — en juist als die twee uiteenlopen is
  // "wat de klant zag" het verkeerde bijschrift. Dan zag de klant iets ánders,
  // en dat verschil staat hierboven al bij de waarschuwingen.
  const indicatiekop = "Onze doorrekening (dit staat ook in de bevestigingsmail):";

  // Kopblok: dit rendert de HTML-versie los als naam, nummer en belvenster.
  const kopblokken: string[] = [
    `${kop}`,
    `${naam}\n${lead.telefoon}\n${lead.email}`,
    `Bellen: ${DAGDEELTEKST[lead.dagdeel]}`,
    `Adres: ${adresregel(lead)}`,
  ];

  // Restblok: alles wat in de HTML-versie in het grijze <pre>-vlak belandt.
  // Waarschuwingen en indicatie horen in geen van beide lijsten, want die
  // krijgen in HTML hun eigen opmaak. Eerder stonden alle blokken op één hoop
  // en sneed de HTML er met slice(regels.length ? 5 : 4) een stuk af. Dat
  // klopte alleen als er géén waarschuwing was; met waarschuwing schoof alles
  // een plaats op en stond de indicatie twee keer in de mail. Vandaar drie
  // aparte lijsten in plaats van tellen.
  const restblokken: string[] = [];

  if (controle.antwoorden) {
    const a = controle.antwoorden;
    restblokken.push(
      [
        "Ingevuld:",
        `- Zonnepanelen: ${a.zonnepanelen}`,
        `- Panelen: ${a.panelen.soort === "aantal" ? `${a.panelen.aantal} stuks` : `${a.panelen.m2} m² dak`}`,
        `- Verbruik: ${a.verbruik.soort === "kwh" ? `${a.verbruik.kwh} kWh` : `huishouden ${a.verbruik.grootte}`}`,
        `- Contract: ${a.contract}`,
        `- Eigenaar: ${a.eigenaar ? "ja" : "nee"}`,
      ].join("\n")
    );
  }

  restblokken.push(
    [
      "Herkomst:",
      `- Pagina: ${lead.pagina_url || "onbekend"}`,
      `- Variant: ${lead.variant}`,
      `- Domein: ${lead.bron_domein}`,
      ...Object.entries(lead.attributie)
        .filter(([, v]) => v)
        .map(([k, v]) => `- ${k}: ${v}`),
    ].join("\n")
  );

  restblokken.push(
    [
      "Toestemming (bewaar dit, dit is de dekking onder het telefoontje):",
      `- Tekst v${lead.consent_versie}: ${lead.consent_tekst}`,
      `- Tijdstip: ${lead.consent_tijdstip}`,
      `- Gelinkte pagina's: privacyverklaring v${lead.privacy_versie}, bedrijfsgegevens v${lead.bedrijfsgegevens_versie}`,
      `- IP: ${lead.ip_adres}`,
      `- Lead-id: ${lead.id}`,
    ].join("\n")
  );

  const tekst = [
    ...kopblokken,
    ...(waarschuwingen.length ? [waarschuwingen.join("\n\n")] : []),
    ...(regels.length ? [[indicatiekop, ...regels.map((r) => `- ${r}`)].join("\n")] : []),
    ...restblokken,
  ].join("\n\n");

  const html = `<!doctype html>
<html lang="nl"><body style="margin:0;padding:16px;font-family:-apple-system,Arial,sans-serif;color:#111;line-height:1.5">
<div style="max-width:600px;margin:0 auto">
  <p style="margin:0 0 4px;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#370060;font-weight:700">${esc(kop)}</p>
  <p style="margin:0 0 4px;font-size:22px;font-weight:700">${esc(naam)}</p>
  <p style="margin:0 0 16px;font-size:18px">
    <a href="tel:${esc(lead.telefoon.replace(/\s/g, ""))}" style="color:#370060;font-weight:700">${esc(lead.telefoon)}</a>
    &nbsp;·&nbsp;<a href="mailto:${esc(lead.email)}" style="color:#370060">${esc(lead.email)}</a>
  </p>
  <p style="margin:0 0 16px;padding:10px 12px;background:#f4eefa;border-radius:8px">
    <strong>Bellen:</strong> ${esc(DAGDEELTEKST[lead.dagdeel])}<br>
    <strong>Adres:</strong> ${esc(adresregel(lead))}
  </p>
  ${
    waarschuwingen.length
      ? `<div style="margin:0 0 16px;padding:10px 12px;background:#fff9c4;border:2px solid #a08a00;border-radius:8px">
      ${waarschuwingen.map((w) => `<p style="margin:0 0 8px">${esc(w)}</p>`).join("")}
    </div>`
      : ""
  }
  ${
    regels.length
      ? `<p style="margin:0 0 8px;font-weight:600">${esc(indicatiekop)}</p>
       <ul style="margin:0 0 16px;padding-left:20px">${regels.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>`
      : ""
  }
  <pre style="margin:0;padding:12px;background:#f5f5f5;border-radius:8px;font-size:12px;white-space:pre-wrap;font-family:ui-monospace,Menlo,monospace">${esc(
    restblokken.join("\n\n")
  )}</pre>
</div>
</body></html>`;

  return { onderwerp, tekst, html };
}

/** Eén regel voor het pushkanaal. Moet passen op een vergrendeld scherm. */
export function pushregel(lead: Lead, controle: Leadcontrole): { titel: string; bericht: string } {
  const route = controle.uitkomst?.route ?? "onbekend";
  const titel = route === "niet_rendabel" ? "Zachte lead" : "Nieuwe lead";
  return {
    titel,
    bericht: `${lead.voornaam} ${lead.achternaam} · ${lead.telefoon} · bellen ${lead.dagdeel === "zsm" ? "ZO SNEL MOGELIJK" : lead.dagdeel} · ${lead.postcode}`,
  };
}
