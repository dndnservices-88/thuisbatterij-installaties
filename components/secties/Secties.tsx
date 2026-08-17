import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { Sectie, Kop } from "@/components/ui/Sectie";
import { KnopLink } from "@/components/ui/Knop";
import { Claim, AlsClaim } from "@/components/ui/Claim";
import { isLive, mag } from "@/lib/claims";
import { ATTRIBUTIE, ENTITEIT, LIMSOLAR } from "@/lib/site";
import type { Variant } from "@/lib/varianten";

// Statische imports: Next kent daardoor de afmetingen, zet ze in de HTML en
// voorkomt dat de pagina verspringt terwijl het beeld laadt.
import fotoBatterij from "@/public/beeld/thuisbatterij-buitenmuur-1600.webp";
import fotoMeterkast from "@/public/beeld/meterkast-meting-1600.webp";
import fotoVerdeelkast from "@/public/beeld/verdeelkast-1600.webp";
import fotoMonteur from "@/public/beeld/monteur-portret-1600.webp";
import logoWit from "@/public/beeld/logo-wit.webp";

/**
 * Beeldregel, en die is niet vrijblijvend. Het zijn stockfoto's, dus:
 * geen bijschrift of alt-tekst die suggereert dat dit een eigen project is,
 * geen "onze monteur", geen herkenbaar merk van een fabrikant. Een foto is
 * juridisch net zo goed een mededeling als een zin (claimregister, blok V).
 */
const SFEERBEELD = "Sfeerbeeld, geen foto van een eigen project.";

/**
 * De elf secties uit het sectieplan (playbook fase 2), in die volgorde.
 *
 * Eén regel die de hele pagina bepaalt: **één actie per pagina.** Geen "bel ons",
 * geen brochure, geen nieuwsbrief ernaast. Elke knop hieronder wijst naar de
 * calculator. Elke extra keuze kost leads.
 */

