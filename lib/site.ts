/**
 * Vaste site-gegevens die op één plek staan omdat ze nog moeten worden ingevuld
 * of omdat ze in tientallen componenten terugkomen.
 */

/**
 * Jouw kant van het co-brand: de partij die adviseert, rekent en belt.
 * Vastgelegd 1 september 2026 (besluitdocument punt 1). De eerdere waarschuwing
 * "zet hier niet Tjapz neer" is vervallen: er liep nooit een afsluitingstraject,
 * de BV wordt behouden.
 *
 * Twee namen, met opzet gescheiden:
 * - `naam` is de statutaire naam. Die identificeert de rechtspersoon en hoort
 *   overal waar de wet vraagt wie de verwerkingsverantwoordelijke of de afzender
 *   is. Wordt later DNDN Services B.V.; het KvK-nummer verandert daar niet door,
 *   en gegeven toestemmingen blijven geldig.
 * - `handelsnaam` is wat de klant ziet en wat in de advertenties staat. Die mag
 *   voorop, mits de statutaire naam plus KvK er in de kleine letters bij staat.
 *
 * Bij de naamswijziging hoeft hier dus één regel om. Niets anders.
 */
export const ENTITEIT = {
  naam: "Tjapz Alphen B.V.",
  handelsnaam: "Thuisbatterij-installaties",
  kvk: "90408616",
  /** Btw-identificatienummer. Aangeleverd door Dieudonné, 7 okt 2026. */
  btw: "NL865304567B01",
  /** Statutaire zetel (gemeente uit de akte). Aangeleverd 7 okt 2026. */
  zetel: "Alphen aan den Rijn",
  /** Alle handelsnamen van de BV, zoals Dieudonné ze opgaf (7 okt 2026). */
  handelsnamen: ["Thuisbatterij-installaties", "DNDN Services"],
  ingevuld: true,
};

/**
 * Korte vermelding voor footer en voorpagina (besluit Dieudonné 7 okt 2026: de
 * statutaire naam niet meer vooraan). De volledige gegevens staan op
 * /bedrijfsgegevens, gelinkt vanuit de footer op elke pagina — de ACM noemt
 * "via een link naar uw contactpagina" als geldige plek.
 */
export const ENTITEIT_KORT = `${ENTITEIT.handelsnaam} · KvK ${ENTITEIT.kvk}`;

/**
 * De volledige identificatie van de afzender, in één zin.
 * Gebruik deze overal waar het juridisch moet kloppen — footer, attributie,
 * bevestigingsmail — zodat merk en rechtspersoon nooit uit elkaar lopen.
 */
export const ENTITEIT_VOLUIT = `${ENTITEIT.handelsnaam}, handelsnaam van ${ENTITEIT.naam}, KvK ${ENTITEIT.kvk}`;

/**
 * Het domein, op één plek. Het staat onder het logo in de kopbalk en komt terug
 * in de advertenties: die twee moeten letterlijk gelijk zijn, anders valt de
 * herkenning tussen advertentie en landingspagina weg.
 */
export const DOMEIN = "thuisbatterij-installaties.nl";

/** Opdrachtgever en uitvoerder. Bevestigd, claimregister V6. */
export const LIMSOLAR = {
  naam: "Limsolar B.V.",
  kvk: "86584081",
  adres: "Jelle Zijlstraweg 62-A",
  postcode: "1689 ZX",
  plaats: "Zwaag",
};

/**
 * Het openbare Google-bedrijfsprofiel van Limsolar. Eén plek voor score, aantal
 * en peildatum: de claimtekst V3 en de scorekaart bij de reviews lezen allebei
 * hieruit, zodat ze nooit uit elkaar lopen.
 *
 * Gemeten op 6 oktober 2026 in de browser van Dieudonné (schermafbeelding in
 * 06 - Legal & Compliance/Bewijs/). Maandelijks opnieuw meten en dan alle drie
 * de velden bijwerken — een oude score met een oude datum is eerlijk, een oude
 * score met een nieuwe datum niet.
 */
export const GOOGLE_PROFIEL = {
  score: 4.8,
  aantal: 75,
  peildatum: "6 oktober 2026",
  url: "https://www.google.com/maps?cid=1677789105305039487",
};

