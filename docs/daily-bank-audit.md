# Auditoria i ampliació del banc de la Sessió diària

Data: 4 d’octubre de 2026. No s’han afegit àrees curriculars ni s’han canviat els llindars de domini, progressió o estancament.

> Aquest document conserva la línia base de 85 formats. L’auditoria funcional posterior i les sis alternatives mínimes de fets bàsics es documenten a [`daily-functional-coverage-audit.md`](daily-functional-coverage-audit.md).

## Inventari abans de l’ampliació

L’inventari de partida contenia **50 candidats seleccionables**, **47 parelles habilitat–procediment** i només **2 procediments amb més d’una família seleccionable** (`solve-two-step` i `rectangle-area`). La taxonomia contenia sobretot un format per procediment. Els punts especialment limitats eren:

- les sis operacions de fraccions només tenien càlcul simbòlic;
- equivalència i simplificació només tenien una relació o expressió simbòlica;
- càlcul aritmètic era exclusivament mecànic;
- percentatges no separaven calcular part, trobar total i trobar taxa;
- dades no comprovaven conclusions causals no suportades;
- conversions no diagnosticaven direcció ni factor;
- `simplify` podia abaixar el nivell i, en alguns generadors, canviar accidentalment de procediment.

Canviar nombres, noms o l’ordre de les opcions no es va comptar com un nou format.

## Debilitats detectades i prioritat

| Habilitat/procediment | Problema | Categoria | Severitat | Impacte | Prioritat |
|---|---|---|---|---|---|
| Operacions de fraccions | només càlcul simbòlic | cobertura, transferència, diagnòstic | crítica | reparació i estancament no tenien alternatives reals | P1 |
| Equivalència / simplificació | una única representació | transferència i repetició | alta | falsa fluïdesa difícil de comprovar | P1 |
| Simplificació adaptativa | baixar nivell podia canviar procediment | manca de simplificació | crítica | evidència atribuïda al procediment incorrecte | P1 |
| Equacions amb parèntesis | sense diagnòstic específic de distributiva | manca de diagnòstic | alta | no distingia factor oblidat d’error de càlcul | P1 |
| Percentatges | canvi percentual dominava el banc | cobertura cognitiva | alta | part, total i taxa quedaven agrupats | P2 |
| Decimals | poc valor posicional i plausibilitat | cobertura cognitiva | mitjana | comparació mecànica excessiva | P2 |
| Dades | conclusions descriptives però poca crítica causal | manca de diagnòstic | alta | es podia acceptar causalitat no demostrada | P2 |
| Unitats | poca informació sobre error de factor | diagnòstic | alta | reparacions genèriques | P2 |
| Geometria | poca selecció de fórmula/dades | càlcul mecànic | mitjana | no distingia fórmula de càlcul | P2 |
| Càlcul bàsic | una representació simbòlica | transferència | mitjana | continua sent una limitació oberta | P3 |
| Aplicacions de fraccions | un format per procediment | varietat | mitjana | contextos correctes però poc transferibles | P3 |

## Inventari després de l’ampliació

Ara hi ha **85 candidats cognitius**, **58 parelles habilitat–procediment**, **13 procediments amb alternatives** i **71 entrades explícites de taxonomia**. La taula agrupa plantilles parametritzades; el recompte final no inclou canvis merament numèrics.

