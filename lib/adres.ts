/**
 * Adrescontrole via PDOK Locatieserver (Kadaster, BAG). Toegevoegd 28 okt 2026.
 *
 * Gratis, zonder sleutel. Getest 28 okt 2026: 1689ZX + 62 → "Jelle Zijlstraweg
 * 62, Zwaag, Noord-Holland", met varianten 62A en 62B.
 *
 * Twee regels die hier bewust zo staan:
 *  • De opvraging loopt alleen via onze eigen server (app/api/adres en
 *    app/api/lead), nooit rechtstreeks vanuit de browser. Zo ziet het Kadaster
 *    niet het IP-adres van de bezoeker.
 *  • Een mislukte of trage controle blokkeert nooit een aanvraag. Het adres is
 *    een hulpmiddel voor het belteam, geen poortwachter.
 */

export const PDOK_URL = "https://api.pdok.nl/bzk/locatieserver/search/v3_1/free";

export type AdresControle = {
  gevonden: boolean;
  straat?: string;
  woonplaats?: string;
  provincie?: string;
  /** Bestaande toevoegingen op dit huisnummer, bijv. ["A", "B", "1"]. Leeg = geen. */
  toevoegingen: string[];
  /** Bestaat de ingevulde toevoeging in de BAG? null = niets ingevuld of niet te bepalen. */
  toevoeging_klopt: boolean | null;
};

export function normaliseerPostcode(p: string): string | null {
  const s = (p || "").replace(/\s+/g, "").toUpperCase();
  return /^[1-9][0-9]{3}[A-Z]{2}$/.test(s) ? s : null;
}

export function normaliseerHuisnummer(h: string): string | null {
  const s = (h || "").trim();
  return /^[1-9][0-9]{0,4}$/.test(s) ? s : null;
}

export function pdokZoekUrl(postcode: string, huisnummer: string): string {
  const q = new URLSearchParams();
  q.append("fq", `postcode:${postcode}`);
  q.append("fq", `huisnummer:${huisnummer}`);
  q.append("fq", "type:adres");
  q.append("rows", "50");
  q.append("fl", "straatnaam,huisnummer,huisletter,huisnummertoevoeging,postcode,woonplaatsnaam,provincienaam");
  return `${PDOK_URL}?${q.toString()}`;
}

type PdokDoc = {
  straatnaam?: string;
  huisnummer?: number | string;
  huisletter?: string;
  huisnummertoevoeging?: string;
  woonplaatsnaam?: string;
  provincienaam?: string;
};

function schoon(t: string) {
  return t.replace(/[\s-]+/g, "").toUpperCase();
}

/** Zet het PDOK-antwoord om. Pure functie, los getest. */
export function leesPdok(json: unknown, toevoeging = ""): AdresControle {
  const docs: PdokDoc[] =
    (json as { response?: { docs?: PdokDoc[] } })?.response?.docs?.filter((d) => d && d.straatnaam) ?? [];
  if (docs.length === 0) return { gevonden: false, toevoegingen: [], toevoeging_klopt: null };

  const eerste = docs[0];
  const toevoegingen = Array.from(
    new Set(
      docs
        .map((d) => `${d.huisletter ?? ""}${d.huisnummertoevoeging ? (d.huisletter ? "-" : "") + d.huisnummertoevoeging : ""}`)
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b, "nl", { numeric: true }));

  const t = schoon(toevoeging);
  const toevoeging_klopt = t ? toevoegingen.some((x) => schoon(x) === t) : null;

  return {
    gevonden: true,
    straat: eerste.straatnaam,
    woonplaats: eerste.woonplaatsnaam,
    provincie: eerste.provincienaam,
    toevoegingen,
    toevoeging_klopt,
  };
}

/**
 * Server-side opvraging met harde tijdslimiet. Geeft null bij ongeldige invoer,
 * een fout of een time-out — de aanroeper gaat dan gewoon door.
 */
export async function zoekAdres(
  postcodeRuw: string,
  huisnummerRuw: string,
  toevoeging = "",
  ms = 2500
): Promise<AdresControle | null> {
  const postcode = normaliseerPostcode(postcodeRuw);
  const huisnummer = normaliseerHuisnummer(huisnummerRuw);
  if (!postcode || !huisnummer) return null;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(pdokZoekUrl(postcode, huisnummer), {
      signal: ctrl.signal,
      headers: { accept: "application/json" },
      next: { revalidate: 86400 },
    } as RequestInit);
    if (!res.ok) return null;
    return leesPdok(await res.json(), toevoeging);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
