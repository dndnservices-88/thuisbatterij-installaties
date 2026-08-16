import type { Config } from "tailwindcss";

/**
 * Design-tokens uit Thuisbatterij_Installaties__Brandbook_2026 v1.1.
 * Paars #370060 en geel #F5F415 zijn bevestigd in het brandbook (p.16);
 * de losse style guide bevatte twee foute hexlabels en is niet leidend.
 *
 * Verhouding in beeld: wit ~55%, paars ~33%, geel uitsluitend als accent.
 * Geel op wit haalt 1,18:1 contrast en is dus NOOIT tekstkleur.
 * Zwart op geel haalt 17,83:1, wit op paars 15,64:1 — beide ruim voldoende.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paars: { DEFAULT: "#370060", donker: "#240040", tint: "#F4EFF8" },
        // 'donker' is alleen een hover-staat, geen tweede merkkleur.
        geel: { DEFAULT: "#F5F415", donker: "#DCDB12" },
        n: {
          "000": "#FEFEFE",
          100: "#F7F7F8",
          200: "#DEDEDE",
          500: "#6E6B6F",
          600: "#6E6C6F",
          900: "#000000",
        },
      },
      fontFamily: {
        kop: ["var(--font-kop)", "system-ui", "sans-serif"],
        tekst: ["var(--font-tekst)", "system-ui", "sans-serif"],
        accent: ["var(--font-accent)", "Georgia", "serif"],
      },
      spacing: { s1: "4px", s2: "8px", s3: "16px", s4: "24px", s5: "40px", s6: "64px" },
      borderRadius: { merk: "12px" },
      maxWidth: { inhoud: "1120px", lees: "68ch" },
    },
  },
  plugins: [],
};

export default config;
