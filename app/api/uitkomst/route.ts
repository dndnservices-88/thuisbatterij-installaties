import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { timingSafeEqual } from "node:crypto";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { controleerMelding, conversieregel, type Uitkomstmelding } from "@/lib/uitkomst";

export const runtime = "nodejs";

/**
 * Uitkomstregistratie.
 *
 * De setter hangt hier een resultaat aan een lead: niet bereikbaar, A/B/C,
 * afspraak geboekt, nagekomen, sale of geen sale. Dat resultaat gaat door naar
 * het CRM, en van daaruit — via het klik-ID — terug naar Google Ads.
 *
 * ── Waarom dit endpoint een sleutel heeft en /api/lead niet ─────────────────
 *
 * Het leadformulier moet open staan, want iedere bezoeker moet het kunnen
 * gebruiken. Dit endpoint niet: hier wordt commerciële waarheid geschreven.
 * Wie hier ongevraagd een `sale` in kan schieten, kan het biedalgoritme sturen
 * en onze eigen facturatie vervuilen. Vandaar een gedeelde sleutel, vergeleken
 * in constante tijd zodat je hem er niet teken voor teken uit kunt meten.
 *
 * Zonder UITKOMST_TOKEN weigert het endpoint volledig. Geen open stand "voor
 * het gemak": een endpoint dat per ongeluk open op productie staat, ontdek je
 * niet — er komt namelijk geen foutmelding van.
 *
 * ── Wat hier NIET gebeurt ───────────────────────────────────────────────────
 *
 * Er wordt niets naar Google gestuurd. De conversieregel wordt wél berekend en
 * meegegeven, zodat de automatisering aan de andere kant van de webhook hem
 * alleen nog hoeft weg te schrijven. Reden: het klik-ID zit in het CRM, niet
 * hier — deze route kent alleen wat de aanroeper meestuurt. Komt de attributie
 * niet mee, dan staat dat in het antwoord in plaats van dat er stil een regel
 * met een leeg klik-ID ontstaat.
 */

function gelijk(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  if (x.length !== y.length) return false;
  return timingSafeEqual(x, y);
}

async function naarBestand(regel: unknown) {
  const map = path.join(process.cwd(), "data");
  await mkdir(map, { recursive: true });
  await appendFile(path.join(map, "uitkomsten.ndjson"), JSON.stringify(regel) + "\n", "utf8");
}

async function bewaarUitkomst(melding: Uitkomstmelding & { conversie: unknown }): Promise<void> {
  const webhook = process.env.UITKOMST_WEBHOOK_URL;

  if (webhook) {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(melding),
    });
    if (!res.ok) throw new Error(`Webhook gaf ${res.status}`);
    return;
  }

  if (process.env.NEXT_PUBLIC_LIVE === "true") {
    throw new Error(
      "Geen UITKOMST_WEBHOOK_URL ingesteld terwijl de site live staat. Een uitkomst die alleen in een logregel belandt, is over negentig dagen niet meer aan een klik te koppelen."
    );
  }

  if (process.env.NODE_ENV === "production") {
    console.info("[TESTUITKOMST]", JSON.stringify(melding));
    return;
  }

  await naarBestand(melding);
}

export async function POST(request: Request) {
  const sleutel = process.env.UITKOMST_TOKEN;
  if (!sleutel) {
    console.error("[UITKOMST] UITKOMST_TOKEN ontbreekt; endpoint geweigerd");
    return NextResponse.json({ fout: "Endpoint niet ingericht" }, { status: 503 });
  }

  const aangeboden = headers().get("x-uitkomst-token") || "";
  if (!aangeboden || !gelijk(aangeboden, sleutel)) {
    return NextResponse.json({ fout: "Geen toegang" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ fout: "Ongeldige aanvraag" }, { status: 400 });
  }

  const controle = controleerMelding(body);
  if (!controle.ok) {
    return NextResponse.json({ fout: controle.fout }, { status: 422 });
  }

  const melding = controle.melding;
  const attributie = ((body as Record<string, unknown>).attributie ?? {}) as Record<
    string,
    string | undefined
  >;
  const conversie = conversieregel(melding.uitkomst, melding.tijdstip, attributie);

  try {
    await bewaarUitkomst({ ...melding, conversie });
  } catch (e) {
    console.error("[UITKOMST] Niet opgeslagen", e, melding.lead_id, melding.uitkomst);
    return NextResponse.json({ fout: "Opslag mislukt" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    lead_id: melding.lead_id,
    uitkomst: melding.uitkomst,
    // Staat regel op null, dan is er een reden en die hoort zichtbaar te zijn.
    // Een uitkomst die niet naar Google gaat is normaal; een uitkomst die er
    // stil niet heen gaat is een lek.
    conversie,
  });
}