| Àrea | Habilitat | Procediment | Nivell | Pregunta | Representació | Raonament | Passos | Resposta | Prerequisits | Microlliçó | Simplifica | Transferència | Plantilles |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---:|
| numbers | calculation.muldiv | multiply-facts | 1 | arith | symbolic | execute | 1 | numeric | — | calculation | no | no | 1 |
| numbers | calculation.muldiv | divide-facts | 1 | arith | symbolic | execute | 1 | numeric | — | calculation | no | no | 1 |
| numbers | calculation.muldiv | written-multiplication | 2 | arith | symbolic | execute | 1 | numeric | — | calculation | sí | no | 1 |
| numbers | calculation.muldiv | written-division | 2 | arith | symbolic | execute | 1 | numeric | — | calculation | sí | no | 1 |
| numbers | calculation.muldiv | signed-multiplication | 3 | arith | symbolic | execute | 1 | numeric | — | calculation | sí | no | 1 |
| numbers | calculation.muldiv | signed-division | 3 | arith | symbolic | execute | 1 | numeric | — | calculation | sí | no | 1 |
| numbers | calculation.muldiv | mixed-calculation | 4 | arith | symbolic | execute | 2 | numeric | — | calculation | sí | no | 1 |
| numbers | fractions.concept | fraction-meaning | 1 | frac-identify, choice | area-model, verbal-context | interpret, model | 1 | choice | — | fraction-meaning | no | sí | 2 |
| numbers | fractions.equivalence | equivalence | 1 | frac-equivalent, choice | symbolic, area-model | complete-relation, match-equivalent | 1 | numeric, choice | calculation.muldiv, fractions.concept | fraction-equivalence | sí | sí | 2 |
| numbers | fractions.simplification | simplification | 1 | frac-simplify, choice | symbolic, worked-error | execute, diagnose | 2 | fraction, choice | fractions.equivalence | fraction-simplify | sí | sí | 2 |
| numbers | fractions.operations | add-same-denominator | 1 | frac-arith, choice | symbolic, worked-step, worked-error, verbal-context | execute, complete, diagnose, apply | 2, 1 | fraction, choice | calculation.muldiv, fractions.equivalence | fraction-add-same | sí | sí | 4 |
| numbers | fractions.operations | subtract-same-denominator | 1 | frac-arith, choice | symbolic, worked-step, worked-error, verbal-context | execute, complete, diagnose, apply | 2, 1 | fraction, choice | calculation.muldiv, fractions.equivalence | fraction-add-same | sí | sí | 4 |
| numbers | fractions.operations | add-different-denominator | 2 | frac-arith, choice | symbolic, worked-step, worked-error, verbal-context | execute, complete, diagnose, apply | 2, 1 | fraction, choice | calculation.muldiv, fractions.equivalence | fraction-add-different | sí | sí | 4 |
| numbers | fractions.operations | subtract-different-denominator | 2 | frac-arith, choice | symbolic, worked-step, worked-error, verbal-context | execute, complete, diagnose, apply | 2, 1 | fraction, choice | calculation.muldiv, fractions.equivalence | fraction-add-different | sí | sí | 4 |
| numbers | fractions.operations | multiply-fractions | 3 | frac-arith, choice | symbolic, worked-step, worked-error, verbal-context | execute, complete, diagnose, apply | 2, 1 | fraction, choice | calculation.muldiv, fractions.equivalence | fraction-multiply | sí | sí | 4 |
| numbers | fractions.operations | divide-fractions | 4 | frac-arith, choice | symbolic, worked-step, worked-error, verbal-context | transform-and-execute, complete, diagnose, apply | 3, 1, 2 | fraction, choice | calculation.muldiv, fractions.equivalence | fraction-divide | sí | sí | 4 |
| numbers | fractions.applications | fraction-as-quotient | 1 | choice | verbal-context | model | 1 | choice | fractions.equivalence | — | no | no | 1 |
| numbers | fractions.applications | compare-same-denominator | 1 | choice | verbal-context | interpret | 1 | choice | fractions.equivalence | — | no | no | 1 |
| numbers | fractions.applications | scale-fraction | 2 | numeric | verbal-context | apply | 2 | fraction | fractions.equivalence | multistep-strategy | no | no | 1 |
| numbers | fractions.applications | recover-whole | 3 | choice | verbal-context | apply | 2 | choice | fractions.equivalence | multistep-strategy | no | no | 1 |
| numbers | numbers.decimals | place-value | 1 | choice | place-value-table | interpret | 1 | choice | fractions.equivalence | decimal-place-value | no | no | 1 |
| numbers | numbers.decimals | compare-decimals | 1 | choice | symbolic | compare | 1 | choice | fractions.equivalence | decimal-compare | no | no | 1 |
| numbers | numbers.decimals | convert-representation | 1 | choice | symbolic | translate | 1 | choice | fractions.equivalence | decimal-representations | no | no | 1 |
| numbers | numbers.decimals | order-decimals | 2 | choice | number-line | order | 2 | choice | fractions.equivalence | decimal-order | no | no | 1 |
| numbers | numbers.decimals | estimate-decimal | 2 | choice | verbal-context | estimate-and-check | 2 | choice | fractions.equivalence | — | no | no | 1 |
| numbers | numbers.decimals | percentage-decrease | 2 | choice | verbal-context | apply | 2 | choice | fractions.equivalence | percent-change | no | no | 1 |
| numbers | numbers.decimals | percentage-increase | 3 | choice | verbal-context | apply | 2 | choice | fractions.equivalence | percent-change | no | no | 1 |
| numbers | percentages.meaning | identify-percentage | 1 | choice | area-model | interpret | 1 | choice | numbers.decimals | decimal-representations | no | no | 1 |
| numbers | percentages.meaning | convert-representation | 1 | choice | symbolic | translate | 1 | choice | numbers.decimals | decimal-representations | no | no | 1 |
| numbers | percentages.meaning | calculate-percentage-part | 2 | numeric | symbolic | execute | 2 | numeric | numbers.decimals | percent-change | no | no | 1 |
| numbers | percentages.meaning | find-percentage-rate | 2 | choice | verbal-context | compare | 2 | choice | numbers.decimals | percent-change | no | no | 1 |
| numbers | percentages.meaning | find-percentage-total | 3 | numeric | verbal-context | inverse | 2 | numeric | numbers.decimals | percent-change | no | no | 1 |
| numbers | percentages.meaning | percentage-decrease | 2 | choice | verbal-context | apply | 2 | choice | numbers.decimals | percent-change | no | no | 1 |
| numbers | percentages.meaning | percentage-increase | 3 | choice | verbal-context | apply | 2 | choice | numbers.decimals | percent-change | no | no | 1 |
| algebra | algebra.linear | solve-one-step | 1 | numeric | symbolic | execute | 1 | numeric | calculation.muldiv | linear-equation | no | no | 1 |
| algebra | algebra.linear | solve-two-step | 2, 3 | numeric, choice | symbolic, worked-step, worked-error | execute, complete, select-next-step, diagnose | 2, 1 | numeric, choice | calculation.muldiv | linear-equation | sí | sí | 4 |
| algebra | algebra.linear | unknown-both-sides | 3 | numeric | symbolic | execute | 3 | numeric | calculation.muldiv | — | sí | no | 1 |
| algebra | algebra.linear | equation-parentheses | 4 | numeric, choice | symbolic, worked-error | execute, diagnose | 3, 2 | numeric, choice | calculation.muldiv | equation-parentheses | sí | sí | 2 |
| geometry | geometry.measure | rectangle-area | 1 | geom-num, choice | diagram | select-and-execute, estimate | 2, 1 | numeric, choice | calculation.muldiv | geometry-area-perimeter, estimate-result | sí | no | 2 |
| geometry | geometry.measure | rectangle-perimeter | 2 | choice | verbal-diagram | apply | 2 | choice | calculation.muldiv | geometry-area-perimeter | sí | no | 1 |
| geometry | geometry.measure | area-or-perimeter | 2 | choice | verbal-diagram | select-formula | 1 | choice | calculation.muldiv | geometry-area-perimeter | sí | no | 1 |
| geometry | geometry.measure | geometry-data-sufficiency | 1 | choice | diagram | evaluate-information | 1 | choice | calculation.muldiv | geometry-area-perimeter | no | no | 1 |
| geometry | geometry.measure | area-vs-perimeter | 3 | choice | worked-error | diagnose | 1 | choice | calculation.muldiv | geometry-area-perimeter | no | no | 1 |
| geometry | geometry.measure | inverse-area | 3 | numeric | diagram | inverse | 2 | numeric | calculation.muldiv | — | sí | no | 1 |
| data | data.interpretation | read-value | 1 | choice | bar-chart, table | interpret | 1 | choice | — | graph-reading | no | sí | 2 |
| data | data.interpretation | aggregate-data | 1 | choice | table | calculate | 2 | choice | — | data-compare | no | no | 1 |
| data | data.interpretation | compare-data | 2 | choice | bar-chart | calculate | 2 | choice | — | data-compare | sí | no | 1 |
| data | data.interpretation | identify-trend | 2 | choice | line-chart | interpret | 2 | choice | — | data-trend | sí | no | 1 |
| data | data.interpretation | justify-conclusion | 3 | compound-choice | bar-chart | justify | 2 | compound-choice | — | data-conclusion | sí | no | 1 |
| data | data.interpretation | unsupported-conclusion | 3 | choice | bar-chart | evaluate-claim | 1 | choice | — | data-conclusion | no | no | 1 |
| numbers | measurement.units | convert-length | 1 | units-length | symbolic | execute | 1 | numeric | calculation.muldiv | unit-conversion | sí | no | 1 |
| numbers | measurement.units | estimate-length | 1 | choice | verbal | estimate | 1 | choice | calculation.muldiv | estimate-magnitude | no | no | 1 |
| numbers | measurement.units | choose-unit | 1 | choice | verbal-context | select-unit | 1 | choice | calculation.muldiv | estimate-magnitude | no | no | 1 |
| numbers | measurement.units | scale-conversion | 2 | choice | verbal-context | apply | 2 | choice | calculation.muldiv | unit-conversion | sí | no | 1 |
| numbers | measurement.units | convert-time | 2 | numeric | symbolic | execute | 1 | numeric | calculation.muldiv | unit-conversion | no | no | 1 |
| numbers | measurement.units | conversion-factor-error | 2 | choice | worked-error | diagnose | 2 | choice | calculation.muldiv | unit-conversion | no | no | 1 |
| numbers | measurement.units | convert-capacity | 2 | numeric | symbolic | execute | 1 | numeric | calculation.muldiv | unit-conversion | no | no | 1 |
| numbers | measurement.units | length-multistep | 3 | numeric | verbal-context | apply | 2 | numeric | calculation.muldiv | multistep-strategy | sí | no | 1 |

