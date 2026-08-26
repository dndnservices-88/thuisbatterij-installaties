import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { Sectie, Kop } from "@/components/ui/Sectie";
import { KnopLink } from "@/components/ui/Knop";
import { Claim, AlsClaim } from "@/components/ui/Claim";
import Cookievoorkeuren from "@/components/ui/Cookievoorkeuren";
import Keurmerken from "@/components/Keurmerken";
import { isLive, mag } from "@/lib/claims";
import { ATTRIBUTIE, ENTITEIT, LIMSOLAR } from "@/lib/site";
import type { Variant } from "@/lib/varianten";

// Statische imports: Next kent daardoor de afmetingen, zet ze in de HTML en
// voorkomt dat de pagina verspringt terwijl het beeld laadt.
import fotoBatterij from "@/public/beeld/thuisbatterij-buitenmuur-1600.webp";
// Aangeleverd door de ontwerper: 1400×1900 met echte transparantie, zonder
// tekst en zonder slagschaduw. Hier bijgesneden op de figuur (er zat 285 pixels
// leegte boven het hoofd) en daarna afgesneden op de gereedschapsgordel, want
// voluit bepaalde hij in zijn eentje de hoogte van het paarse vlak. Wat telt
// blijft staan: gezicht, helm, duim en het logo op de borst. Resultaat
// 1160×1298, 99 kB.
//
// Twee dingen bewust zo:
// — Doorzichtig en niet met het paars ingevuld. Webp met verlies verschuift een
//   egaal vlak met een punt of twee, en dat zie je op een groot vlak nét als een
//   blok. Met alpha kan er geen naad ontstaan, want de sectie schijnt er zelf
//   doorheen. Dat blijft ook zo als het paars ooit wijzigt.
// — Geen tekst in het beeld. De slogan staat links als echte tekst: die wisselt
//   mee per campagne (variant.hero.kop), blijft leesbaar op een telefoon en is
//   vindbaar voor Google. Tekst in een plaatje kan geen van drieën.
import fotoMonteurHero from "@/public/beeld/monteur-hero.webp";
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
    // Geen <header> meer: dat is de witte kopbalk met het logo. Deze sectie zet
    // daar het paarse vlak tegenaan, zodat er een harde scheiding ontstaat
    // tussen afzender en aanbod.
    // Weinig lucht boven de kop (s3 in plaats van s5): de witte kopbalk erboven
    // heeft zijn eigen ruimte al, en die twee bij elkaar duwden de kop en de
    // knop onnodig ver naar beneden. Onderin is de ruimte juist kleiner geworden
    // omdat de keurmerkenstrip die plek nu vult.
    <section className="bg-paars px-s3 pb-s4 pt-s3 text-n-000">
      {/* items-start, niet items-center en ook niet items-end. De tekstkolom is
          305 pixels hoog en de beeldkolom 454; met centreren wordt dat verschil
          gelijk verdeeld en staat er 75 pixels lucht bóven de H1, met
          items-end zelfs 149. Beide duwen de kop naar beneden zonder dat er
          iets in die ruimte staat. Bovenaan uitlijnen zet de kop direct onder
          de kopbalk; het verschil valt nu onder de knop, waar het als aanloop
          naar de keurmerkenstrip leest.

          Let op: dít maakt het blok niet korter — de hoogte wordt bepaald door
          de langste kolom, en dat is het beeld. Korter wordt het alleen door
          het beeld kleiner te tonen, zie hieronder. */}
      <div className="mx-auto grid max-w-inhoud items-start gap-s4 lg:grid-cols-[1.05fr_0.95fr]">
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

        {/* Op mobiel staat het beeld onder de knop: de actie blijft boven de vouw.
            self-end zodat de monteur op de onderrand van de rij staat als de
            tekstkolom ooit de langste wordt — bij een langere kop in een andere
            campagnevariant gebeurt dat vanzelf. */}
        <figure className="order-last self-end">
          {/* Geen afgeronde hoeken en geen kader: de achtergrond is doorzichtig,
              dus elke rand zou juist zichtbaar maken waar het beeld ophoudt.
              380 en niet 460: het beeld is de langste kolom en bepaalt daarmee
              in zijn eentje de hoogte van het paarse vlak. Elke pixel die het
              hier korter wordt, is een pixel die de calculator omhoog schuift —
              en dat is het hele doel. 460 gaf een blok van 739 pixels op een
              scherm van 729, dus er paste niets meer onder; 380 brengt het op
              612 in de preview en 574 live. Het bronbestand is 1160 breed, dus
              op 380 blijft er ook op een scherm met dubbele puntdichtheid ruim
              marge over. */}
          <Image
            src={fotoMonteurHero}
            alt="Een installateur met helm en gereedschapsgordel steekt zijn duim op"
            priority
            placeholder="blur"
            sizes="(min-width: 1024px) 380px, 260px"
            className="mx-auto h-auto w-full max-w-[260px] lg:max-w-[380px]"
          />
          <figcaption className="mt-s2 text-center text-[0.78rem] text-n-200">
            {SFEERBEELD}
          </figcaption>
        </figure>
      </div>

      {/* Buiten het raster van twee kolommen, zodat de strip de volle breedte
          van het paarse vlak pakt. Binnen de sectie en niet erna, want zodra hij
          op een eigen witte balk staat is het weer een blok dat de hero omlaag
          duwt — precies wat we hier weghalen. */}
      <div className="mx-auto max-w-inhoud">
        <Keurmerken />
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

      {/* De batterijfoto stond eerst in de hero. Hier doet hij meer werk: naast
          de prijs zie je waar je die prijs voor betaalt. */}
      <figure className="mb-s4">
        <Image
          src={fotoBatterij}
          alt="Een thuisbatterij tegen een buitenmuur, met de omvormer erboven"
          placeholder="blur"
          sizes="(min-width: 1024px) 1100px, 100vw"
          className="h-auto w-full rounded-merk"
        />
        <figcaption className="mt-s2 text-[0.78rem] text-n-500">
          {SFEERBEELD} Welk systeem bij jou past, bepalen we in het adviesgesprek.
        </figcaption>
      </figure>

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

