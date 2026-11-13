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
| `lib/tracking.ts` | Toestemming per categorie, Consent Mode v2, gebeurtenissen naar de dataLayer. Laadt zelf geen enkel meetscript. |
| `components/ConsentBanner.tsx` | De banner zelf, inclusief migratie van de oude cookie. |
| `lib/opslag.ts` | Leadopslag en de Meta Conversions API. |
| `lib/uitkomst.ts` | Uitkomsten, hun vaste conversiewaarde en de regel voor de importsheet. |
| `app/api/lead/route.ts` | Ontvangst van de lead. Consentlog wordt hier server-side gezet. |
| `app/api/uitkomst/route.ts` | Resultaat aan een lead hangen. Afgeschermd met een sleutel. |
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

## Meten loopt via Tag Manager, niet via de code

De site laadt zelf geen enkel meetscript meer. Geen Meta Pixel, geen `gtag/js`, geen
GA4. Er staat één containersnippet in `app/layout.tsx` en daar hangt alles ín:
GA4, de Google Ads-conversie, de Meta-pixel, Clarity. Wil je een tag erbij of eruit,
dan doe je dat in Tag Manager en niet in deze codebase — dat scheelt een uitrol per
wijziging, en het voorkomt dat een tag twee keer vuurt omdat hij zowel in de code als
in de container staat.

Wat de code wél doet:

1. **Toestemmingsstandaarden zetten, vóór de container laadt.** Zes signalen, niet
   vier. De vier keuzesignalen staan op `denied`; `functionality_storage` en
   `security_storage` staan op `granted` omdat de site die categorieën alleen gebruikt
   voor de toestemmingscookie zelf en de klik-ID's. Wat je niet declareert, vult Google
   zelf in — vandaar dat ze er alle zes staan. De volgorde in `layout.tsx` is niet
   vrijblijvend: staat de container vóór dit blok, dan telt de eerste paginaweergave
   als `granted` en klopt de hele meting niet meer.
2. **De keuze van de bezoeker doorgeven** met `gtag('consent','update', …)`, gevolgd
   door een `consent_update`-gebeurtenis in de dataLayer zodat tags die op toestemming
   moeten wachten een trigger hebben.
3. **Eén gebeurtenis pushen bij een lead**, met `event_id` en `transaction_id` — dat is
   hetzelfde nummer onder twee namen, met opzet. Meta ontdubbelt op `event_id` tegen
   wat de server via de Conversions API stuurt, Google Ads ontdubbelt op
   `transaction_id` tegen een herladen bedankscherm. Zet `transaction_id` dus in het
   veld Transactie-ID van de Ads-conversietag, anders telt een refresh dubbel.

Zonder `NEXT_PUBLIC_GTM_ID` komt er geen snippet in de pagina en meet de site niets.
Dat is de bedoeling zolang de container niet bestaat: een halve meetopstelling is
erger dan geen, want dan denk je dat je cijfers hebt.

### De weg terug: van sale naar zoekwoord

Meten wat er binnenkomt is de helft. De andere helft is terugkoppelen wat eruit
kwam, want Google leert anders alleen welke zoekterm formulieren oplevert.

`POST /api/uitkomst` hangt een resultaat aan een lead-id: niet bereikbaar, A/B/C,
afspraak geboekt, nagekomen, sale, telefonische verkoop of geen sale, plus de
verkoper die het huisbezoek deed. Het endpoint is afgeschermd met
`UITKOMST_TOKEN` in de header `x-uitkomst-token` — anders dan `/api/lead`, dat
open moet staan. Hier schrijf je namelijk commerciële waarheid: wie ongevraagd
een sale kan melden, stuurt het biedalgoritme én de facturatie.

Drie van die uitkomsten worden een conversieactie in Google Ads (verdienmodel
van 6 oktober 2026: wij betalen de advertenties, Limsolar betaalt €500 zodra hun
verkoper sluit en er een installatieafspraak staat, en €750 extra als wij zelf
telefonisch verkopen):

| Uitkomst | Conversieactie | Waarde | Bij de start |
|---|---|---|---|
| `afspraak_geboekt` | TBI Afspraak geboekt | €200 = €500 × 40% **[AANNAME]** | primair, stuurt |
| `sale` | TBI Sale | €500 | secundair, rapportage |
| `verkoop_telefonisch` | TBI Telefonische verkoop | €1.250 | secundair, rapportage |

Eén stuursignaal, omdat alles tegelijk primair dezelfde klant dubbel telt en
Google ongeveer dertig conversies per maand per actie nodig heeft. Zodra de sales
dat halen, wordt de sale het stuursignaal. De 40% vervang je in `lib/uitkomst.ts`
zodra het werkelijke sluitpercentage bekend is. De rest van de uitkomsten wordt
wél geregistreerd maar niet teruggekoppeld.

**Toestemming.** De server leest bij elke lead de cookiekeuze (`tbi_consent`) en
slaat hem op als `cookie_toestemming`. De Meta Conversions API vuurt alleen bij
marketing = ja, en de importregel naar Google krijgt de kolommen Ad User Data en
Ad Personalization (Granted/Denied) mee. Het CRM moet `cookie_toestemming` bewaren
en terugsturen naar `/api/uitkomst`; ontbreekt hij, dan gaat de regel als Denied.