/* 1 ── Hero ───────────────────────────────────────────────────────────────── */
export function Hero({ variant }: { variant: Variant }) {
  return (
    // Geen <header> meer: dat is nu de kopbalk met het logo, waar deze sectie
    // naadloos op aansluit doordat het paars doorloopt.
    <section className="bg-paars px-s3 pb-s6 pt-s5 text-n-000">
      <div className="mx-auto grid max-w-inhoud items-center gap-s5 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <h1 className="max-w-[18ch]">{variant.hero.kop}</h1>
          <p className="mt-s4 max-w-lees text-[1.05rem] leading-relaxed text-n-200">
            {variant.hero.sub}
          </p>
          <div className="mt-s5 max-w-[420px]">
            <KnopLink href="#calculator" volleBreedte>
              {variant.hero.knop}
            </KnopLink>
            <p className="mt-s2 text-[0.85rem] text-n-200">
              Vijf vragen, geen gegevens nodig voor de uitkomst.
            </p>
          </div>
        </div>

        {/* Op mobiel staat het beeld onder de knop: de actie blijft boven de vouw. */}
        <figure className="order-last">
          <Image
            src={fotoBatterij}
            alt="Een thuisbatterij tegen een buitenmuur, met de omvormer erboven"
            priority
            placeholder="blur"
            sizes="(min-width: 1024px) 46vw, 100vw"
            className="h-auto w-full rounded-merk"
          />
          <figcaption className="mt-s2 text-[0.78rem] text-n-200">
            {SFEERBEELD} Welk systeem bij jou past, bepalen we in het adviesgesprek.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/* 2 ── Vertrouwensbalk ────────────────────────────────────────────────────── */
export function Vertrouwensbalk() {
  return (
    <div className="border-b border-n-200 bg-n-100 px-s3 py-s3">
      <div className="mx-auto grid max-w-inhoud gap-s2 text-[0.88rem] text-n-500 sm:grid-cols-2 lg:grid-cols-4">
        <AlsClaim id="V1">
          <span>
            <Claim id="V1" />
          </span>
        </AlsClaim>
        <AlsClaim id="V2">
          <span>
            <Claim id="V2" />
          </span>
        </AlsClaim>
        <AlsClaim id="U4">
          <span>
            <Claim id="U4" />
          </span>
        </AlsClaim>
        <span>
          Installatie door {LIMSOLAR.naam}, KvK {LIMSOLAR.kvk}
        </span>
      </div>
    </div>
  );
}

/* 4 ── Waarom nu ──────────────────────────────────────────────────────────── */
export function WaaromNu() {
  return (
    <Sectie id="waarom" fond="wit">
      <Kop
        boven="Waarom nu"
        onder="Feiten, geen paniek. Wat er verandert en wat dat betekent voor wat je opwekt."
      >
        Salderen verdwijnt per 1 januari 2027
      </Kop>
      <div className="grid gap-s4 sm:grid-cols-3">
        <Blok titel="Wat er nu gebeurt">
          Wek je meer op dan je op dat moment verbruikt, dan gaat het overschot het net op en mag je
          dat wegstrepen tegen wat je later afneemt. Eén op één, tegen hetzelfde tarief.
        </Blok>
        <Blok titel="Wat er verandert">
          Vanaf 1 januari 2027 vervalt die wegstreepregeling. Voor teruggeleverde stroom krijg je
          dan nog een vergoeding van je leverancier, en die ligt fors lager dan wat je voor
          afgenomen stroom betaalt.
        </Blok>
        <Blok titel="Wat dat betekent">
          Zelf gebruiken wordt aantrekkelijker dan terugleveren. Daar zit de rekensom van een
          thuisbatterij: je verplaatst opwek van het midden van de dag naar de avond. Hoeveel dat
          bij jou oplevert, hangt af van je verbruik en je contract — en dat rekenen we hierboven
          uit.
        </Blok>
      </div>
      <p className="mt-s4 max-w-lees text-[0.85rem] text-n-500">
        Sommige leveranciers brengen daarnaast terugleverkosten in rekening. Die verschillen per
        leverancier en per contract; in de berekening rekenen we daar behoudend mee, zodat de
        uitkomst niet mooier wordt dan hij is.
      </p>
    </Sectie>
  );
}

/* 5 ── Hoe het werkt ──────────────────────────────────────────────────────── */
export function HoeHetWerkt() {
  const stappen: [string, string][] = [
    ["Je maakt de berekening", "Vijf vragen. Je ziet meteen een bandbreedte, zonder gegevens."],
    [
      "Wij bellen je op het gekozen dagdeel",
      "Een gesprek van een minuut of tien. We lopen je situatie na en zeggen het eerlijk als het niet uitkomt.",
    ],
    [
      "Adviesgesprek bij je thuis",
      "Alleen als het zinvol is. We kijken naar de meterkast, het verbruikspatroon en de plek voor de batterij.",
    ],
    [
      "Installatie door Limsolar",
      "Vaste prijs vooraf. Aanmelding bij de netbeheerder en de garantie worden geregeld.",
    ],
  ];

  return (
    <Sectie id="hoe" fond="grijs">
      <Kop boven="Hoe het werkt" onder="Vier stappen. Je weet vooraf wat er gebeurt en wanneer.">
        Van berekening tot installatie
      </Kop>
      <ol className="grid gap-s3 sm:grid-cols-2 lg:grid-cols-4">
        {stappen.map(([titel, tekst], i) => (
          <li key={titel} className="rounded-merk border border-n-200 bg-n-000 p-s3">
            <span className="font-kop text-[0.8rem] font-extrabold uppercase tracking-[0.14em] text-paars">
              Stap {i + 1}
            </span>
            <h3 className="mt-s1">{titel}</h3>
            <p className="mt-s2 text-[0.9rem] text-n-500">{tekst}</p>
          </li>
        ))}
      </ol>

      <div className="mt-s5 grid gap-s3 sm:grid-cols-2">
        <Beeld
          src={fotoMeterkast}
          alt="Monteur meet met een multimeter aan een groepenkast"
          bij="Aansluiting op de groepenkast"
        />
        <Beeld
          src={fotoVerdeelkast}
          alt="Monteur werkt in een elektrische verdeelkast"
          bij="Aanmelding bij de netbeheerder wordt geregeld"
        />
      </div>
      <p className="mt-s2 text-[0.78rem] text-n-500">{SFEERBEELD}</p>
    </Sectie>
  );
}

/** Foto met bijschrift. Vaste verhouding, zodat de pagina niet verspringt. */
function Beeld({ src, alt, bij }: { src: StaticImageData; alt: string; bij: string }) {
  return (
    <figure>
      <Image
        src={src}
        alt={alt}
        placeholder="blur"
        sizes="(min-width: 640px) 46vw, 100vw"
        className="h-auto w-full rounded-merk"
      />
      <figcaption className="mt-s2 text-[0.85rem] text-n-500">{bij}</figcaption>
    </figure>
  );
}

/* 6 ── Aanbod ─────────────────────────────────────────────────────────────── */
export function Aanbod() {
  return (
    <Sectie id="aanbod" fond="wit">
      <Kop
        boven="Het aanbod"
        onder="Eén instapsysteem met een vaste prijs, en daarnaast advies op maat wanneer jouw situatie daarom vraagt."
      >
        Wat het kost
      </Kop>
      <div className="grid gap-s3 lg:grid-cols-2">
        <div className="rounded-merk border border-paars bg-paars-tint p-s4">
          <h3 className="text-paars">Instapmodel</h3>
          <p className="mt-s2 font-kop text-[1.8rem] font-extrabold text-paars">
            <Claim id="P2" alsWeg="Prijs op aanvraag" />
          </p>
          <p className="mt-s2 text-[0.9rem] text-n-500">
            <Claim id="P6" alsWeg="Het instapsysteem uit ons assortiment" />. Inclusief installatie
            door {LIMSOLAR.naam}.
          </p>
          <ul className="mt-s3 space-y-s1 text-[0.9rem] text-n-500">
            {mag("U3") && (
              <li>
                <Claim id="U3" />
              </li>
            )}
            {mag("U4") && (
              <li>
                <Claim id="U4" />
              </li>
            )}
            {mag("U8") && (
              <li>
                <Claim id="U8" />
              </li>
            )}
          </ul>
        </div>
        <div className="rounded-merk border border-n-200 p-s4">
          <h3>Advies op maat</h3>
          <p className="mt-s2 text-[0.9rem] leading-relaxed text-n-500">
            Heb je een hoger verbruik, een warmtepomp, een elektrische auto of een dynamisch
            contract, dan is het instapsysteem niet automatisch de beste keuze. In het adviesgesprek
            lezen we je kwartierdata in en rekenen we door welke capaciteit bij jou past — ook als
            dat betekent dat we je een kleiner systeem adviseren.
          </p>
          <p className="mt-s3 text-[0.9rem] text-n-500">
            <Claim id="U10" alsWeg="Vraag ons naar de mogelijkheden rond de btw-teruggave." />
          </p>
        </div>
      </div>
    </Sectie>
  );
}

/* 7 ── USP's ──────────────────────────────────────────────────────────────── */
export function Usps() {
  const items = [
    { id: "P1" as const, titel: "Scherpe prijs" },
    { id: "U1" as const, titel: "Snel geïnstalleerd" },
    { id: "U10" as const, titel: "Btw-begeleiding" },
    { id: "V1" as const, titel: "Aangesloten en verzekerd" },
    { id: "U9" as const, titel: "Heel Nederland" },
    { id: "U12" as const, titel: "Vrijblijvend advies" },
  ];

  // Zolang geen enkele belofte is aangetoond, valt de hele sectie weg in plaats
  // van een kop met een leeg raster eronder.
  if (!items.some((i) => mag(i.id))) return null;

  return (
    <Sectie id="usp" fond="grijs">
      <Kop boven="Waarom via ons">Wat je van ons mag verwachten</Kop>
      <div className="grid gap-s3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((i) => (
          <AlsClaim key={i.id} id={i.id}>
            <div className="h-full rounded-merk border border-n-200 bg-n-000 p-s3">
              <h3>{i.titel}</h3>
              <p className="mt-s2 text-[0.9rem] text-n-500">
                <Claim id={i.id} />
              </p>
            </div>
          </AlsClaim>
        ))}
      </div>
      <p className="mt-s4 max-w-lees text-[0.85rem] text-n-500">
        Bewust geen superlatieven. Wat hier staat, staat er in de formulering die we kunnen
        aantonen — inclusief de nuance. Een belofte zonder nuance is geen belofte maar een risico.
      </p>
    </Sectie>
  );
}

