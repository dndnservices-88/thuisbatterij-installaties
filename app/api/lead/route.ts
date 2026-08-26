import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { bewaarLead, stuurNaarMetaCapi, type Lead } from "@/lib/opslag";
import { CONSENT } from "@/lib/site";
import { kiesVariant } from "@/lib/varianten";
import { controleer } from "@/lib/leadcontrole";
import { stuurMail, stuurPush } from "@/lib/mail";
import { bevestigingAanKlant, magBevestigingVersturen, meldingAanAdviseur, pushregel } from "@/lib/berichten";

export const runtime = "nodejs";

/**
 * Leadontvangst.
 *
 * Alles wat juridisch telt wordt hier server-side bepaald, niet door de browser
 * aangeleverd: het tijdstip van toestemming, het IP-adres, de user-agent en de
 * consenttekst zelf. Een browser kan liegen; als de ACM of een consument vraagt
 * waarom er gebeld is, is dit logboek de enige verdediging.
 *
 * ── Volgorde, en waarom die zo is ──────────────────────────────────────────
 *
 *  1. Opslaan (webhook). Lukt dit niet, dan stopt alles en krijgt de bezoeker
 *     een foutmelding. Een lead die stil verdwijnt is het ergste dat er kan
 *     gebeuren: de bezoeker denkt dat hij gebeld wordt en er gebeurt niets.
 *  2. Pas daarna melden en mailen. Die stappen mogen mislukken zonder dat de
 *     bezoeker er iets van merkt — de lead ligt dan immers al vast en is
 *     handmatig op te pakken.
 *
 * Nooit omdraaien. Een bevestigingsmail versturen voor een lead die niet is
 * opgeslagen, betekent een klant die op een telefoontje wacht dat nergens
 * gepland staat.
 */

function tekst(w: unknown, max = 200): string {
  return typeof w === "string" ? w.trim().slice(0, max) : "";
}

/**
 * Harde tijdslimiet om een trage bestemming heen. Zonder dit kan één hangende
 * verbinding het formulier tien seconden laten draaien terwijl de lead er al
 * lang in staat.
 */
