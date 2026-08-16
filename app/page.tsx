import { headers } from "next/headers";
import { kiesVariant } from "@/lib/varianten";
import { Sectie, Kop } from "@/components/ui/Sectie";
import Calculator from "@/components/calculator/Calculator";
import {
  Aanbod,
  Faq,
  Footer,
  Hero,
  HoeHetWerkt,
  Reviews,
  SlotCta,
  Usps,
  Vertrouwensbalk,
  WaaromNu,
} from "@/components/secties/Secties";

/**
 * De landingspagina. Sectievolgorde uit het playbook, fase 2.
 * De calculator staat bewust hoog — direct onder de vertrouwensbalk — omdat
 * daar het overgrote deel van de leads vandaan komt.
 */
export default function Pagina() {
  const variant = kiesVariant(headers().get("host"));

  return (
    <main>
      <Hero variant={variant} />
      <Vertrouwensbalk />

      <Sectie id="calculator" fond="grijs" smal>
        <Kop
          boven="De rekensom"
          onder="Vijf vragen over je situatie. Je ziet de uitkomst meteen, zonder gegevens achter te laten."
        >
          Wat levert een thuisbatterij bij jou op?
        </Kop>
        <Calculator />
      </Sectie>

      <WaaromNu />
      <HoeHetWerkt />
      <Aanbod />
      <Usps />
      <Reviews />
      <Faq />
      <SlotCta variant={variant} />
      <Footer />
    </main>
  );
}
