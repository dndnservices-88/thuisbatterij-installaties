import { headers } from "next/headers";
import { kiesVariant } from "@/lib/varianten";
import { Aanbod, Faq, Footer, SlotCta, Vertrouwensbalk } from "@/components/secties/Secties";
import { OntwerpModusAan } from "@/components/ui/TelOp";
import { Leesvoortgang, Onthul } from "@/components/ontwerp/Onthul";
import HeroOntwerp from "@/components/ontwerp/HeroOntwerp";
import WaaromNuOntwerp from "@/components/ontwerp/WaaromNuOntwerp";
import StappenScroll from "@/components/ontwerp/StappenScroll";
import VerwachtingenOntwerp from "@/components/ontwerp/VerwachtingenOntwerp";
import ReviewsGoogle from "@/components/ontwerp/ReviewsGoogle";
import "@/components/ontwerp/ontwerp.css";

/**
 * De landingspagina, sinds 6 okt 2026 in de vormgeving van het ontwerpvoorbeeld
 * (eerst op /ontwerp, dat nu hierheen doorverwijst).
 *
 * De rekentool staat in de hero zelf: de eerste vraag is boven de vouw te zien.
 * De oude secties (Hero, HoeHetWerkt, WaaromNu, Usps, Reviews in Secties.tsx)
 * staan nog in de code om terug te kunnen, maar worden niet meer getoond.
 *
 * Claimpoort, rekenlogica en formulier zijn ongewijzigd: alleen de vormgeving
 * is anders.
 */

// Zet js-onthul op <html> zodra dit script draait. Pas dan worden blokken
// verborgen om ze bij het scrollen te laten binnenkomen; zonder JavaScript
// staat alles er gewoon.
const ONTHUL_AAN = `document.documentElement.classList.add('js-onthul');`;

export default function Pagina() {
  const variant = kiesVariant(headers().get("host"));

  return (
    <OntwerpModusAan>
      <script dangerouslySetInnerHTML={{ __html: ONTHUL_AAN }} />
      <Leesvoortgang />
      <main className="ontwerp">
        <HeroOntwerp variant={variant} />
        <Vertrouwensbalk />
        <WaaromNuOntwerp />
        <StappenScroll />
        <Onthul>
          <Aanbod />
        </Onthul>
        <VerwachtingenOntwerp />
        <ReviewsGoogle />
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