function metLimiet<T>(taak: Promise<T>, ms: number, bijTeLaat: T): Promise<T> {
  return Promise.race([
    taak,
    new Promise<T>((res) => setTimeout(() => res(bijTeLaat), ms)),
  ]);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ fout: "Ongeldige aanvraag" }, { status: 400 });
  }

  const h = headers();
  const ip = (h.get("x-forwarded-for") || "").split(",")[0].trim() || h.get("x-real-ip") || "onbekend";
  const host = h.get("host");

  // Herberekening vóór de opslag, zodat het resultaat mee de opslag in gaat.
  const controle = controleer(body.calc_snapshot);
  const gecontroleerd =
    controle.uitkomst && controle.uitkomst.route !== "huurder" && controle.uitkomst.route !== "geen_pv"
      ? controle.uitkomst
      : null;

  const lead: Lead = {
    id: crypto.randomUUID(),

    voornaam: tekst(body.voornaam, 60),
    achternaam: tekst(body.achternaam, 80),
    telefoon: tekst(body.telefoon, 30),
    email: tekst(body.email, 120),
    postcode: tekst(body.postcode, 10).toUpperCase(),
    huisnummer: tekst(body.huisnummer, 10),
    toevoeging: tekst(body.toevoeging, 10) || undefined,
    dagdeel: (["ochtend", "middag", "avond"] as const).includes(body.dagdeel as never)
      ? (body.dagdeel as Lead["dagdeel"])
      : "middag",

    // Toestemming. De tekst komt uit lib/site.ts en niet uit de request, zodat
    // een aangepaste request nooit een andere consenttekst kan laten loggen.
    consent_tekst: CONSENT.tekst,
    consent_versie: CONSENT.versie,
    consent_tijdstip: new Date().toISOString(),
    ip_adres: ip,
    user_agent: h.get("user-agent") || "onbekend",
    pagina_url: tekst(body.pagina_url, 1000),

    attributie: (body.attributie as Record<string, string | undefined>) ?? {},
    calc_snapshot: body.calc_snapshot ?? null,
    calc_controle: {
      route: controle.uitkomst?.route ?? null,
      besparing_midden: gecontroleerd?.besparing_eur.midden ?? null,
      terugverdientijd_midden: gecontroleerd?.terugverdientijd_jaar.midden ?? null,
      terugleverkosten: gecontroleerd?.terugleverkosten_eur ?? null,
      terugleverkosten_antwoord: gecontroleerd?.terugleverkosten_antwoord ?? null,
      rekenversie: gecontroleerd?.rekenversie ?? null,
      komt_overeen: controle.komt_overeen,
      ...(controle.opmerking ? { opmerking: controle.opmerking } : {}),
    },

    bron_domein: host ?? "onbekend",
    event_id: tekst(body.event_id, 100) || crypto.randomUUID(),
    variant: kiesVariant(host).id,
  };

  // Minimale controle. De echte kwalificatie gebeurt aan de telefoon, maar een
  // lead zonder telefoonnummer of e-mail is per definitie onbruikbaar.
  if (!lead.telefoon || !lead.email || !lead.voornaam) {
    return NextResponse.json({ fout: "Onvolledige gegevens" }, { status: 422 });
  }

  try {
    await bewaarLead(lead);
  } catch (e) {
    // Opslag mislukt = lead kwijt. Dat mag nooit stil gebeuren.
    console.error("Lead niet opgeslagen", e, lead.id);
    return NextResponse.json({ fout: "Opslag mislukt" }, { status: 500 });
  }

  if (controle.komt_overeen === false) {
    // Geen reden om de lead te weigeren — het kan ook een oude tab zijn die nog
    // met een vorige rekenversie draaide. Wel iets om te zien.
    console.warn("[LEAD] Herberekening wijkt af", lead.id, controle.opmerking);
  }

  // ── De drie bestemmingen naast de opslag ──────────────────────────────────
  // Alle drie parallel, alle drie met tijdslimiet, geen enkele mag de bezoeker
  // laten wachten of een fout opleveren. De lead ligt hierboven al vast.
  const opmerkingen: string[] = [];

  const naarAdviseur = process.env.MELDING_AAN;
  const melding = meldingAanAdviseur(lead, controle);
  const bevestiging = bevestigingAanKlant(lead, controle);
  const poort = magBevestigingVersturen();
  const push = pushregel(lead, controle);

  if (!naarAdviseur) opmerkingen.push("MELDING_AAN ontbreekt; geen meldingsmail verstuurd.");
  if (!poort.mag) opmerkingen.push(`Bevestigingsmail overgeslagen: ${poort.reden}`);

  const [meldingUit, bevestigingUit, pushUit, _capi] = await Promise.all([
    naarAdviseur
      ? metLimiet(
          stuurMail({
            aan: naarAdviseur.split(",").map((a) => a.trim()),
            onderwerp: melding.onderwerp,
            tekst: melding.tekst,
            html: melding.html,
            antwoordAan: lead.email,
          }),
          8000,
          { verstuurd: false, reden: "Tijdslimiet" }
        )
      : Promise.resolve({ verstuurd: false, reden: "MELDING_AAN ontbreekt" }),

    poort.mag
      ? metLimiet(
          stuurMail({
            aan: lead.email,
            onderwerp: bevestiging.onderwerp,
            tekst: bevestiging.tekst,
            html: bevestiging.html,
            ...(naarAdviseur ? { antwoordAan: naarAdviseur.split(",")[0].trim() } : {}),
          }),
          8000,
          { verstuurd: false, reden: "Tijdslimiet" }
        )
      : Promise.resolve({ verstuurd: false, reden: poort.reden }),

    metLimiet(stuurPush(push.titel, push.bericht), 4000, false),

    // Meta krijgt de gebeurtenis nogmaals server-side met hetzelfde event_id.
    metLimiet(stuurNaarMetaCapi(lead), 6000, undefined),
  ]);

  if (!meldingUit.verstuurd && naarAdviseur)
    opmerkingen.push(`Meldingsmail mislukt: ${meldingUit.reden}`);
  if (!bevestigingUit.verstuurd && poort.mag)
    opmerkingen.push(`Bevestigingsmail mislukt: ${bevestigingUit.reden}`);

  if (opmerkingen.length) console.warn("[LEAD] Aflevering onvolledig", lead.id, opmerkingen);

  // De bezoeker krijgt altijd ok terug zodra de lead vastligt. Wat er met de
  // mails is gebeurd staat erbij voor het testscript, niet voor het formulier.
  return NextResponse.json({
    ok: true,
    id: lead.id,
    aflevering: {
      opgeslagen: true,
      meldingsmail: meldingUit.verstuurd,
      bevestigingsmail: bevestigingUit.verstuurd,
      push: pushUit,
      opmerkingen,
    },
  });
}
