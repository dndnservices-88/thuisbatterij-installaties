import { Onthul } from "./Onthul";

/**
 * "Waarom nu" in de nieuwe vormgeving. De tekst is letterlijk die van de
 * homepage; alleen de opmaak verschilt: grote kop in twee tonen, genummerde
 * blokken die na elkaar binnenkomen, en een tijdlijn met 1 januari 2027 als
 * vast punt.
 */
export default function WaaromNuOntwerp() {
  const blokken: [string, string][] = [
    [
      "Wat er nu gebeurt",
      "Wek je meer op dan je op dat moment verbruikt, dan gaat het overschot het net op en mag je dat wegstrepen tegen wat je later afneemt. Eén op één, tegen hetzelfde tarief.",
    ],
    [
      "Wat er verandert",
      "Vanaf 1 januari 2027 vervalt die wegstreepregeling. Voor teruggeleverde stroom krijg je dan nog een vergoeding van je leverancier, en die ligt fors lager dan wat je voor afgenomen stroom betaalt.",
    ],
    [
      "Wat dat betekent",
      "Zelf gebruiken wordt aantrekkelijker dan terugleveren. Daar zit de rekensom van een thuisbatterij: je verplaatst opwek van het midden van de dag naar de avond. Hoeveel dat bij jou oplevert, hangt af van je verbruik en je contract — en dat rekenen we bovenaan uit.",
    ],
  ];

  return (
    <section id="waarom" className="bg-n-000 px-s3 py-s5 sm:py-s6">
      <div className="mx-auto max-w-inhoud">
        <Onthul>
          <p className="mb-s3 inline-flex items-center gap-s2 text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-paars">
            <span className="inline-block h-2 w-2 rounded-full bg-paars" /> Waarom nu
          </p>
          <h2 className="max-w-[20ch]">
            Salderen verdwijnt per 1 januari 2027.{" "}
            <span className="kop-licht">Feiten, geen paniek.</span>
          </h2>
        </Onthul>

        {/* Tijdlijn */}
        <Onthul vertraging={120} className="mt-s5">
          <div className="relative h-[2px] w-full bg-n-200">
            <div className="absolute inset-y-0 left-0 w-[58%] bg-paars" />
            <div className="absolute left-[58%] top-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="puls block h-4 w-4 rounded-full border-[3px] border-n-000 bg-paars" />
            </div>
          </div>
          <div className="mt-s2 flex justify-between text-[0.8rem] text-n-500">
            <span>Nu: salderen</span>
            <span className="font-semibold text-paars">1 januari 2027</span>
            <span>Daarna: zelf gebruiken loont</span>
          </div>
        </Onthul>

        <div className="mt-s5 grid gap-s4 sm:grid-cols-3">
          {blokken.map(([titel, tekst], i) => (
            <Onthul key={titel} vertraging={200 + i * 140}>
              <div className="til h-full rounded-[16px] border border-n-200 bg-n-000 p-s4">
                <span className="font-kop text-[2.6rem] font-semibold leading-none tracking-[-0.04em] text-paars-tint [-webkit-text-stroke:1.5px_#7B4FAF]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-s3 text-[1.2rem]">{titel}</h3>
                <p className="mt-s2 text-[0.95rem] leading-relaxed text-n-500">{tekst}</p>
              </div>
            </Onthul>
          ))}
        </div>

        <Onthul vertraging={200}>
          <p className="mt-s4 max-w-lees text-[0.85rem] text-n-500">
            Sommige leveranciers brengen daarnaast terugleverkosten in rekening. Die verschillen per
            leverancier en per contract, en ze wegen zwaar in de uitkomst — daarom vragen we ernaar in
            plaats van er zelf iets voor in te vullen. Weet je het niet, dan rekenen we met nul, zodat
            de uitkomst niet mooier wordt dan hij is.
          </p>
        </Onthul>
      </div>
    </section>
  );
}
