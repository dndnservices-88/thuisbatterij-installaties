import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { kiesVariant } from "@/lib/varianten";
import { Aanbod, Faq, Footer, Reviews, SlotCta, Usps, Vertrouwensbalk } from "@/components/secties/Secties";
import { OntwerpModusAan } from "@/components/ui/TelOp";
import { Leesvoortgang, Onthul } from "@/components/ontwerp/Onthul";
import HeroOntwerp from "@/components/ontwerp/HeroOntwerp";
import WaaromNuOntwerp from "@/components/ontwerp/WaaromNuOntwerp";
import StappenScroll from "@/components/ontwerp/StappenScroll";
import "@/components/ontwerp/ontwerp.css";

/**
 * TIJDELIJKE PAGINA — ontwerpvoorbeeld, 30 september 2026.
 *
 * Bedoeld om de nieuwe vormgeving te beoordelen naast de huidige homepage. Staat
 * altijd op noindex, los van NEXT_PUBLIC_LIVE, en er linkt niets naartoe.
 * Bevalt het, dan gaat het ontwerp naar de homepage en verdwijnt deze route.
 * Bevalt het niet, dan is de map app/ontwerp en components/ontwerp weggooien
 * genoeg — de homepage hangt er niet van af.
 *
 * De claimpoort, de rekenlogica en het formulier zijn precies dezelfde als op de
 * homepage: hier verandert alleen de vormgeving.
 */
export const metadata: Metadata = {
  title: "Ontwerpvoorbeeld — Thuisbatterij Installaties",
  robots: { index: false, follow: false },
};

// Zet js-onthul op <html> zodra dit script draait. Pas dan worden blokken
// verborgen om ze bij het scrollen te laten binnenkomen; zonder JavaScript
// staat alles er gewoon.
const ONTHUL_AAN = `document.documentElement.classList.add('js-onthul');`;

export default function Ontwerp() {
  const variant = kiesVariant(headers().get("host"));

  return (
    <OntwerpModusAan>
      <script dangerouslySetInnerHTML={{ __html: ONTHUL_AAN }} />
      <Leesvoortgang />

      <div className="border-b border-n-200 bg-paars-tint px-s3 py-s2 text-center text-[0.85rem] text-paars">
        <strong>Ontwerpvoorbeeld.</strong> Dit is een testpagina en niet de site zoals hij nu staat.{" "}
        <Link href="/" className="font-semibold underline">
          Naar de huidige homepage
        </Link>
      </div>

      <main className="ontwerp">
        <HeroOntwerp variant={variant} />
        <Vertrouwensbalk />
        <WaaromNuOntwerp />
        <StappenScroll />
        <Onthul>
          <Aanbod />
        </Onthul>
        <Onthul>
          <Usps />
        </Onthul>
        <Onthul>
          <Reviews />
        </Onthul>
        <Onthul>
          <Faq />
        </Onthul>
        <Onthul>
          <SlotCta variant={variant} />
        </Onthul>
        <Footer />
      </main>
    </OntwerpModusAan>
  );
}
