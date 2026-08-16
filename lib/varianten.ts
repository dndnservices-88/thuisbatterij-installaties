/**
 * Hostname-schakelaar.
 *
 * Eén codebase, twee boodschappen. Nu draait alleen de rekensom-variant;
 * de prijsvariant staat er wel in maar is uitgeschakeld omdat de
 * laagsteprijsgarantie (claimregister P1) en de prijzen van middenklasse en
 * premium (P3) nog niet bevestigd zijn.
 *
 * Zodra beslisdocument punt 2 beslist is en die claims groen staan:
 * zet `actief: true` bij de prijsvariant en koppel het tweede domein in Vercel.
 * Verder hoeft er niets te veranderen — alle componenten zijn gedeeld.
 */

export type VariantId = "rekensom" | "prijs";

export type Variant = {
  id: VariantId;
  actief: boolean;
  domein: string;
  hero: { kop: string; sub: string; knop: string };
  /** Korte omschrijving voor de bouwstatus-balk */
  toelichting: string;
};

export const VARIANTEN: Record<VariantId, Variant> = {
  rekensom: {
    id: "rekensom",
    actief: true,
    domein: "thuisbatterij-installaties.nl",
    hero: {
      kop: "Eerst rekenen. Dan installeren.",
      sub: "De salderingsregeling stopt in 2027. Reken in twee minuten uit wat een thuisbatterij in jouw situatie oplevert — en of hij er bij jou wel uitkomt.",
      knop: "Bereken mijn situatie",
    },
    toelichting:
      "Rekensom-boodschap. Zoekwoorden rond einde saldering, terugleverkosten en rendement.",
  },
  prijs: {
    id: "prijs",
    actief: false,
    domein: "slimmethuisbatterij-direct.nl",
    hero: {
      kop: "[PRIJSVARIANT — nog niet vrijgegeven]",
      sub: "Wacht op beslisdocument punt 2 en op claim P1 en P3.",
      knop: "Bereken mijn situatie",
    },
    toelichting:
      "Prijs-boodschap. Pas bouwen als de laagsteprijsgarantie procesmatig geborgd is.",
  },
};

const DOMEIN_NAAR_VARIANT: Record<string, VariantId> = {
  "thuisbatterij-installaties.nl": "rekensom",
  "www.thuisbatterij-installaties.nl": "rekensom",
  "slimmethuisbatterij-direct.nl": "prijs",
  "www.slimmethuisbatterij-direct.nl": "prijs",
};

/** Kiest de variant op basis van de host-header. Onbekende host → rekensom. */
export function kiesVariant(host?: string | null): Variant {
  if (!host) return VARIANTEN.rekensom;
  const schoon = host.split(":")[0].toLowerCase();
  const id = DOMEIN_NAAR_VARIANT[schoon];
  const variant = id ? VARIANTEN[id] : VARIANTEN.rekensom;
  // Een niet-actieve variant valt terug op de rekensom-variant, zodat een
  // per ongeluk gekoppeld domein nooit een half afgebouwde pagina toont.
  return variant.actief ? variant : VARIANTEN.rekensom;
}
