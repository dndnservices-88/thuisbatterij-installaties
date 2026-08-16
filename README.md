# thuisbatterij-installaties.nl

Landingspagina met batterijcalculator. Next.js 14 (App Router), TypeScript, Tailwind.

Gebouwd volgens `Limsolar_Specificatie_Calculator_16aug2026.md` en het sectieplan uit
`Limsolar_Playbook_Website_Zelf_Bouwen_16aug2026.md`. Claims volgen
`Limsolar_Claimregister_en_Publicatiecheck_16aug2026.md`.

---

## Eerst dit

De site is **niet klaar om live te gaan** en dat is met opzet zo afgedwongen in code.
Zolang `NEXT_PUBLIC_LIVE` niet op `true` staat, staat er een bouwstatusbalk bovenaan,
zijn onbevestigde claims geel gearceerd, en staat de pagina op `noindex`.

Zet je hem wel op `true`, dan verdwijnen alle claims die in `lib/claims.ts` niet op
`bevestigd` staan volledig van de pagina. Je kunt met deze code dus geen onbewezen
claim publiceren, ook niet per ongeluk. Wil je een claim tonen, dan zet je hem in
`lib/claims.ts` op `bevestigd` — en dat doe je pas nadat Limsolar het claimregister
heeft afgetekend en het bewijsstuk in `06 - Legal & Compliance/Bewijs/` staat.

---

## Starten

```bash
npm install
cp .env.example .env.local
npm run dev        # http://localhost:3000
npm test           # unittests op de rekenmodule
npm run build      # productiebouw plus typecontrole
```

Node 22 of hoger. De tests draaien met `node --experimental-strip-types`, dus zonder
extra testrunner.

---

## Waar wat staat

| Pad | Wat |
|---|---|
| `lib/calc.ts` | De hele rekenlogica als pure functies. Constanten bovenaan, in één blok. |
| `lib/calc.test.ts` | Negen tests, waaronder de drie testcases uit de specificatie. |
| `lib/claims.ts` | Spiegel van het claimregister. Bepaalt wat er getoond mag worden. |
| `lib/site.ts` | Entiteit, Limsolar-gegevens, consenttekst met versienummer. |
| `lib/varianten.ts` | Hostname-schakelaar voor de twee domeinen. |
| `lib/klikids.ts` | Klik-ID's vangen en 90 dagen bewaren. |
| `lib/tracking.ts` | Consent Mode v2, Meta Pixel, Google Ads, event-meldingen. |
| `lib/opslag.ts` | Leadopslag en de Meta Conversions API. |
| `app/api/lead/route.ts` | Ontvangst van de lead. Consentlog wordt hier server-side gezet. |
| `components/calculator/` | Vijf vraagschermen, resultaat, drie uitzonderingsroutes, formulier. |
| `components/secties/Secties.tsx` | De elf secties van de landingspagina. |

---

## Drie dingen die je niet moet aanpassen zonder na te denken

**De constanten in `lib/calc.ts`.** Wijzig je er één, verhoog dan `REKENVERSIE` en zet
`PEILDATUM_TARIEVEN` op de datum van bevestiging. De rekenversie gaat mee in elke
opgeslagen lead, zodat een oude berekening later nog reproduceerbaar is.

**De prijs in `ASSORTIMENT`.** De calculator mag nooit een capaciteit adviseren die niet
als product met een bekende prijs bestaat. Dat is precies de fout waardoor de eerder
geleverde site op een terugverdientijd van 13 jaar uitkwam in plaats van rond de 8.

**De consenttekst in `lib/site.ts`.** Wijzig je de tekst, verhoog dan het versienummer.
De API-route logt de tekst uit dit bestand en negeert wat de browser meestuurt, zodat
een aangepaste request nooit een andere consenttekst kan laten vastleggen.

---

## Deploy op Vercel

1. Repo naar GitHub, **onder jouw eigen account**. Dat is de laag waar de
   deploy-controle zit, niet het domein.
2. In Vercel: importeer de repo, framework Next.js, verder niets instellen.
3. Zet de omgevingsvariabelen uit `.env.example`.
4. Preview-URL werkt meteen. Domein koppelen doe je pas na aftekening van het
   claimregister: één `CNAME` bij Limsolar, of eerst een subdomein als je wilt
   testen zonder aan de bestaande site te komen.
5. Zet `NEXT_PUBLIC_LIVE=true` als laatste stap, niet als eerste.

Het tweede domein (`slimmethuisbatterij-direct.nl`) staat al voorbereid in
`lib/varianten.ts` maar is uitgeschakeld: de prijsvariant hangt op de
laagsteprijsgarantie (P1) en de prijzen van middenklasse en premium (P3). Zodra die
bevestigd zijn: `actief: true` en het domein in Vercel koppelen. Verder verandert er
niets — alle componenten zijn gedeeld.

---

## Wat er nog moet gebeuren voordat dit live kan

- [ ] Claimregister afgetekend door Limsolar, bewijsstukken gearchiveerd
- [ ] Tarieven bevestigd mét peildatum → `CONSTANTEN` en `PEILDATUM_TARIEVEN` bij
- [ ] Assortiment met werkelijke prijzen → `ASSORTIMENT` aanvullen
- [ ] Consenttekst juridisch nagelezen
- [ ] Entiteitskeuze rond → `ENTITEIT` in `lib/site.ts` invullen
- [ ] Privacyverklaring en algemene voorwaarden juridisch getoetst
- [ ] `LEAD_WEBHOOK_URL` ingesteld en met een testlead doorgemeten
- [ ] Meta Test Events: `Lead` verschijnt één keer, niet twee keer
- [ ] Google Ads-conversie in testmodus geregistreerd
- [ ] Bevestigingsmail ingericht (staat nog niet in deze codebase)
- [ ] Logo, iconen en foto's geplaatst
- [ ] `NEXT_PUBLIC_LIVE=true`