## Formats i generadors incorporats

### Fraccions

Per a significat, equivalència i simplificació s’han afegit model verbal, correspondència visual i diagnòstic d’un pas de simplificació. Cadascuna de les sis operacions disposa ara de quatre famílies reals:

1. càlcul simbòlic;
2. completació o selecció del pas;
3. detecció d’un error específic;
4. aplicació contextual breu.

Les variants conserven `procedureId`. La simplificació de denominadors diferents, multiplicació o divisió utilitza nombres més petits però no canvia d’operació.

### Decimals i percentatges

S’han afegit valor posicional i comprovació de plausibilitat decimal. Percentatges separa ara significat visual, conversió, càlcul d’una part, cerca del total, cerca de la taxa, descompte i augment. No s’han afegit les quatre operacions decimals perquè no formaven part explícita del banc decidit.

### Equacions, geometria, dades i unitats

- equacions: selecció del següent pas i error específic de distributiva;
- geometria: selecció de fórmula i suficiència de dades;
- dades: lectura equivalent en taula i detecció de conclusions causals no suportades;
- unitats: elecció d’unitat i diagnòstic de direcció/factor de conversió.

## Metadades

`daily-bank-metadata.js` centralitza `skill`, `procedure`, `level`, `representation`, `reasoningType`, `stepCount`, `answerType`, `formatFamily`, `diagnosticTags`, `supportsSimplification` i `supportsTransfer`. `supportsTransfer` només és cert quan el mateix procediment té una representació cognitivament alternativa; `supportsSimplification` només ho és quan el generador pot reduir càrrega sense substituir el procediment.

