import { redirect } from "next/navigation";

/**
 * Was het ontwerpvoorbeeld (30 sep 2026). Op 6 okt 2026 is die vormgeving de
 * homepage geworden; deze route stuurt nu door, zodat een gedeelde link blijft
 * werken.
 */
export default function Ontwerp() {
  redirect("/");
}
