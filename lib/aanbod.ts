import { PRIJSLIJST_INCL } from "./calc";

/**
 * Aanbod per type (13 nov 2026, /aanbod). Bewust zonder merknamen (besluit P6,
 * 26 aug 2026; bevestigd door Dieudonné 13 nov): het type beschrijft wat de
 * bezoeker ziet en nodig heeft, het toestel zelf staat in de offerte van Limsolar.
 * De koppeling type → merk staat alleen hier, intern.
 */
export type AanbodType = {
  id: string;
  titel: string;
  fase: 1 | 3;
  backup: string;
  omschrijving: string;
  foto: string;
  regels: { capaciteit_kwh: number; prijs_eur: number }[];
};

const TYPES: (Omit<AanbodType, "regels"> & { merk: string; backupFilter?: string })[] = [
  { id: "compact-1fase", merk: "Marstek Venus E 3.0", titel: "Compacte thuisbatterij", fase: 1, backup: "Met noodstroomfunctie", omschrijving: "Vrijstaand toestel voor een 1-fase-aansluiting. Het instapmodel.", foto: "/beeld/aanbod-compact-1fase.webp" },
  { id: "modulair-1fase", merk: "Deye 1-fase", titel: "Modulaire wandbatterij", fase: 1, backup: "Volledige back-up", omschrijving: "Wandmodules voor een 1-fase-aansluiting, uit te breiden van 5 tot 20 kWh.", foto: "/beeld/aanbod-modulair-1fase.webp" },
  { id: "stapel-3fase", merk: "Dyness Stack 100 Pro", titel: "Stapelbare batterij", fase: 3, backup: "Volledige back-up", omschrijving: "Stapelbare modules voor een 3-fase-aansluiting, ook voor grote verbruikers.", foto: "/beeld/aanbod-stapel-3fase.webp" },
  { id: "toren-3fase", merk: "Pylontech Force H3X", titel: "Batterijtoren", fase: 3, backup: "Volledige back-up", omschrijving: "Slanke staande toren voor een 3-fase-aansluiting.", foto: "/beeld/aanbod-toren-3fase.webp" },
  { id: "wand-3fase", merk: "AlphaESS", backupFilter: "geen", titel: "Slank wandsysteem", fase: 3, backup: "Zonder back-up", omschrijving: "Plat systeem tegen de wand voor een 3-fase-aansluiting.", foto: "/beeld/aanbod-wand-3fase.webp" },
  { id: "wand-3fase-backup", merk: "AlphaESS", backupFilter: "volledig", titel: "Slank wandsysteem met back-up", fase: 3, backup: "Volledige back-up", omschrijving: "Hetzelfde wandsysteem, met back-up bij stroomuitval.", foto: "/beeld/aanbod-wand-3fase-groot.webp" },
];

export const AANBOD: AanbodType[] = TYPES.map(({ merk, backupFilter, ...t }) => ({
  ...t,
  regels: PRIJSLIJST_INCL.filter((r) => r.merk === merk && (!backupFilter || r.backup === backupFilter))
    .map((r) => ({ capaciteit_kwh: r.capaciteit_kwh, prijs_eur: r.prijs_eur }))
    .sort((a, b) => a.capaciteit_kwh - b.capaciteit_kwh),
}));