type Review = {
  /** Initiaal + plaats. Bewust geen volledige naam: dat is een persoonsgegeven
   *  dat je niet nodig hebt om geloofwaardig te zijn (AVG, minimalisatie). */
  naam: string;
  maand: string;
  score: 1 | 2 | 3 | 4 | 5;
  tekst: string;
};

/**
 * Echte reviews. Leeg, en dat blijft zo tot er een verifieerbare bron is —
 * bij voorkeur het Google-bedrijfsprofiel van Limsolar, zodat de bezoeker ze
 * kan nakijken. Vullen gaat samen met claimregister V4 op "bevestigd".
 */
const REVIEWS: Review[] = [];

/**
 * Voorbeeldreviews. Uitsluitend om de vormgeving te beoordelen.
 *
 * Deze array is hard afgesloten van de live-modus: niet via het claimregister
 * (dat kun je per ongeluk op "bevestigd" zetten) maar via isLive, zodat geen
 * enkele instelling ze naar buiten kan brengen. Verzonnen reviews staan op de
 * zwarte lijst van bijlage I bij de richtlijn oneerlijke handelspraktijken —
 * misleiding per definitie, zonder verdere belangenafweging. Precies hier ging
 * de vorige versie van deze site de fout in (claimregister V5).
 */
const VOORBEELDREVIEWS: Review[] = [
  {
    naam: "S. uit Hoorn",
    maand: "juni 2026",
    score: 5,
    tekst:
      "Vooraf een eerlijk verhaal gekregen over wat een batterij bij ons wel en niet oplevert. De monteur was op tijd, heeft alles netjes weggewerkt en na afloop uitgelegd hoe ik het systeem uitlees.",
  },
  {
    naam: "M. uit Alkmaar",
    maand: "mei 2026",
    score: 5,
    tekst:
      "Ik twijfelde tussen twee capaciteiten. Ze hebben mijn verbruik doorgerekend en kwamen uit op het kleinere systeem. Dat scheelde me een paar duizend euro — dat had ik niet verwacht.",
  },
  {
    naam: "R. uit Purmerend",
    maand: "mei 2026",
    score: 4,
    tekst:
      "Installatie liep een week uit door levering, daar was ik niet blij mee. Verder prima geregeld: aanmelding bij de netbeheerder gedaan en de facturering klopte tot op de cent.",
  },
];

