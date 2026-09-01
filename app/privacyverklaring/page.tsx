import Link from "next/link";
import type { Metadata } from "next";
import { Sectie } from "@/components/ui/Sectie";
import { Footer } from "@/components/secties/Secties";
import { CONSENT, CONTACT, CONTACT_ADRES, ENTITEIT, ENTITEIT_VOLUIT, LIMSOLAR } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacyverklaring — Thuisbatterij Installaties",
  robots: { index: false, follow: true },
};

/**
 * ⚠️ CONCEPT. Deze tekst beschrijft wat de site feitelijk doet en is daarmee een
 * bruikbaar vertrekpunt, maar hij is niet juridisch getoetst. Laat hem vóór
 * livegang nalezen, samen met de consenttekst. Twee dingen die pas ingevuld
 * kunnen worden na de entiteitskeuze: wie de verwerkingsverantwoordelijke is en
 * naar welk adres een verzoek tot inzage of verwijdering gaat.
 */
export default function Privacy() {
  return (
    <main>
      <Sectie fond="wit" smal>
        <Link href="/" className="text-[0.9rem] font-semibold text-paars underline">
          ← Terug naar de berekening
        </Link>
        <h1 className="mt-s3">Privacyverklaring</h1>
        <p className="mt-s2 text-[0.85rem] text-n-500">
          Versie {CONSENT.versie} · concept, nog juridisch te toetsen vóór livegang
        </p>

        <div className="mt-s5 space-y-s4 text-[0.95rem] leading-relaxed text-n-500">
          <Blok titel="Wie verwerkt je gegevens">
            <p>
              De berekening en het eerste contact worden verzorgd door{" "}
              {ENTITEIT.ingevuld ? (
                ENTITEIT_VOLUIT
              ) : (
                <span className="placeholder">
                  [ENTITEIT]<span className="placeholder-label">nog invullen</span>
                </span>
              )}
              . De installatie en de uitvoering daarvan liggen bij {LIMSOLAR.naam}, KvK{" "}
              {LIMSOLAR.kvk}, {LIMSOLAR.adres}, {LIMSOLAR.postcode} {LIMSOLAR.plaats}. Beide partijen
              bepalen zelf hoe zij jouw gegevens gebruiken en zijn daar ieder voor hun eigen deel
              verantwoordelijk voor.
            </p>
          </Blok>

          <Blok titel="Welke gegevens en waarom">
            <p>
              Van de berekening bewaren we je antwoorden en de uitkomst die je op het scherm zag.
              Dat doen we zodat de adviseur vóór het telefoongesprek weet waar het over gaat, en
              zodat we later kunnen nagaan waarop een advies gebaseerd was.
            </p>
            <p>
              Als je een advies aanvraagt, bewaren we daarnaast je naam, telefoonnummer,
              e-mailadres, postcode en huisnummer, en het dagdeel waarop je gebeld wilt worden. Meer
              vragen we niet.
            </p>
            <p>
              We leggen ook vast wanneer je toestemming hebt gegeven, welke tekst daarbij stond, en
              vanaf welk IP-adres en met welke browser dat gebeurde. Dat is geen nieuwsgierigheid:
              zonder dat bewijs kunnen we niet aantonen dat we je mochten bellen.
            </p>
          </Blok>

          <Blok titel="Waarop we ons baseren">
            <p>
              Voor het telefonisch en per e-mail benaderen over je berekening baseren we ons op jouw
              toestemming. Die tekst luidt: “{CONSENT.tekst}”
            </p>
            <p>
              Je kunt die toestemming op elk moment intrekken. Vanaf dat moment bellen we je niet
              meer. Wat we vóór dat moment hebben gedaan, blijft rechtmatig.
            </p>
          </Blok>

          <Blok titel="Cookies en meten">
            <p>
              Noodzakelijke cookies zorgen dat de site werkt en dat we weten via welke advertentie
              je binnenkwam. Die laatste gebruiken we voor onze eigen administratie, niet om je over
              andere websites te volgen.
            </p>
            <p>
              Pas als je in de cookiebanner op accepteren klikt, laden we de meetscripts van Google
              en Meta. Weiger je, dan blijven die uit. We sturen in dat geval geen
              persoonsgegevens door.
            </p>
            <p>
              Sturen we een gebeurtenis door naar Meta, dan zijn je e-mailadres en telefoonnummer
              versleuteld met een onomkeerbare hashfunctie. Meta ontvangt die gegevens dus niet
              leesbaar.
            </p>
          </Blok>

          <Blok titel="Hoe lang we bewaren">
            <p>
              Leadgegevens bewaren we zolang je een klant of potentiële klant bent, en daarna nog
              maximaal twee jaar. Het toestemmingslogboek bewaren we langer, omdat we daarmee
              moeten kunnen aantonen dat contact opnemen was toegestaan.
            </p>
          </Blok>

          <Blok titel="Je rechten">
            <p>
              Je mag opvragen welke gegevens we van je hebben, ze laten corrigeren of laten
              verwijderen, en bezwaar maken tegen het gebruik ervan. Stuur daarvoor een bericht naar{" "}
              <a href={`mailto:${CONTACT.email}`} className="text-paars underline">
                {CONTACT.email}
              </a>
              , of schrijf ons op {CONTACT_ADRES}. Kom je er met ons niet uit, dan kun je een klacht
              indienen bij de Autoriteit Persoonsgegevens.
            </p>
          </Blok>
        </div>
      </Sectie>
      <Footer />
    </main>
  );
}

function Blok({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-s2 text-[1.25rem]">{titel}</h2>
      <div className="space-y-s2">{children}</div>
    </section>
  );
}