Els identificadors històrics no s’han reescrit. Les entrades noves amplien `FORMAT_TAXONOMY`; `describeFormat` continua interpretant l’evidència antiga amb les claus anteriors.

## Integració amb selector i estancament

Els nous formats formen part de `TARGETS`, per tant competeixen sota la jerarquia existent en consolidació, reparació, transferència, confirmació i diagnòstic. No s’han canviat prioritats. Només s’ha afegit un límit dur de sis activitats consecutives d’una habilitat: l’ampliació revelava que moltes alternatives de reparació de fraccions podien evitar indefinidament el guard anterior. És una correcció directa del comportament provocat pel banc, no un reequilibri artificial.

La generació amb dificultat reduïda respecta `targetProcedure`. Això corregeix els casos en què `written-division`, `divide-fractions`, `unknown-both-sides`, `equation-parentheses`, `inverse-area` o `length-multistep` podien convertir-se silenciosament en un altre procediment.

## Comparació abans/després

| Mètrica | Abans | Després |
|---|---:|---:|
| Candidats/formats seleccionables | 50 | 85 |
| Parelles habilitat–procediment | 47 | 58 |
| Procediments amb ≥2 alternatives | 2 | 13 |
| Representacions per operació de fraccions | 1 | 4 |
| Operacions de fraccions amb diagnòstic específic | 0/6 | 6/6 |
| Operacions de fraccions amb context | 0/6 | 6/6 |
| Procediments percentuals explícits | 3 | 7 |
| Activitats explícites contra causalitat no suportada | 0 | 1 |
| Formats amb metadades obligatòries en temps d’execució | parcial | 100% dels candidats validats |

