import Link from "next/link";
import type { Metadata } from "next";
import { Sectie } from "@/components/ui/Sectie";
import { Footer } from "@/components/secties/Secties";
import { CONTACT, CONTACT_ADRES, ENTITEIT, LIMSOLAR } from "@/lib/site";
import { isLive } from "@/lib/claims";

export const metadata: Metadata = {
  title: "Bedrijfsgegevens — Thuisbatterij Installaties",
  robots: { index: false, follow: true },
};

/**
 * Verplichte bedrijfsgegevens (7 okt 2026). Bronnen: Ondernemersplein/RVO
 * "Regels voor bedrijfscorrespondentie" (gecontroleerd 3 dec 2025) en ACM
 * "Bedrijfsgegevens vermelden" (bijgewerkt 29 jul 2025): statutaire naam en
 * handelsnaam, statutaire zetel, vestigingsadres, e-mail, telefoon, KvK- en
 * btw-nummer, plus naam en adres van de uitvoerder. Wettekst (2:186 en 3:15d BW)
 * nog niet zelf geopend.
 *
 * Bij de naamswijziging naar DNDN Services B.V.: alleen ENTITEIT in lib/site.ts.
 */
export default function Bedrijfsgegevens() {
  return (
    <main>
      <Sectie fond="wit" smal>
        <Link href="/" className="text-[0.9rem] font-semibold text-paars underline">
          ← Terug naar de berekening
        </Link>
        <h1 className="mt-s3">Bedrijfsgegevens</h1>

        <dl className="mt-s5 grid gap-x-s4 gap-y-s2 text-[0.95rem] sm:grid-cols-[auto_1fr]">
          <Regel label="Handelsnamen">{ENTITEIT.handelsnamen.join(", ")}</Regel>
          <Regel label="Statutaire naam">{ENTITEIT.naam}</Regel>
          <Regel label="Statutaire zetel">{ENTITEIT.zetel}</Regel>
          <Regel label="KvK-nummer">{ENTITEIT.kvk}</Regel>
          <Regel label="Btw-nummer">{ENTITEIT.btw}</Regel>
          <Regel label="Adres">{CONTACT_ADRES}</Regel>
          <Regel label="E-mail">
            <a href={`mailto:${CONTACT.email}`} className="font-semibold text-paars underline">
              {CONTACT.email}
            </a>
          </Regel>
          <Regel label="Telefoon">
            {CONTACT.telefoon_fictief ? (
              isLive ? (
                "volgt"
              ) : (
                <span className="placeholder">
                  {CONTACT.telefoon}
                  <span className="placeholder-label">fictief — CloudTalk-nummer</span>
                </span>
              )
            ) : (
              <a href={`tel:${CONTACT.telefoon.replace(/\s/g, "")}`} className="font-semibold text-paars underline">
                {CONTACT.telefoon}
              </a>
            )}
          </Regel>
        </dl>

        <h2 className="mt-s6 text-[1.25rem]">Installatie en uitvoering</h2>
        <p className="mt-s2 text-[0.95rem] leading-relaxed text-n-500">
          {LIMSOLAR.naam}, KvK {LIMSOLAR.kvk}, {LIMSOLAR.adres}, {LIMSOLAR.postcode} {LIMSOLAR.plaats}.
        </p>
      </Sectie>
      <Footer />
    </main>
  );
}

function Regel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-n-500">{label}</dt>
      <dd className="font-semibold text-n-900">{children}</dd>
    </>
  );
}
