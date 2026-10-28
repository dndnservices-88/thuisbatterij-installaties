import { NextResponse } from "next/server";
import { zoekAdres } from "@/lib/adres";

export const runtime = "nodejs";

/**
 * Adrescontrole voor het formulier (28 okt 2026). De browser vraagt het hier,
 * wij vragen het aan PDOK — zo ziet het Kadaster het IP-adres van de bezoeker
 * niet. Er wordt niets opgeslagen of gelogd.
 *
 * Antwoord altijd 200 met { gevonden } of { beschikbaar: false }: het formulier
 * moet bij een storing gewoon door kunnen.
 */
export async function GET(request: Request) {
  const u = new URL(request.url);
  const r = await zoekAdres(
    u.searchParams.get("postcode") ?? "",
    u.searchParams.get("huisnummer") ?? "",
    u.searchParams.get("toevoeging") ?? ""
  );
  if (!r) return NextResponse.json({ beschikbaar: false }, { headers: { "cache-control": "no-store" } });
  return NextResponse.json(
    { beschikbaar: true, ...r },
    { headers: { "cache-control": "public, s-maxage=86400, stale-while-revalidate=604800" } }
  );
}