Les simulacions del selector continuen sense repeticions injustificades de plantilla, sense cadenes consecutives de transferència o exploració i amb una cadena màxima d’habilitat limitada. `coverage_balance` continua existint quan no hi ha cap necessitat superior; no s’han alterat llindars per reduir-ne artificialment l’ús.

## Cobertura interna per nivell

- Nivell 1: concepte explícit, representació directa, lectura o selecció simple.
- Nivell 2: completació de passos, comparació, aplicació directa i primera inversió.
- Nivell 3: signes, múltiples passos, diagnòstic, justificació i interpretació.
- Nivell 4: divisió de fraccions, parèntesis i càlcul mixt, amb variants diagnòstiques o contextuals quan el procediment ho permet.

No totes les habilitats necessiten quatre nivells. Aplicacions, decimals, geometria, dades i unitats mantenen tres; concepte de fracció en manté dos. El banc ja no fingeix un nivell addicional només fent créixer els nombres.

## Limitacions obertes

- Multiplicació/divisió bàsica continua sent principalment simbòlica.
- Aplicacions de fraccions tenen contextos diferents, però cada procediment individual conserva una plantilla cognitiva principal.
- Comparació i ordenació decimals encara podrien guanyar una representació tabular addicional.
- Figures compostes no s’han afegit perquè la cobertura actual no les declarava.
- La justificació continua sent estructurada i autocorrectiva, no text lliure.
- Les etiquetes diagnòstiques descriuen allò que la pregunta pot discriminar; no converteixen automàticament una resposta incorrecta en un diagnòstic causal.

## Simulació del selector: abans i després

Cada fila resumeix 300 decisions. Les columnes mostren `repetició de procediment / transferència / coverage_balance / confirmació / quota màxima d’habilitat / cadena màxima` en percentatge, excepte la cadena.

| Perfil | Abans | Després |
|---|---|---|
| Inicial | 4 / 0 / 3,3 / 3,7 / 24 / 5 | 4 / 3 / 5,0 / 0,3 / 21 / 5 |
| Intermedi | 3 / 0 / 2,0 / 1,7 / 25 / 5 | 8 / 1 / 2,0 / 0,7 / 24 / 5 |
| Avançat | 0 / 0 / 8,0 / 0,7 / 22 / 3 | 3 / 1 / 5,7 / 0 / 19 / 3 |
| Irregular | 22 / 0 / 0 / 0 / 16 / 5 | 18 / 0 / 0 / 0 / 16 / 6 |
| Dependent | 6 / 0 / 29,3 / 0 / 42 / 3 | 9 / 0 / 27,0 / 0 / 43 / 3 |
| Desigual | 6 / 0 / 33,3 / 0 / 43 / 5 | 6 / 0 / 33,3 / 0 / 43 / 5 |
| Falsa fluïdesa | 1 / 1 / 3,3 / 1,3 / 18 / 3 | 5 / 6 / 0,7 / 0 / 20 / 5 |

La repetició de **procediment** augmenta en alguns perfils perquè ara el mateix coneixement es comprova amb representacions diferents; la repetició injustificada de **plantilla** continua a zero. L’augment de transferència en falsa fluïdesa és esperat i correspon a alternatives reals. La quota màxima no empitjora de manera general i cap cadena supera el límit dur de sis.

Abans, 45 de 50 candidats (90%) pertanyien a procediments sense alternativa seleccionable. Després són 45 de 85 (52,9%). Encara hi ha 32 de 58 procediments sense simplificació declarada i 46 sense transferència pròpia; molts són procediments atòmics de nivell 1 on fingir una reducció o una altra representació seria pedagògicament incorrecte.
