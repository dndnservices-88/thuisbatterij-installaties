import Link from "next/link";
import type { Metadata } from "next";
import { Sectie } from "@/components/ui/Sectie";
import { Footer } from "@/components/secties/Secties";
import { Nakijken } from "@/components/ui/Nakijken";
import { isLive } from "@/lib/claims";
import { COOKIE_VARIANT, PRIVACY_OPEN, PRIVACY_VERSIE } from "@/lib/privacy";
import { CONTACT, CONTACT_ADRES, ENTITEIT, LIMSOLAR } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacyverklaring — Thuisbatterij Installaties",
  robots: { index: false, follow: true },
};

/**
 * Privacyverklaring v2.0 — tekst uit de juridische chat (dossier 6, onderdeel A,
 * 7 okt 2026). Concept, nog niet juridisch getoetst. Wat nog nagekeken moet
 * worden, staat als <Nakijken> in de tekst en als lijst in lib/privacy.ts.
 *
 * Aanvullingen van de websitechat (7 okt 2026) bij "Met wie we gegevens delen",
 * elk op twee bronnen:
 * - Vercel: DPF-gecertificeerd + SCC in de DPA (vercel.com/docs/security/compliance; vercel.com/legal/dpa).
 * - Resend: opslag in de VS, DPF-gecertificeerd + SCC in de DPA (resend.com changelog DPF; resend.com/security/gdpr).
 * - Make: Celonis Inc. (VS), DPF; EU-hosting in zone eu1/eu2; SCC voor subverwerkers (make.com/terms-and-conditions; make.com SCC-pdf).
 * - Pipedrive: contract met Pipedrive OÜ (Estland), hosting AWS in de EU; buiten de EER via DPF of SCC (support.pipedrive.com "Pipedrive and GDPR"; pipedrive.com/subprocessors).
 */
