import type { ReactNode } from "react";

/**
 * Eén sectiewikkel voor de hele pagina, zodat het verticale ritme overal gelijk
 * is en de wit/paars-verhouding uit het brandbook (ongeveer 55/33) klopt.
 */
export function Sectie({
  id,
  fond = "wit",
  smal = false,
  children,
}: {
  id?: string;
  fond?: "wit" | "grijs" | "paars" | "tint";
  smal?: boolean;
  children: ReactNode;
}) {
  const fondsen = {
    wit: "bg-n-000 text-n-900",
    grijs: "bg-n-100 text-n-900",
    tint: "bg-paars-tint text-n-900",
    paars: "bg-paars text-n-000",
  } as const;

  return (
    <section id={id} className={`${fondsen[fond]} px-s3 py-s5 sm:py-s6`}>
      <div className={`mx-auto ${smal ? "max-w-lees" : "max-w-inhoud"}`}>{children}</div>
    </section>
  );
}

export function Kop({
  boven,
  children,
  onder,
  licht = false,
}: {
  boven?: string;
  children: ReactNode;
  onder?: ReactNode;
  licht?: boolean;
}) {
  return (
    <header className="mb-s4 max-w-lees">
      {boven && (
        <p
          className={`mb-s2 text-[0.8rem] font-semibold uppercase tracking-[0.14em] ${
            licht ? "text-geel" : "text-paars"
          }`}
        >
          {boven}
        </p>
      )}
      <h2>{children}</h2>
      {onder && <p className={`mt-s3 ${licht ? "text-n-200" : "text-n-500"}`}>{onder}</p>}
    </header>
  );
}
