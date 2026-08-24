/** Zet de resolutiehaak aan. Zie scripts/tsresolve.mjs voor het waarom. */
import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("./tsresolve.mjs", pathToFileURL(import.meta.filename));