/* 8 ── Reviews ────────────────────────────────────────────────────────────── */
export function Reviews() {
  // Bewust leeg tot er echte, verifieerbare reviews zijn. Verzonnen reviews staan
  // op de zwarte lijst van misleidende handelspraktijken (claimregister V5).
  if (!mag("V3")) return null;
  return (
    <Sectie id="reviews" fond="wit">
      <Kop boven="Ervaringen">
        <Claim id="V3" />
      </Kop>
    </Sectie>
  );
}

/* 9 ── FAQ ────────────────────────────────────────────────────────────────── */
export function Faq() {
  const vragen: [string, React.ReactNode][] = [
    [
      "Heb ik een thuisbatterij eigenlijk wel nodig?",
      "Niet iedereen. Bij een laag verbruik of weinig panelen komt hij er niet uit, en dan zeggen wij dat ook — de berekening hierboven geeft in dat geval geen formulier maar een advies om het niet te doen.",
    ],
    [
      "Waarom niet gewoon zelf een batterij online kopen?",
      "Dat kan. Je regelt dan zelf de aansluiting op de groepenkast, de aanmelding bij de netbeheerder en de garantieafhandeling als er iets stukgaat. Bij ons zit dat in de prijs en heb je één partij die verantwoordelijk is.",
    ],
    [
      "Hoe weet ik dat jullie betrouwbaar zijn?",
      <>
        De installatie wordt uitgevoerd door {LIMSOLAR.naam}, ingeschreven bij de Kamer van
        Koophandel onder nummer {LIMSOLAR.kvk}, gevestigd aan {LIMSOLAR.adres} in {LIMSOLAR.plaats}.{" "}
        {mag("V1") && <Claim id="V1" />}
      </>,
    ],
    [
      "Krijg ik de beste prijs?",
      <>
        {mag("P1") ? (
          <Claim id="P1" />
        ) : (
          "Wij zijn scherp geprijsd, maar we beloven niet dat we altijd de goedkoopste zijn. Vind je elders een lagere prijs voor een vergelijkbare complete installatie, leg hem dan naast de onze."
        )}{" "}
        De laagste prijs is bovendien zelden de goedkoopste: een systeem dat te groot is voor je
        verbruik, verdient zich nooit terug.
      </>,
    ],
    [
      "Wat gebeurt er met mijn gegevens?",
      <>
        We bewaren wat je invult, samen met de uitkomst van je berekening, om je te kunnen bellen en
        adviseren. We bellen je alleen als je daar toestemming voor hebt gegeven, en je kunt die
        toestemming op elk moment intrekken.{" "}
        <Link href="/privacyverklaring" className="font-semibold text-paars underline">
          Lees de privacyverklaring
        </Link>
        .
      </>,
    ],
    [
      "Wat als de batterij bij mij niet uitkomt?",
      "Dan hoor je dat van ons, aan de telefoon of aan de keukentafel. Wij worden betaald wanneer een installatie doorgaat, en juist daarom heeft het voor ons geen zin om iemand iets te verkopen dat zich niet terugverdient.",
    ],
  ];

  return (
    <Sectie id="faq" fond="wit" smal>
      <Kop boven="Veelgestelde vragen">Wat mensen ons meestal vragen</Kop>
      <div className="divide-y divide-n-200 border-y border-n-200">
        {vragen.map(([v, a]) => (
          <details key={v} className="group py-s3">
            <summary className="cursor-pointer list-none font-kop text-[1.05rem] font-semibold marker:content-none">
              <span className="mr-s2 text-paars group-open:hidden">+</span>
              <span className="mr-s2 hidden text-paars group-open:inline">−</span>
              {v}
            </summary>
            <p className="mt-s2 pl-s4 text-[0.95rem] leading-relaxed text-n-500">{a}</p>
          </details>
        ))}
      </div>
    </Sectie>
  );
}