/** Sterrenrij. */
function Sterren({ score }: { score: number }) {
  // Geel is per brandbook nooit tekstkleur (1,18:1 op wit). Sterren dragen
  // informatie, dus ze moeten leesbaar zijn: paars gevuld, grijs leeg. De score
  // staat ook als tekst in de aria-label, want kleurverschil alleen is geen
  // toegankelijke manier om een waarde over te brengen.
  return (
    <p className="text-[1.05rem] leading-none text-paars" aria-label={`${score} van de 5 sterren`}>
      <span aria-hidden="true">
        {"\u2605".repeat(score)}
        <span className="text-n-200">{"\u2605".repeat(5 - score)}</span>
      </span>
    </p>
  );
}

function ReviewKaart({ review, voorbeeld }: { review: Review; voorbeeld: boolean }) {
  return (
    <figure
      className={`flex h-full flex-col rounded-merk bg-n-000 p-s4 ${
        voorbeeld ? "border-2 border-[#A08A00]" : "border border-n-200"
      }`}
    >
      {voorbeeld && (
        <span className="placeholder-label mb-s3 ml-0 self-start">Voorbeeld · V5</span>
      )}
      <Sterren score={review.score} />
      <blockquote className="mt-s3 grow text-[0.95rem] leading-relaxed">
        {review.tekst}
      </blockquote>
      <figcaption className="mt-s3 text-[0.85rem] text-n-500">
        {review.naam} · {review.maand}
      </figcaption>
    </figure>
  );
}

export function Reviews() {
  const echt = REVIEWS.length > 0 && mag("V4");
  const reviews = echt ? REVIEWS : isLive ? [] : VOORBEELDREVIEWS;

  // Live zonder echte reviews: de hele sectie verdwijnt, inclusief kop. Een lege
  // reviewsectie is erger dan geen reviewsectie.
  if (reviews.length === 0 && !mag("V3")) return null;

  return (
    <Sectie id="reviews" fond="tint">
      <Kop
        boven="Ervaringen"
        onder={
          <>
            De installatie wordt uitgevoerd door {LIMSOLAR.naam}. Deze beoordelingen gaan dus over{" "}
            {LIMSOLAR.naam} en niet over de berekening op deze pagina — dat is een bewuste keuze,
            want je hoort te weten wie er straks bij je thuis staat.
          </>
        }
      >
        Wat klanten over de installateur zeggen
      </Kop>

      {!echt && !isLive && (
        <p className="mb-s4 rounded-merk border-2 border-[#A08A00] bg-[#FFF9C4] p-s3 text-[0.9rem]">
          <strong>Voorbeeld, geen echte reviews.</strong> Ze staan er alleen om de vormgeving te
          beoordelen en kunnen niet live: zodra <code>NEXT_PUBLIC_LIVE</code> op <code>true</code>{" "}
          staat, verdwijnt de hele reviewsectie van de pagina. Vervang ze door echte beoordelingen
          met bron — dan gaat V4 in het claimregister naar &quot;bevestigd&quot;.
        </p>
      )}

      {mag("V3") && (
        <p className="mb-s4 text-[0.95rem] font-semibold">
          <Claim id="V3" />
        </p>
      )}

      <div className="grid gap-s3 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r) => (
          <ReviewKaart key={r.naam} review={r} voorbeeld={!echt} />
        ))}
      </div>

      <p className="mt-s4 max-w-lees text-[0.85rem] text-n-500">
        <Claim
          id="V4"
          alsWeg="Zodra hier echte beoordelingen staan, vermelden we erbij waar ze vandaan komen en hoe we controleren dat ze van echte klanten zijn. Dat is sinds 2022 verplicht — en zonder die bron heeft een review geen enkele waarde."
        />
      </p>
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
          <Cookievoorkeuren />
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
