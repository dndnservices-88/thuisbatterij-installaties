import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/**
 * Knoppen.
 *
 * Specificatie sectie 7: alleen de doorgaan-knop is geel met zwarte tekst.
 * Geen tweede geel element in beeld, anders verliest de knop zijn functie.
 * Geel op wit haalt 1,18:1 en is als tekstkleur onbruikbaar; zwart op geel
 * haalt 17,8:1 en mag dus wél.
 */

type Soort = "primair" | "secundair" | "zacht";

const basis =
  "inline-flex min-h-[52px] items-center justify-center gap-2 rounded-merk px-s4 py-s2 font-kop text-[1rem] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40";

const soorten: Record<Soort, string> = {
  // De enige gele elementen op de pagina.
  primair: "bg-geel text-n-900 hover:bg-geel-donker",
  secundair: "bg-paars text-n-000 hover:bg-paars-donker",
  // Voor de "toch even laten meekijken"-route: bewust ondergeschikt.
  zacht: "border border-n-200 bg-n-000 text-paars hover:border-paars",
};

export function Knop({
  soort = "primair",
  volleBreedte = true,
  children,
  className = "",
  ...rest
}: {
  soort?: Soort;
  volleBreedte?: boolean;
  children: ReactNode;
} & ComponentProps<"button">) {
  return (
    <button
      className={`${basis} ${soorten[soort]} ${volleBreedte ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function KnopLink({
  soort = "primair",
  volleBreedte = false,
  href,
  children,
  className = "",
}: {
  soort?: Soort;
  volleBreedte?: boolean;
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`${basis} ${soorten[soort]} ${volleBreedte ? "w-full" : ""} ${className}`}
    >
      {children}
    </Link>
  );
}
