import type { ComponentProps, ReactNode } from "react";

/**
 * Formuliervelden. Elk veld een echt <label>, getalvelden met inputmode="numeric"
 * zodat mobiel het cijfertoetsenbord opent (specificatie sectie 7).
 */

export function Veld({
  label,
  hint,
  fout,
  id,
  ...rest
}: { label: string; hint?: string; fout?: string } & ComponentProps<"input">) {
  return (
    <div className="flex flex-col gap-s1">
      <label htmlFor={id} className="font-kop text-[0.9rem] font-semibold text-n-900">
        {label}
      </label>
      {hint && <span className="text-[0.85rem] text-n-500">{hint}</span>}
      <input
        id={id}
        aria-invalid={Boolean(fout)}
        aria-describedby={fout ? `${id}-fout` : undefined}
        className={`min-h-[52px] rounded-merk border bg-n-000 px-s3 text-[1rem] outline-none ${
          fout ? "border-red-700" : "border-n-200 focus:border-paars"
        }`}
        {...rest}
      />
      {fout && (
        <span id={`${id}-fout`} role="alert" className="text-[0.85rem] font-semibold text-red-700">
          {fout}
        </span>
      )}
    </div>
  );
}

export function GetalVeld(props: ComponentProps<typeof Veld>) {
  return <Veld type="text" inputMode="numeric" pattern="[0-9]*" autoComplete="off" {...props} />;
}

/**
 * Keuzekaart. Bij keuzeknoppen springen we automatisch door naar de volgende
 * vraag; bij getalinvoer bewust niet (specificatie sectie 7).
 */
export function Keuzekaart({
  gekozen,
  children,
  ...rest
}: { gekozen?: boolean; children: ReactNode } & ComponentProps<"button">) {
  return (
    <button
      type="button"
      aria-pressed={gekozen}
      className={`min-h-[56px] w-full rounded-merk border px-s3 py-s2 text-left font-kop text-[1rem] font-semibold transition ${
        gekozen
          ? "border-paars bg-paars-tint text-paars"
          : "border-n-200 bg-n-000 text-n-900 hover:border-paars"
      }`}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Voortgangsbalk. Paars, per specificatie sectie 7. */
export function Voortgang({ stap, van }: { stap: number; van: number }) {
  const pct = Math.round((stap / van) * 100);
  return (
    <div>
      <div className="mb-s1 flex justify-between text-[0.8rem] font-semibold uppercase tracking-wide text-n-500">
        <span>
          Vraag {stap} van {van}
        </span>
        <span>{pct}%</span>
      </div>
      <div
        className="h-[6px] w-full overflow-hidden rounded-full bg-n-200"
        role="progressbar"
        aria-valuenow={stap}
        aria-valuemin={1}
        aria-valuemax={van}
        aria-label="Voortgang berekening"
      >
        <div className="h-full rounded-full bg-paars transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