/**
 * Contactpunt van de afzender.
 *
 * Dit is geen nette-om-te-hebben maar een verplichting op twee gronden tegelijk:
 * de AVG eist een adres waar iemand zijn rechten kan uitoefenen, en een
 * toestemming die je niet kunt intrekken is geen geldige toestemming.
 *
 * Het e-mailadres en het postadres horen bij JOUW entiteit, niet bij Limsolar:
 * jij bent de partij die de gegevens verzamelt en de toestemming vastlegt.
 *
 * Stand 1 september 2026: e-mailadres en postadres zijn echt. Het telefoonnummer
 * is een plaatshouder tot het CloudTalk-nummer er is (besluit 7 okt 2026; eerder Rinkel) — zie `telefoon_fictief`.
 */
export const CONTACT = {
  email: "info@thuisbatterij-installaties.nl",

  /**
   * ⚠️ PLAATSHOUDER. 0612345678 is niet van ons. Zolang `telefoon_fictief` op
   * true staat mag dit nummer nergens naar buiten: niet in een mail, niet in een
   * advertentie, niet in het belscript. Vervang het door het CloudTalk-nummer en
   * zet dan beide vlaggen om.
   */
  telefoon: "06 12 34 56 78",
  telefoon_fictief: true,

  /** Correspondentieadres voor privacyverzoeken. Los van het KvK-vestigingsadres. */
  adres: "Entrada 400",
  postcode: "1114 AA",
  plaats: "Duivendrecht",

  /**
   * Mag er een bevestigingsmail naar een echte klant? Alleen als álles echt is.
   * Blijft dus false zolang het telefoonnummer verzonnen is. `lib/berichten.ts`
   * dwingt dit af; niet omzeilen om "even te testen" — daar is de preview voor.
   */
  ingevuld: false,
};

/** Het correspondentieadres in één regel, voor de privacyverklaring en de voet. */
export const CONTACT_ADRES = `${CONTACT.adres}, ${CONTACT.postcode} ${CONTACT.plaats}`;

/**
 * De attributieregel. Verplicht in de footer en bij het formulier.
 * Dit is wat de uitvoeringsclaims bij de partij legt die ze waarmaakt.
 */
export const ATTRIBUTIE = `Advies en berekening door ${ENTITEIT_KORT}. Installatie en uitvoering door ${LIMSOLAR.naam}, KvK ${LIMSOLAR.kvk}, ${LIMSOLAR.adres}, ${LIMSOLAR.postcode} ${LIMSOLAR.plaats}.`;

/**
 * Consenttekst. Het hele belmodel rust op deze zin en op het bewijs dat hij is
 * aangevinkt — het telemarketingverbod voor de energiesector geldt sinds
 * 1 juli 2026 en de boetes lopen op tot € 900.000.
 *
 * Bij elke wijziging van de tekst: versienummer ophogen. De versie wordt per
 * lead opgeslagen zodat je later weet welke tekst iemand heeft gezien.
 *
 * ⚠️ Laat deze tekst vóór livegang nalezen door een jurist.
 *
 * v1.1 (1 september 2026) — v1.0 noemde alleen Limsolar, terwijl de kwalificerende
 * telefoontjes vanuit de eigen entiteit gaan. Toestemming voor partij A dekt geen
 * telefoontje van partij B: dat maakte v1.0 onbruikbaar zodra er echt gebeld werd.
 * Beide partijen staan er nu in, elk met de rol die zij werkelijk vervult. Dat
 * dient twee doelen tegelijk — de toestemming is geldig, én de klant leest zwart
 * op wit dat de installatie bij Limsolar ligt en niet bij ons.
 */
export const CONSENT = {
  versie: "1.1",
  tekst:
    "Ja, Thuisbatterij-installaties — handelsnaam van Tjapz Alphen B.V. — mag contact met mij opnemen, telefonisch en per e-mail, over mijn berekening en een vrijblijvend advies over een thuisbatterij, en mag mijn gegevens daarvoor doorgeven aan Limsolar B.V., dat de installatie uitvoert en mij daarover ook mag benaderen. Ik kan deze toestemming op elk moment intrekken. Zie de privacyverklaring.",
};

/** Disclaimer onder het rekenresultaat. Staat er direct onder, niet in de voettekst. */
export const REKEN_DISCLAIMER =
  "Deze indicatie is gebaseerd op landelijke gemiddelden en op de gegevens die je hebt ingevuld. Je werkelijke besparing hangt af van je verbruikspatroon over de dag, je contract en de gekozen systeemgrootte. Wij verbinden ons pas aan een uitkomst nadat we je eigen kwartierdata hebben ingelezen.";
