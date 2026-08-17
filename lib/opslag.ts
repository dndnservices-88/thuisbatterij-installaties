import { createHash } from "node:crypto";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

/**
 * Opslag van leads. Server-side, in app/api/lead/route.ts aangeroepen.
 *
 * ⚠️ Vercel heeft een tijdelijk bestandssysteem: het lokale ndjson-bestand is
 * alleen voor lokaal testen. Zodra NEXT_PUBLIC_LIVE op "true" staat MOET
 * LEAD_WEBHOOK_URL of een echte database ingesteld zijn. Ontbreekt die, dan geeft
 * de route een fout terug — liever een zichtbare fout dan een lead die stil
 * verdwijnt. Zolang de site niet live is, belandt een testlead in het logboek.
 */

export type Lead = {
  id: string;
  /** ── Contactgegevens ── */
  voornaam: string;
  achternaam: string;
  telefoon: string;
  email: string;
  postcode: string;
  huisnummer: string;
  toevoeging?: string;
  dagdeel: "ochtend" | "middag" | "avond";

  /** ── Toestemming: dit is de juridische dekking ── */
  consent_tekst: string;
  consent_versie: string;
  consent_tijdstip: string; // server-side bepaald, niet uit de browser
  ip_adres: string;
  user_agent: string;
  pagina_url: string;

  /** ── Klik-ID's: de terugkoppelingsloop ── */
  attributie: Record<string, string | undefined>;

  /** ── De berekening zelf: invoer én getoonde uitkomst (claimregister R4) ── */
  calc_snapshot: unknown;

  /** ── Overig ── */
  bron_domein: string;
  event_id: string;
  variant: string;
};

export function sha256(waarde: string): string {
  return createHash("sha256").update(waarde).digest("hex");
}

/** Meta wil genormaliseerde, gehashte waarden: kleine letters, geen spaties. */
export function hashEmail(email: string): string {
  return sha256(email.trim().toLowerCase());
}

/** Telefoon in internationaal formaat zonder plus, dus 06… wordt 316…. */
export function hashTelefoon(telefoon: string): string {
  let t = telefoon.replace(/[^0-9+]/g, "");
  if (t.startsWith("+")) t = t.slice(1);
  if (t.startsWith("00")) t = t.slice(2);
  if (t.startsWith("06")) t = "31" + t.slice(1);
  else if (t.startsWith("0")) t = "31" + t.slice(1);
  return sha256(t);
}

async function naarBestand(lead: Lead) {
  const map = path.join(process.cwd(), "data");
  await mkdir(map, { recursive: true });
  await appendFile(path.join(map, "leads.ndjson"), JSON.stringify(lead) + "\n", "utf8");
}

async function naarWebhook(lead: Lead, url: string) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(lead),
  });
  if (!res.ok) throw new Error(`Webhook gaf ${res.status}`);
}

export async function bewaarLead(lead: Lead): Promise<void> {
  const webhook = process.env.LEAD_WEBHOOK_URL;

  if (webhook) {
    await naarWebhook(lead, webhook);
    return;
  }

  // Geen webhook. Of dat mag, hangt af van NEXT_PUBLIC_LIVE en níét van NODE_ENV:
  // Vercel draait ook voorvertoningen met NODE_ENV=production, dus daarop sturen
  // betekent dat je het formulier nooit kunt testen voordat er een echte
  // leadbestemming is.
  if (process.env.NEXT_PUBLIC_LIVE === "true") {
    throw new Error(
      "Geen LEAD_WEBHOOK_URL ingesteld terwijl de site live staat. Een lead mag nooit alleen naar het tijdelijke bestandssysteem worden geschreven."
    );
  }

  if (process.env.NODE_ENV === "production") {
    // Voorvertoning op Vercel: het bestandssysteem is tijdelijk, dus schrijven we
    // naar het logboek. Terug te vinden onder Deployments → Runtime Logs.
    //
    // ⚠️ Hier staan persoonsgegevens in. Dat kan alleen omdat de site niet live is
    // en de URL niet gedeeld wordt: het zijn je eigen testleads. Zodra
    // NEXT_PUBLIC_LIVE op "true" gaat, is deze tak onbereikbaar en is een echte
    // leadbestemming verplicht.
    console.info("[TESTLEAD]", JSON.stringify(lead));
    return;
  }

  await naarBestand(lead);
}

/**
 * Meta Conversions API. Stuurt dezelfde gebeurtenis nogmaals server-side met
 * hetzelfde event_id, zodat Meta ontdubbelt. Ontbreken de gegevens, dan slaan
 * we het stil over — de lead zelf mag hier nooit op stuklopen.
 */
export async function stuurNaarMetaCapi(lead: Lead): Promise<void> {
  const pixel = process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;
  if (!pixel || !token) return;

  const payload = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: lead.event_id, // deduplicatie met de browsergebeurtenis
        event_source_url: lead.pagina_url,
        action_source: "website",
        user_data: {
          em: [hashEmail(lead.email)],
          ph: [hashTelefoon(lead.telefoon)],
          client_ip_address: lead.ip_adres,
          client_user_agent: lead.user_agent,
          fbp: lead.attributie._fbp,
          fbc: lead.attributie._fbc,
        },
      },
    ],
    ...(process.env.META_TEST_EVENT_CODE ? { test_event_code: process.env.META_TEST_EVENT_CODE } : {}),
  };

  try {
    await fetch(`https://graph.facebook.com/v20.0/${pixel}/events?access_token=${token}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error("Meta CAPI mislukt", e);
  }
}