/* 10 ── Slot-CTA ──────────────────────────────────────────────────────────── */
export function SlotCta({ variant }: { variant: Variant }) {
  return (
    <Sectie fond="paars">
      <div className="grid items-center gap-s5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="max-w-lees">
          <h2>Reken het eerst uit</h2>
          <p className="mt-s3 text-[1.02rem] leading-relaxed text-n-200">
            Vijf vragen, twee minuten. Je krijgt een eerlijke bandbreedte te zien — en als een
            thuisbatterij bij jou niet uitkomt, staat dat er gewoon.
          </p>
          <div className="mt-s4 max-w-[420px]">
            <KnopLink href="#calculator" volleBreedte>
              {variant.hero.knop}
            </KnopLink>
          </div>
        </div>
        <figure className="order-last">
          <Image
            src={fotoMonteur}
            alt="Installateur in werkkleding met een veiligheidshelm"
            placeholder="blur"
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="h-auto w-full rounded-merk"
          />
          <figcaption className="mt-s2 text-[0.78rem] text-n-200">{SFEERBEELD}</figcaption>
        </figure>
      </div>
    </Sectie>
  );
}

/* 11 ── Footer ────────────────────────────────────────────────────────────── */
export function Footer() {
  return (
    <footer className="bg-paars-donker px-s3 py-s5 text-n-200">
      <div className="mx-auto max-w-inhoud text-[0.85rem] leading-relaxed">
        <Image
          src={logoWit}
          alt="Thuisbatterij Installaties"
          sizes="220px"
          className="mb-s4 h-[22px] w-auto"
        />
        {/* De uitvoerder staat er altijd bij, ook als de eigen entiteit nog niet
            gekozen is. Wat een bezoeker minimaal moet kunnen zien is wie de
            installatie doet en waar die partij ingeschreven staat. */}
        <p className="max-w-lees">
          {ENTITEIT.ingevuld ? (
            ATTRIBUTIE
          ) : (
            <>
              {!isLive && (
                <>
                  <span className="placeholder">
                    Advies en berekening door [ENTITEIT]
                    <span className="placeholder-label">entiteitskeuze</span>
                  </span>
                  .{" "}
                </>
              )}
              Installatie en uitvoering door {LIMSOLAR.naam}, KvK {LIMSOLAR.kvk}, {LIMSOLAR.adres},{" "}
              {LIMSOLAR.postcode} {LIMSOLAR.plaats}.
            </>
          )}
        </p>
        <nav className="mt-s3 flex flex-wrap gap-x-s4 gap-y-s1">
          <Link href="/privacyverklaring" className="underline">
            Privacyverklaring
          </Link>
          {!isLive && (
            <span className="placeholder">
              Algemene voorwaarden
              <span className="placeholder-label">nog aanleveren</span>
            </span>
          )}
        </nav>
        <p className="mt-s3 text-n-500">
          Bedragen op deze pagina zijn indicatief en gebaseerd op landelijke gemiddelden. Aan de
          uitkomst van de berekening kunnen geen rechten worden ontleend.
        </p>
      </div>
    </footer>
  );
}

function Blok({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-s2">{titel}</h3>
      <p className="text-[0.95rem] leading-relaxed text-n-500">{children}</p>
    </div>
  );
}
