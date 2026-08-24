/**
 * Mailverzending via Resend.
 *
 * Bewust via de REST-API en niet via het npm-pakket. Dat scheelt een
 * afhankelijkheid, en belangrijker: het houdt zichtbaar wat er precies over de
 * lijn gaat. Het pakket doet niets wat deze twintig regels niet doen.
 *
 * Twee regels die hier hard in staan:
 *
 *  1. Een mislukte mail mag NOOIT de lead laten stuklopen. De lead is het geld;
 *     de mail is service. Daarom vangt elke functie zijn eigen fout af en geeft
 *     hij terug óf het gelukt is, in plaats van te gooien.
 *  2. Ontbreekt de sleutel, dan gebeurt er niets en staat dat in het logboek.
 *     Geen stille aanname dat het wel goed zit.
 */

export type Mail = {
  aan: string | string[];
  onderwerp: string;
  tekst: string;
  html: string;
  /** Waar een antwoord van de klant heen gaat. Vaak een ander adres dan de afzender. */
  antwoordAan?: string;
};

export type Mailresultaat = { verstuurd: boolean; reden?: string; id?: string };

/**
 * Het afzenderadres moet op een domein staan dat in Resend is geverifieerd,
 * anders weigert Resend of belandt alles in spam. Dat verifiëren gebeurt met
 * DNS-records (SPF, DKIM) bij de domeinregistrar — één keer, per domein.
 */
function afzender(): string | null {
  return process.env.MAIL_VAN || null;
}

export async function stuurMail(mail: Mail): Promise<Mailresultaat> {
  const sleutel = process.env.RESEND_API_KEY;
  const van = afzender();

  if (!sleutel || !van) {
    const reden = !sleutel ? "RESEND_API_KEY ontbreekt" : "MAIL_VAN ontbreekt";
    console.warn(`[MAIL] Niet verstuurd: ${reden}. Onderwerp: ${mail.onderwerp}`);
    return { verstuurd: false, reden };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${sleutel}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: van,
        to: Array.isArray(mail.aan) ? mail.aan : [mail.aan],
        subject: mail.onderwerp,
        text: mail.tekst,
        html: mail.html,
        ...(mail.antwoordAan ? { reply_to: mail.antwoordAan } : {}),
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[MAIL] Resend gaf ${res.status}: ${body}`);
      return { verstuurd: false, reden: `Resend ${res.status}` };
    }

    const data = (await res.json()) as { id?: string };
    return { verstuurd: true, id: data.id };
  } catch (e) {
    console.error("[MAIL] Verzenden mislukt", e);
    return { verstuurd: false, reden: "Netwerkfout" };
  }
}

/**
 * Korte melding naar een pushkanaal: Make, ntfy, Pushover, Slack, een
 * Telegram-bot — alles wat een POST met JSON accepteert.
 *
 * Waarom naast de mail: mail komt aan wanneer je hem opent, en een lead die je
 * binnen vijf minuten belt is een andere lead dan een lead die je 's avonds
 * terugbelt. Dat verschil is het hele verdienmodel, want de vergoeding hangt aan
 * een verkoop en niet aan een formulier.
 *
 * WhatsApp en sms lopen bewust NIET via een eigen koppeling hier. Die zitten in
 * Make als kant-en-klare module; er een tweede leverancier en een tweede geheim
 * bij halen levert niets op behalve onderhoud.
 */
export async function stuurPush(titel: string, bericht: string): Promise<boolean> {
  const url = process.env.PUSH_WEBHOOK_URL;
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      // Drie schrijfwijzen van hetzelfde, zodat de meeste diensten het zonder
      // vertaalstap begrijpen. Wat een dienst niet kent, negeert hij.
      body: JSON.stringify({ titel, bericht, title: titel, message: bericht, text: `${titel}\n${bericht}` }),
    });
    if (!res.ok) console.error(`[PUSH] ${res.status}`);
    return res.ok;
  } catch (e) {
    console.error("[PUSH] Mislukt", e);
    return false;
  }
}
