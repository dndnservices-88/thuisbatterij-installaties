/**
 * Belttijden voor de keuze "Zo snel mogelijk" (26 okt 2026).
 *
 * Uren 09:00–21:00 bevestigd door Dieudonné (26 okt 2026). Dagen maandag t/m
 * vrijdag zijn nog een aanname (weekend niet genoemd). Aanpassen = deze
 * constante; mail en tests volgen vanzelf.
 */
export const BELTIJDEN = { dagen: [1, 2, 3, 4, 5], vanUur: 9, totUur: 21 } as const;

/** Dag (0 = zondag) en uur in Nederlandse tijd. */
function nlTijd(d: Date): { dag: number; uur: number } {
  const delen = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Amsterdam",
    weekday: "short",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const wd = delen.find((p) => p.type === "weekday")?.value ?? "Mon";
  const uur = Number(delen.find((p) => p.type === "hour")?.value ?? 12);
  const dag = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(wd);
  return { dag, uur };
}

export function binnenBeltijden(d: Date): boolean {
  const { dag, uur } = nlTijd(d);
  return (BELTIJDEN.dagen as readonly number[]).includes(dag) && uur >= BELTIJDEN.vanUur && uur < BELTIJDEN.totUur;
}

/** Wat we de klant beloven bij "zo snel mogelijk", afhankelijk van het tijdstip van de aanvraag. */
export function zsmMoment(d: Date): string {
  return binnenBeltijden(d)
    ? "zo snel mogelijk"
    : `zo snel mogelijk: de eerstvolgende werkdag vanaf ${String(BELTIJDEN.vanUur).padStart(2, "0")}:00`;
}