export default function Privacy() {
  const telefoon = CONTACT.telefoon_fictief ? (
    isLive ? null : (
      <>
        {" "}
        of <Nakijken label="CloudTalk-nummer">{CONTACT.telefoon}</Nakijken>
      </>
    )
  ) : (
    <> of {CONTACT.telefoon}</>
  );

  return (
    <main>
      <Sectie fond="wit" smal>
        <Link href="/" className="text-[0.9rem] font-semibold text-paars underline">
          ← Terug naar de berekening
        </Link>
        <h1 className="mt-s3">Privacyverklaring</h1>

        {!isLive && (
          <div className="mt-s3 rounded-merk border-2 border-[#A08A00] bg-[#FFF9C4] p-s3 text-[0.85rem]">
            <strong>Nog na te kijken ({PRIVACY_OPEN.length}):</strong>
            <ul className="mt-s1 list-disc pl-s4">
              {PRIVACY_OPEN.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-s5 space-y-s4 text-[0.95rem] leading-relaxed text-n-500">
          <Blok titel="Wie we zijn">
            <p>
              {ENTITEIT.handelsnaam} is een handelsnaam van {ENTITEIT.naam}, ingeschreven bij de KvK
              onder nummer {ENTITEIT.kvk}, {CONTACT_ADRES}. Je bereikt ons via{" "}
              <a href={`mailto:${CONTACT.email}`} className="text-paars underline">
                {CONTACT.email}
              </a>
              {telefoon}.
            </p>
          </Blok>

          <Blok titel="Wie is waarvoor verantwoordelijk">
            <p>Er zijn twee partijen, en elk is zelfstandig verantwoordelijk voor zijn eigen deel:</p>
            <ul className="list-disc space-y-s1 pl-s4">
              <li>
                <strong className="text-n-900">Wij ({ENTITEIT.handelsnaam})</strong> voor de website, de
                berekening, het aanvraagformulier en het telefonische contact met jou, inclusief de{" "}
                <Nakijken label="opname besloten?">opname van dat gesprek</Nakijken>.
              </li>
              <li>
                <strong className="text-n-900">{LIMSOLAR.naam}</strong> (KvK {LIMSOLAR.kvk}, {LIMSOLAR.adres},{" "}
                {LIMSOLAR.postcode} {LIMSOLAR.plaats}) voor de offerte, de koop, de levering, de
                installatie, de garantie en de service. Voor wat Limsolar met je gegevens doet, geldt de
                privacyverklaring van Limsolar:{" "}
                <Nakijken label="link laten bevestigen door Limsolar">
                  <a
                    href="https://limsolar.nl/privacy-regelgeving/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-paars underline"
                  >
                    limsolar.nl/privacy-regelgeving
                  </a>
                </Nakijken>
                .
              </li>
            </ul>
            <p>Doe je een verzoek bij de verkeerde partij, dan sturen wij het binnen vijf werkdagen door.</p>
          </Blok>

          <Blok titel="Welke gegevens we verwerken, waarvoor en op welke grond">
            <Tabel
              kop={["Gegevens", "Waarvoor", "Grondslag"]}
              rijen={[
                [
                  "Je antwoorden in de rekentool en de uitkomst",
                  "Het gesprek voorbereiden; later kunnen nagaan waarop een advies rustte",
                  "Toestemming (als je een advies aanvraagt)",
                ],
                [
                  "Naam, telefoonnummer, e-mailadres, postcode, huisnummer, gewenst dagdeel",
                  `Je bellen en mailen over je berekening, je adviseren en je namens ${LIMSOLAR.naam} een offerte doen`,
                  "Toestemming",
                ],
                [
                  "Dezelfde gegevens",
                  `Doorgeven aan ${LIMSOLAR.naam} voor offerte, koop en installatie`,
                  "Toestemming",
                ],
                [
                  "Tijdstip van toestemming, de tekst die je zag, IP-adres, browser",
                  "Kunnen aantonen dat we je mochten benaderen",
                  <Nakijken key="g2" label="jurist (G2)">Gerechtvaardigd belang</Nakijken>,
                ],
                [
                  <Nakijken key="op" label="opname besloten?">Opname van het telefoongesprek</Nakijken>,
                  "Vastleggen wat er is afgesproken (zeker bij een telefonische offerte of koop) en de kwaliteit van onze gesprekken verbeteren",
                  <Nakijken key="g2b" label="jurist (G2)">Gerechtvaardigd belang</Nakijken>,
                ],
                [
                  "Herkomst van je bezoek (advertentie-ID's, campagnegegevens)",
                  "Weten via welke advertentie je binnenkwam, voor onze eigen administratie en om advertenties op resultaat te sturen",
                  <Nakijken key="g1" label="jurist (G1) + meetchat">Nog te bepalen</Nakijken>,
                ],
                [
                  "Statistiek- en marketingcookies",
                  "Meten hoe de site gebruikt wordt; advertenties bij Google en Meta meten",
                  "Toestemming via de cookiebanner",
                ],
              ]}
            />
            <p>
              Je bent niet verplicht gegevens te geven. Zonder telefoonnummer of e-mailadres kunnen we je
              alleen niet bellen of mailen.
            </p>
            <p>
              We nemen geen besluiten over jou die uitsluitend geautomatiseerd tot stand komen.
              {/* Aanpassen zodra de leadscore uit fase 3 er is. */}
            </p>
          </Blok>

          <Blok titel="Telefoongesprekken">
            <p>
              <Nakijken label="opname besloten?">
                We nemen onze telefoongesprekken op. Dat zeggen we aan het begin van elk gesprek. We
                bewaren een opname zes maanden. Is er in het gesprek een offerte geaccepteerd of een koop
                gesloten, dan bewaren we de opname tot de bedenktijd voorbij is en de afrekening met
                Limsolar rond is.
              </Nakijken>
            </p>
          </Blok>

          <Blok titel="Cookies en meten">
            <p>Noodzakelijke cookies zorgen dat de site werkt en onthouden je cookiekeuze.</p>
            {COOKIE_VARIANT === 1 ? (
              <p>
                Op de site draait Google Tag Manager. Zolang je geen toestemming geeft, sturen de
                Google-tags alleen metingen zonder cookies en zonder advertentie-ID&apos;s. Geef je
                toestemming, dan plaatsen Google en Meta hun cookies voor statistiek en advertenties.
              </p>
            ) : (
              <p>
                Pas als je in de cookiebanner toestemming geeft, laden de meetscripts van Google en Meta.
                Weiger je, dan blijven ze uit.
              </p>
            )}
            <p>
              Geef je toestemming voor marketing, dan sturen we bij een aanvraag ook vanaf onze server een
              melding naar Meta, met je e-mailadres en telefoonnummer in gehashte (versleutelde) vorm. Ook
              gehasht blijven dat persoonsgegevens. Voor die meting zijn wij en Meta Platforms Ireland Ltd.
              samen verantwoordelijk; Meta legt uit wat het met deze gegevens doet in haar eigen
              privacybeleid.
            </p>
            <p>Je wijzigt je keuze altijd via &quot;Cookievoorkeuren&quot; onderaan elke pagina.</p>
          </Blok>

          <Blok titel="Met wie we gegevens delen">
            <p>
              Naast {LIMSOLAR.naam} (zie hierboven) werken we met dienstverleners die gegevens alleen in
              onze opdracht verwerken:
            </p>
            <Tabel
              kop={["Dienst", "Waarvoor", "Vestiging / doorgifte"]}
              rijen={[
                [
                  "Vercel",
                  "Hosting van de website",
                  <Nakijken key="v" label="Pro-plan controleren">
                    VS — EU-US Data Privacy Framework en standaardcontractbepalingen
                  </Nakijken>,
                ],
                ["Resend", "Versturen van e-mail", "VS — EU-US Data Privacy Framework en standaardcontractbepalingen"],
                [
                  "Make",
                  "Doorsturen van aanvragen naar onze systemen",
                  <Nakijken key="m" label="plan en zone controleren">
                    Celonis Inc. (VS) — EU-US Data Privacy Framework; verwerking in de EU
                  </Nakijken>,
                ],
                [
                  "Google (Sheets, Analytics, Ads, Tag Manager)",
                  "Opslag voor de meting; statistiek; advertenties",
                  <Nakijken key="g" label="account (G4)">VS — EU-US Data Privacy Framework</Nakijken>,
                ],
                [
                  "Pipedrive",
                  "Klantbeheer (CRM)",
                  "Pipedrive OÜ (Estland), opslag in de EU; doorgifte buiten de EER alleen onder het Data Privacy Framework of standaardcontractbepalingen",
                ],
                [
                  "CloudTalk s.r.o. (Bratislava)",
                  <Nakijken key="ct" label="opname besloten?">Telefonie en gespreksopname</Nakijken>,
                  "EU; doorgifte aan CloudTalk.io Inc. (VS) onder het Data Privacy Framework",
                ],
                [
                  <Nakijken key="p" label="welke dienst?">Pushdienst</Nakijken>,
                  "Melding van een nieuwe aanvraag aan ons",
                  <Nakijken key="p2" label="controleren">—</Nakijken>,
                ],
              ]}
            />
            <p>
              Gaan gegevens naar een land buiten de Europese Economische Ruimte, dan gebeurt dat op basis
              van het EU-US Data Privacy Framework of de standaardcontractbepalingen van de Europese
              Commissie.
            </p>
          </Blok>

          <Blok titel="Hoe lang we bewaren">
            <Tabel
              kop={["Gegevens", "Termijn"]}
              rijen={[
                ["Aanvraag zonder afspraak of koop", "12 maanden na het laatste contact"],
                ["Bewijs van je toestemming", "5 jaar na het laatste contact"],
                [
                  <Nakijken key="o" label="opname besloten?">Opname van een telefoongesprek</Nakijken>,
                  "6 maanden; bij offerte of koop tot de bedenktijd voorbij is en de afrekening met Limsolar rond is",
                ],
                [
                  "Aanvraag die tot een koop leidt",
                  "De klantgegevens liggen dan bij Limsolar. Wij bewaren alleen wat in onze administratie hoort, 7 jaar (fiscale bewaarplicht)",
                ],
              ]}
            />
          </Blok>

          <Blok titel="Je rechten">
            <p>
              Je mag opvragen welke gegevens we van je hebben, ze laten corrigeren of verwijderen, de
              verwerking laten beperken, bezwaar maken, en je gegevens laten overdragen. Je kunt je
              toestemming op elk moment intrekken; vanaf dat moment bellen en mailen we je niet meer. Wat
              we vóór dat moment deden, blijft rechtmatig. Stuur je verzoek naar{" "}
              <a href={`mailto:${CONTACT.email}`} className="text-paars underline">
                {CONTACT.email}
              </a>{" "}
              of naar {CONTACT_ADRES}. Kom je er met ons niet uit, dan kun je een klacht indienen bij de
              Autoriteit Persoonsgegevens.
            </p>
          </Blok>

          <p className="text-[0.85rem] italic">
            Versie {PRIVACY_VERSIE} · <Nakijken label="publicatiedatum">7 oktober 2026</Nakijken>
          </p>
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

function Tabel({ kop, rijen }: { kop: string[]; rijen: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-[0.88rem]">
        <thead>
          <tr>
            {kop.map((k) => (
              <th key={k} className="border-b border-n-200 py-s1 pr-s3 font-semibold text-n-900">
                {k}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rijen.map((r, i) => (
            <tr key={i} className="align-top">
              {r.map((c, j) => (
                <td key={j} className="border-b border-n-200 py-s1 pr-s3">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
