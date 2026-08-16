import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { bewaarLead, stuurNaarMetaCapi, type Lead } from "@/lib/opslag";
import { CONSENT } from "@/lib/site";
import { kiesVariant } from "@/lib/varianten";

export const runtime = "nodejs";

/**
 * Leadontvangst.
 *
 * Alles wat juridisch telt wordt hier server-side bepaald, niet door de browser
 * aangeleverd: het tijdstip van toestemming, het IP-adres, de user-agent en de
 * consenttekst zelf. Een browser kan liegen; als de ACM of een consument vraagt
 * waarom er gebeld is, is dit logboek de enige verdediging.
 */

function tekst(w: unknown, max = 200): string {
  return typeof w === "string" ? w.trim().slice(0, max) : "";
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

  // Meta krijgt de gebeurtenis nogmaals server-side met hetzelfde event_id.
  // Bewust ná de opslag en zonder await-afhankelijkheid van het antwoord.
  await stuurNaarMetaCapi(lead);

  return NextResponse.json({ ok: true, id: lead.id });
}
