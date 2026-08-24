/**
 * Resolutiehaak voor de testrunner.
 *
 * Waarvoor dit bestaat: in de broncode staat `import { mag } from "./claims"`
 * en `from "@/lib/site"`. Next lost dat op met zijn eigen bundler; kale Node
 * niet — die wil een pad met extensie en kent de @-alias niet. Gevolg was dat
 * alleen lib/calc.ts te testen viel, omdat dat als enige geen interne imports
 * heeft. Alles eromheen — de claimpoort, de hercontrole, de mailteksten — stond
 * buiten elk vangnet.
 *
 * Dat is precies verkeerd om: calc.ts is de best doordachte code in het
 * project, en berichten.ts is de code die daadwerkelijk een klant bereikt.
 *
 * Het alternatief was overal `.ts` achter de imports zetten. Dat werkt, maar
 * het verandert honderd regels productiecode om een testrunner te plezieren.
 * Deze dertig regels doen hetzelfde en raken de broncode niet aan.
 */

import { fileURLToPath, pathToFileURL } from "node:url";
import { existsSync } from "node:fs";
import path from "node:path";

const WORTEL = path.resolve(import.meta.dirname, "..");

/**
 * Probeert een specifier op te lossen naar een bestaand .ts- of .tsx-bestand.
 *
 * We geven bewust géén `format` terug. Doe je dat wel ("module"), dan neemt
 * Node dat over en slaat hij het strippen van de types over — je krijgt dan een
 * SyntaxError op de eerste `type`-import die hij tegenkomt. Zonder format leidt
 * Node het zelf af uit de extensie en behandelt hij .ts als TypeScript.
 */
function probeer(basis) {
  for (const kandidaat of [`${basis}.ts`, `${basis}.tsx`, path.join(basis, "index.ts")]) {
    if (existsSync(kandidaat)) return pathToFileURL(kandidaat).href;
  }
  return null;
}

export async function resolve(specifier, context, next) {
  // "@/lib/site" → <projectwortel>/lib/site
  if (specifier.startsWith("@/")) {
    const gevonden = probeer(path.join(WORTEL, specifier.slice(2)));
    if (gevonden) return { url: gevonden, shortCircuit: true };
  }

  // "./claims" → naast het importerende bestand
  //
  // fileURLToPath en niet new URL(...).pathname: de projectmap heet
  // "thuisbatterij-installaties.nl (code)" en zit onder mappen met spaties.
  // In een file-URL staan die als %20 en %28, en dan bestaat het pad niet meer.
  // Dit werkte in de bouwkopie (geen spaties) en faalde in de echte map —
  // het soort verschil waar je een half uur naar zoekt.
  if (specifier.startsWith("./") || specifier.startsWith("../")) {
    const vanaf = context.parentURL ? path.dirname(fileURLToPath(context.parentURL)) : WORTEL;
    const gevonden = probeer(path.resolve(vanaf, specifier));
    if (gevonden) return { url: gevonden, shortCircuit: true };
  }

  return next(specifier, context);
}
