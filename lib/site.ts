/**
 * Vaste site-gegevens die op één plek staan omdat ze nog moeten worden ingevuld
 * of omdat ze in tientallen componenten terugkomen.
 */

/**
 * ⚠️ NOG IN TE VULLEN — beslisdocument punt 1 en de entiteitskeuze.
 * Dit is jouw kant van het co-brand: de partij die adviseert en rekent.
 * Zet hier NIET Tjapz Alphen B.V. neer zolang die in afsluiting is.
 * Eén plek wijzigen is genoeg; alle teksten lezen deze constante.
 */
export const ENTITEIT = {
  naam: "[ENTITEIT]",
  kvk: "[KVK]",
  ingevuld: false,
};

/** Opdrachtgever en uitvoerder. Bevestigd, claimregister V6. */
export const LIMSOLAR = {
  naam: "Limsolar B.V.",
  kvk: "86584081",
  adres: "Jelle Zijlstraweg 62-A",
  postcode: "1689 ZX",
  plaats: "Zwaag",
};

/**
 * De attributieregel. Verplicht in de footer en bij het formulier.
 * Dit is wat de uitvoeringsclaims bij de partij legt die ze waarmaakt.
 */
export const ATTRIBUTIE = `Advies en berekening door ${ENTITEIT.naam}. Installatie en uitvoering door ${LIMSOLAR.naam}, KvK ${LIMSOLAR.kvk}, ${LIMSOLAR.adres}, ${LIMSOLAR.postcode} ${LIMSOLAR.plaats}.`;

/**
 * Consenttekst. Het hele belmodel rust op deze zin en op het bewijs dat hij is
 * aangevinkt — het telemarketingverbod voor de energiesector geldt sinds
 * 1 juli 2026 en de boetes lopen op tot € 900.000.
 *
 * Bij elke wijziging van de tekst: versienummer ophogen. De versie wordt per
 * lead opgeslagen zodat je later weet welke tekst iemand heeft gezien.
 *
 * ⚠️ Laat deze tekst vóór livegang nalezen door een jurist, en vul beide
 * partijen in zodra de entiteitskeuze rond is (specificatie 9, punt 4 en 5).
 */
export const CONSENT = {
  versie: "1.0",
  tekst:
    "Ja, Limsolar B.V. mag contact met mij opnemen — telefonisch en per e-mail — over mijn berekening en een vrijblijvend advies over een thuisbatterij. Ik kan deze toestemming op elk moment intrekken. Zie de privacyverklaring.",
};

/** Disclaimer onder het rekenresultaat. Staat er direct onder, niet in de voettekst. */
export const REKEN_DISCLAIMER =
  "Deze indicatie is gebaseerd op landelijke gemiddelden en op de gegevens die je hebt ingevuld. Je werkelijke besparing hangt af van je verbruikspatroon over de dag, je contract en de gekozen systeemgrootte. Wij verbinden ons pas aan een uitkomst nadat we je eigen kwartierdata hebben ingelezen.";