Vaste waarden en geen orderwaarde, omdat onze vergoeding een vast bedrag per sale is —
een sale van €12.000 levert ons evenveel op als een van €4.000, dus orderwaarde
importeren zou het algoritme op de marge van iemand anders laten sturen. De
waarde varieert hier tússen uitkomsten, niet bínnen een uitkomst. Beweegt de fee
ooit mee met orderwaarde, dan is `lib/uitkomst.ts` het bestand dat verandert en
niet een instelling in Google Ads.

Wat er níét naar Google gaat, gaat er met een reden niet heen, en die reden komt
terug in het antwoord. Een lead zonder klik-ID kwam niet via een advertentie. Een
lead met alleen een `gbraid` of `wbraid` hoort in een aparte import en niet in de
kolom Google Click ID. En `geen_sale` bestaat bij Google niet: er is geen
negatieve conversie. Alle drie zijn normaal — maar stil overslaan is dat niet,
want dan zie je pas maanden later dat een deel van je conversies nooit aankwam.

Het volledige bouwplan, inclusief de sheet-indeling en de valkuilen die bij ORJN
een ochtend kostten, staat in `02 - SEA (Google Ads)/`.

### De toestemmingscookie

De cookie heet `tbi_consent` en is nu versie 2: een keuze per categorie in plaats van
`alles` / `alleen_noodzakelijk`. Oude cookies blijven werken en worden bij het eerste
bezoek stil omgezet — de vertaling is volledig, dus opnieuw vragen zou niet kloppen.
`npm test` dekt die migratie af, want die laag faalt stil: een fout levert geen
foutmelding op maar een bezoeker die ooit heeft geweigerd en van wie nu toch gemeten
wordt.

---

## Deploy op Vercel

1. Repo naar GitHub, **onder jouw eigen account**. Dat is de laag waar de
   deploy-controle zit, niet het domein.
2. In Vercel: importeer de repo, framework Next.js, verder niets instellen.
3. Zet de omgevingsvariabelen uit `.env.example`. Alleen `LEAD_WEBHOOK_URL`,
   `RESEND_API_KEY` en `META_CAPI_TOKEN` op **Sensitive** — de rest moet je terug
   kunnen lezen. Staan `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_GOOGLE_ADS_ID` of
   `NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL` er nog in, haal ze weg: die zijn per
   26 augustus 2026 vervallen en wekken de indruk dat er iets gemeten wordt.
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

## Checklist livegang — stand 13 nov 2026

*De site staat sinds 28 okt 2026 live (`NEXT_PUBLIC_LIVE=true` op Production, gezet door
CAMPAGNES op verzoek van Dieudonné; prikbord r. 29). Bijgewerkt door WEBSITE, 13 nov 2026.
Wat nog open staat, staat ook op het prikbord (`00_Chats/Limsolar_Overdrachten_tussen_chats.md`).*

- [ ] Claimregister afgetekend door Limsolar, bewijsstukken gearchiveerd — tekenafspraak
      gepland (D.); P2 (…99), P8, P9 en U9 meenemen (prikbord r. 40, 41, 57)
- [ ] Schriftelijk akkoord Limsolar op de prijzen …99 in `06 - …/Bewijs/` (D.)
- [x] Keurmerken: V1 en V7 op `bevestigd` op besluit Dieudonné (26 okt 2026)
- [x] Tarieven bevestigd met peildatum (R2, 6 okt 2026, Fabian/Limsolar)
- [x] Assortiment met werkelijke prijzen (prijslijst met fase, 13 okt 2026; consumentenprijs
      op …99 via `consumentenprijs()`, rekenversie 1.5.2)
- [x] Entiteit: Tjapz Alphen B.V., KvK 90408616, handelsnaam Thuisbatterij-installaties
- [x] `CONTACT` compleet: 085 333 5387 (Rinkel, geen gespreksopname), adres Entrada 400,
      1114 AA Duivendrecht (bevestigd via KvK, D. 13 nov)
- [ ] Toestemmingstekst (nu v1.4, met WhatsApp) en privacyverklaring (nu 2.4) juridisch
      getoetst — open punten staan in `lib/privacy.ts` (`PRIVACY_OPEN`)
- [ ] Make op het gratis plan (D. 13 nov, bewust niet upgraden): verwerkersovereenkomst
      laten toetsen door JURIDISCH
- [x] `LEAD_WEBHOOK_URL` ingesteld en doorgemeten (Make → Pipedrive + sheet)
- [x] GTM-container GTM-KTX7J4GN live (versie 6); `Lead` met `event_id` en `transaction_id`
      gezien in Tag Assistant (26 okt 2026)
- [x] Google Ads-conversie "TBI Lead (website)" vuurt (Tag Assistant op live versie 6, 26 okt)
- [ ] Meta: Lead browser + server met hetzelfde `event_id` ontdubbeld in Gebeurtenissenbeheer
      (METING)
- [ ] Terugkoppelingsloop uitkomsten (afspraak/sale) → Google en Meta (prikbord r. 12)
- [x] Bevestigingsmail ingericht (opgemaakt, logo's, `MAIL_VAN` in Vercel)
- [x] Logo, iconen en foto's geplaatst (geen merknamen op de site, besluit P6)
- [x] `NEXT_PUBLIC_LIVE=true` (28 okt 2026)
