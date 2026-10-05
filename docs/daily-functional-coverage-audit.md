# Auditoria executable de cobertura funcional del banc diari

Data: 5 d’octubre de 2026. Abast: els 58 procediments existents. No s’han canviat llindars de domini, progressió, selector o estancament, ni s’han afegit àrees.

La fase parteix de 85 formats. L’ampliació mínima afegeix sis formats —tres per multiplicació bàsica i tres per divisió bàsica— i deixa el banc en **91**, sense crear procediments curriculars nous.

## Seqüència exacta de treball

1. **Congelar la línia base:** executar totes les proves i `daily-selector-simulation.test.js` sobre el commit inicial.
2. **Inventariar:** generar una activitat de cada `TARGET`, enriquir-la amb les metadades centrals i agrupar-la per `skillId:procedure`.
3. **Declarar necessitats:** aplicar una política explícita de capacitats necessàries; no inferir que tots els procediments necessiten simplificació o transferència.
4. **Classificar:** assignar Grup A, B o C i construir la matriu `disponible / falta i és necessària / no aplicable`.
5. **Localitzar colls d’ampolla:** creuar mancances amb traces de reparació, transferència, estancament i `coverage_balance`.
6. **Prioritzar:** implementar només mancances altes que bloquegen una decisió real; documentar les mitjanes i descartar les baixes artificials.
7. **Validar la variant:** demostrar procediment conservat, identitat cognitiva diferent, diagnòstic discriminant, resposta correcta i selecció efectiva.
8. **Comparar:** repetir les mateixes simulacions i explicar tant millores com regressions o mètriques sense canvi.
9. **Protegir compatibilitat:** verificar identificadors històrics, absència de duplicats i previsualització aïllada.
10. **Publicar:** executar `node scripts/audit-daily-bank.js --json`, suite completa, documentació, commit i PR.

## Com executar-la

```bash
node scripts/audit-daily-bank.js
node scripts/audit-daily-bank.js --json > /tmp/daily-bank-audit.json
node tests/daily-bank-functional-audit.test.js
node tests/daily-bank-bottleneck-simulation.test.js
```

La política és declarativa a `daily-bank-functional-audit.js`. No produeix una puntuació opaca: conserva la llista explícita de capacitats requerides, disponibles, no aplicables i absents.

## Criteris de classificació

- **Grup A — necessita ampliació:** falta almenys una capacitat que el procediment necessita i la manca té prioritat alta o mitjana.
- **Grup B — cobertura suficient:** totes les capacitats requerides són disponibles; les absents són no aplicables.
- **Grup C — no necessita alternativa:** procediment atòmic o ja mínim on reparació, simplificació o transferència addicional no canviaria una decisió pedagògica.

Llegenda de la matriu: **✓ disponible**, **⚠ necessària però absent**, **— no aplicable**.

## Matriu funcional i classificació dels 58 procediments

| Grup | Habilitat | Procediment | Intro | Guiada | Consol. | Simpl. | Repara | Diagn. | Transf. | Explora | Confirma | Repàs | Retorn | Justificació |
|---|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|---|
| B | calculation.muldiv | multiply-facts | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | Ara disposa de càlcul, relació inversa, selecció d’operació i diagnòstic; no cal simplificar per sota del nivell atòmic. |
| B | calculation.muldiv | divide-facts | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | Ara disposa de càlcul, relació inversa, model de grups i diagnòstic; no cal simplificar per sota del nivell atòmic. |
| B | calculation.muldiv | written-multiplication | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | ✓ | ✓ | ✓ | ✓ | Les funcions necessàries estan cobertes; no s’amplia per simetria. |
| B | calculation.muldiv | written-division | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | ✓ | ✓ | ✓ | ✓ | Les funcions necessàries estan cobertes; no s’amplia per simetria. |
| B | calculation.muldiv | signed-multiplication | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | ✓ | ✓ | ✓ | ✓ | Les funcions necessàries estan cobertes; no s’amplia per simetria. |
| B | calculation.muldiv | signed-division | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | ✓ | ✓ | ✓ | ✓ | Les funcions necessàries estan cobertes; no s’amplia per simetria. |
| B | calculation.muldiv | mixed-calculation | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | ✓ | ✓ | ✓ | ✓ | Les funcions necessàries estan cobertes; no s’amplia per simetria. |
| B | fractions.concept | fraction-meaning | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | Les funcions necessàries estan cobertes; no s’amplia per simetria. |
| B | fractions.equivalence | equivalence | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | Les funcions necessàries estan cobertes; no s’amplia per simetria. |
| B | fractions.simplification | simplification | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | Les funcions necessàries estan cobertes; no s’amplia per simetria. |
| B | fractions.operations | add-same-denominator | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | Les funcions necessàries estan cobertes; no s’amplia per simetria. |
| B | fractions.operations | subtract-same-denominator | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | Les funcions necessàries estan cobertes; no s’amplia per simetria. |
| B | fractions.operations | add-different-denominator | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Les funcions necessàries estan cobertes; no s’amplia per simetria. |
| B | fractions.operations | subtract-different-denominator | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Les funcions necessàries estan cobertes; no s’amplia per simetria. |
| B | fractions.operations | multiply-fractions | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Les funcions necessàries estan cobertes; no s’amplia per simetria. |
| B | fractions.operations | divide-fractions | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Les funcions necessàries estan cobertes; no s’amplia per simetria. |
| C | fractions.applications | fraction-as-quotient | — | — | ✓ | — | — | — | — | — | ✓ | ✓ | — | Procediment atòmic o ja mínim: una alternativa seria artificial. |
| C | fractions.applications | compare-same-denominator | — | — | ✓ | — | — | — | — | — | ✓ | ✓ | — | Procediment atòmic o ja mínim: una alternativa seria artificial. |
| A | fractions.applications | scale-fraction | ✓ | ✓ | ✓ | ⚠ | ⚠ | ⚠ | ⚠ | — | ✓ | ✓ | ⚠ | Falten simplificació, diagnòstic d’estratègia i canvi de representació. |
| A | fractions.applications | recover-whole | ✓ | ✓ | ✓ | ⚠ | ⚠ | ⚠ | ⚠ | — | ✓ | ✓ | ⚠ | La inversió és propensa a errors i encara no té diagnòstic ni representació alternativa. |
| C | numbers.decimals | place-value | ✓ | ✓ | ✓ | — | — | — | — | — | ✓ | ✓ | — | Procediment atòmic o ja mínim: una alternativa seria artificial. |
| A | numbers.decimals | compare-decimals | ✓ | ✓ | ✓ | — | ⚠ | — | ⚠ | — | ✓ | ✓ | ⚠ | Falta la transferència a taula posicional. |
| A | numbers.decimals | convert-representation | ✓ | ✓ | ✓ | — | ⚠ | — | ⚠ | — | ✓ | ✓ | ⚠ | La conversió és relacional i encara només té un format seleccionable. |
| A | numbers.decimals | order-decimals | ✓ | ✓ | ✓ | — | ⚠ | — | ⚠ | — | ✓ | ✓ | ⚠ | Falta contrastar la recta numèrica amb descomposició o taula. |
| C | numbers.decimals | estimate-decimal | — | — | ✓ | — | — | — | — | — | ✓ | ✓ | — | Procediment atòmic o ja mínim: una alternativa seria artificial. |
| A | numbers.decimals | percentage-decrease | ✓ | ✓ | ✓ | ⚠ | ⚠ | — | — | — | ✓ | ✓ | ⚠ | Aplicació existent, però sense alternativa de reparació dins aquesta habilitat. |
| A | numbers.decimals | percentage-increase | ✓ | ✓ | ✓ | ⚠ | ⚠ | — | — | — | ✓ | ✓ | ⚠ | Té contextos d’augment, però no una reparació diagnòstica pròpia. |
| C | percentages.meaning | identify-percentage | ✓ | ✓ | ✓ | — | — | — | — | — | ✓ | ✓ | — | Procediment atòmic o ja mínim: una alternativa seria artificial. |
| A | percentages.meaning | convert-representation | ✓ | ✓ | ✓ | — | ⚠ | — | ⚠ | — | ✓ | ✓ | ⚠ | La conversió és relacional i encara només té un format seleccionable. |
| A | percentages.meaning | calculate-percentage-part | ✓ | ✓ | ✓ | ⚠ | ⚠ | ⚠ | — | — | ✓ | ✓ | ⚠ | Falta distingir confusió entre part, total i taxa. |
| A | percentages.meaning | find-percentage-rate | ✓ | ✓ | ✓ | — | ⚠ | ⚠ | — | — | ✓ | ✓ | ⚠ | Falta diagnosticar quin total s’ha pres com a referència. |
| A | percentages.meaning | find-percentage-total | ✓ | ✓ | ✓ | ⚠ | ⚠ | ⚠ | — | — | ✓ | ✓ | ⚠ | Falta diagnosticar la inversió i oferir una versió de menor càrrega. |
| A | percentages.meaning | percentage-decrease | ✓ | ✓ | ✓ | ⚠ | ⚠ | — | — | — | ✓ | ✓ | ⚠ | Té pràctica però no una reparació específica del canvi percentual. |
| A | percentages.meaning | percentage-increase | ✓ | ✓ | ✓ | ⚠ | ⚠ | — | — | — | ✓ | ✓ | ⚠ | Té contextos d’augment, però no una reparació diagnòstica pròpia. |
| C | algebra.linear | solve-one-step | ✓ | ✓ | ✓ | — | — | — | — | — | ✓ | ✓ | — | Procediment atòmic o ja mínim: una alternativa seria artificial. |
| B | algebra.linear | solve-two-step | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Les funcions necessàries estan cobertes; no s’amplia per simetria. |
| A | algebra.linear | unknown-both-sides | — | — | ✓ | ✓ | ✓ | ⚠ | — | ✓ | ✓ | ✓ | ✓ | Falta aïllar errors de signe i moviment de termes. |
| B | algebra.linear | equation-parentheses | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Les funcions necessàries estan cobertes; no s’amplia per simetria. |
| B | geometry.measure | rectangle-area | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | ✓ | Les funcions necessàries estan cobertes; no s’amplia per simetria. |
| B | geometry.measure | rectangle-perimeter | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | — | ✓ | ✓ | ✓ | Les funcions necessàries estan cobertes; no s’amplia per simetria. |
| B | geometry.measure | area-or-perimeter | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | ✓ | ✓ | ✓ | Les funcions necessàries estan cobertes; no s’amplia per simetria. |
| C | geometry.measure | geometry-data-sufficiency | ✓ | ✓ | ✓ | — | ✓ | ✓ | — | — | ✓ | ✓ | ✓ | Procediment atòmic o ja mínim: una alternativa seria artificial. |
| B | geometry.measure | area-vs-perimeter | ✓ | ✓ | ✓ | — | ✓ | ✓ | — | — | ✓ | ✓ | ✓ | Les funcions necessàries estan cobertes; no s’amplia per simetria. |
| B | geometry.measure | inverse-area | — | — | ✓ | ✓ | ✓ | — | — | ✓ | ✓ | ✓ | ✓ | Les funcions necessàries estan cobertes; no s’amplia per simetria. |
| B | data.interpretation | read-value | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | — | ✓ | ✓ | ✓ | Les funcions necessàries estan cobertes; no s’amplia per simetria. |
| C | data.interpretation | aggregate-data | ✓ | ✓ | ✓ | — | — | — | — | — | ✓ | ✓ | — | Procediment atòmic o ja mínim: una alternativa seria artificial. |
| B | data.interpretation | compare-data | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | — | ✓ | ✓ | ✓ | Les funcions necessàries estan cobertes; no s’amplia per simetria. |
| B | data.interpretation | identify-trend | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | — | ✓ | ✓ | ✓ | Les funcions necessàries estan cobertes; no s’amplia per simetria. |
| B | data.interpretation | justify-conclusion | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | ✓ | ✓ | ✓ | Les funcions necessàries estan cobertes; no s’amplia per simetria. |
| B | data.interpretation | unsupported-conclusion | ✓ | ✓ | ✓ | — | ✓ | ✓ | — | — | ✓ | ✓ | ✓ | Les funcions necessàries estan cobertes; no s’amplia per simetria. |
| B | measurement.units | convert-length | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | — | ✓ | ✓ | ✓ | Les funcions necessàries estan cobertes; no s’amplia per simetria. |
| C | measurement.units | estimate-length | ✓ | ✓ | ✓ | — | — | — | — | — | ✓ | ✓ | — | Procediment atòmic o ja mínim: una alternativa seria artificial. |
| C | measurement.units | choose-unit | ✓ | ✓ | ✓ | — | ✓ | ✓ | — | — | ✓ | ✓ | ✓ | Procediment atòmic o ja mínim: una alternativa seria artificial. |
| A | measurement.units | scale-conversion | ✓ | ✓ | ✓ | ✓ | ✓ | ⚠ | — | — | ✓ | ✓ | ✓ | El diagnòstic de factor existeix com un altre procediment i no pot reparar directament aquest. |
| C | measurement.units | convert-time | ✓ | ✓ | ✓ | — | — | — | — | — | ✓ | ✓ | — | Procediment atòmic o ja mínim: una alternativa seria artificial. |
| B | measurement.units | conversion-factor-error | ✓ | ✓ | ✓ | — | ✓ | ✓ | — | — | ✓ | ✓ | ✓ | Les funcions necessàries estan cobertes; no s’amplia per simetria. |
| C | measurement.units | convert-capacity | ✓ | ✓ | ✓ | — | — | — | — | — | ✓ | ✓ | — | Procediment atòmic o ja mínim: una alternativa seria artificial. |
| B | measurement.units | length-multistep | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | ✓ | ✓ | ✓ | ✓ | Les funcions necessàries estan cobertes; no s’amplia per simetria. |

## Colls d’ampolla detectats

| Perfil/traça | Habilitat | Procediment | Motiu | Alternativa absent | Conseqüència inicial |
|---|---|---|---|---|---|
| dependent d’ajuda | calculation.muldiv | multiply-facts | reparació | diagnòstic i model invers | podia alternar reparació simbòlica, reensenyament genèric i pausa sense identificar l’operació |
| dependent d’ajuda | calculation.muldiv | divide-facts | reparació | agrupació, relació inversa i error específic | la resposta final no distingia divisió de resta o dificultat de taules |
| falsa fluïdesa | numbers.decimals | compare-decimals | transferència | taula posicional | només hi ha comparació simbòlica; continua pendent amb prioritat mitjana |
| intermedi | fractions.applications | scale-fraction | reparació | selecció d’operació i diagnòstic | la plantilla contextual es pot repetir sense nova informació |
| intermedi | fractions.applications | recover-whole | estancament | versió simplificada i diagnòstic invers | pot arribar a pausa perquè el banc no ofereix una intervenció millor |
| irregular | percentages.meaning | find-percentage-total | reparació | diagnòstic part/total/taxa | una resposta final incorrecta no permet atribuir la causa |
| desigual | algebra.linear | unknown-both-sides | diagnòstic | error de signe/moviment | la reparació continua sent genèrica |
| desigual | measurement.units | scale-conversion | diagnòstic | error de factor dins del mateix procediment | el diagnòstic existent té un `procedureId` diferent i no repara directament l’escala |

No s’han implementat les mancances mitjanes en aquesta fase: les traces no mostren un bucle tan greu com el del càlcul bàsic i ampliar-les totes tornaria a inflar el banc.

## Ampliació mínima implementada

Només s’han ampliat `multiply-facts` i `divide-facts`, que eren els dos colls d’ampolla d’alta prioritat. Cada procediment conserva el càlcul simbòlic i incorpora tres alternatives reutilitzables:

1. **família de fets:** relaciona multiplicació i divisió com a operacions inverses;
2. **selecció d’operació en grups iguals:** diferencia modelar de calcular;
3. **error treballat:** discrimina suma en lloc de multiplicació o resta en lloc de divisió.

La primera activitat de reparació pot continuar sent simbòlica. Si no aporta informació, la segona passa a `fact-error`; la simulació específica comprova exactament `arith → fact-error`. Amb tres èxits només simbòlics, el selector escull una representació no simbòlica amb `representation_transfer`.

No s’ha declarat simplificació artificial per als fets bàsics: ja són procediments atòmics de nivell 1. El generador sí admet nombres més petits quan una intervenció demana menor càrrega, però això no es presenta com un nivell curricular inferior.

## Diagnòstic fiable

Les etiquetes diagnòstiques només es conserven quan la resposta discrimina una decisió o error concret. S’han retirat etiquetes de respostes finals de percentatge, plausibilitat i context de fraccions que no permetien inferir la causa. Les noves etiquetes són:

- `operation-selection`, només en una pregunta que demana seleccionar l’operació;
- `addition-instead-of-multiplication`, davant un procediment treballat incorrecte;
- `subtraction-instead-of-division`, davant un procediment treballat incorrecte.

Una resposta incorrecta al càlcul simbòlic continua sent només un error de resultat, no un diagnòstic inventat.

## Cobertura funcional abans/després

| Mètrica funcional | Abans | Després |
|---|---:|---:|
| Grup A | 17 | 15 |
| Grup B | 29 | 31 |
| Grup C | 12 | 12 |
| Capacitats necessàries absents | 55 | 47 |
| Colls d’ampolla d’alta prioritat | 2 | 0 |
| Representacions de `multiply-facts` | 1 | 4 |
| Representacions de `divide-facts` | 1 | 4 |
| Diagnòstic discriminant en fets bàsics | no | sí |
| Transferència real en fets bàsics | no | sí |

No s’ha intentat reduir a zero les 47 mancances: corresponen a 15 procediments del Grup A amb prioritat mitjana i es mostren explícitament a la matriu.

## Simulacions principals abans/després

Cada cel·la mostra `repetició de procediment / transferència / reparacions / coverage_balance / confirmació / quota màxima d’habilitat / cadena màxima`, sobre 300 decisions.

| Perfil | Abans | Després |
|---|---|---|
| Inicial | 4 / 3 / 33 / 5,0 / 0,3 / 21 / 5 | 4 / 4 / 33 / 6,0 / 0,3 / 17 / 5 |
| Intermedi | 8 / 1 / 18 / 2,0 / 0,7 / 24 / 5 | 6 / 1 / 31 / 1,3 / 0 / 22 / 5 |
| Avançat | 3 / 1 / 0 / 5,7 / 0 / 19 / 3 | 1 / 1 / 0 / 6,0 / 0 / 18 / 3 |
| Irregular | 18 / 0 / 101 / 0 / 0 / 16 / 6 | 19 / 0 / 115 / 0 / 0 / 19 / 6 |
| Dependent | 9 / 0 / 108 / 27,0 / 0 / 43 / 3 | 10 / 0 / 108 / 27,0 / 0 / 43 / 3 |
| Desigual | 6 / 0 / 106 / 33,3 / 0 / 43 / 5 | 7 / 0 / 106 / 33,3 / 0 / 43 / 5 |
| Falsa fluïdesa | 5 / 6 / 12 / 0,7 / 0 / 20 / 5 | 5 / 9 / 12 / 0 / 0 / 21 / 5 |

Interpretació honesta:

- la transferència augmenta on hi ha autonomia prèvia, especialment en falsa fluïdesa;
- la repetició baixa en intermedi i avançat, però no en tots els perfils;
- el total de reparacions no baixa en perfils que continuen generant errors: ara algunes reparacions són diagnòstiques, no menys nombroses;
- `coverage_balance` de dependent i desigual no canvia perquè el coll d’ampolla principal és l’accés curricular/prerequisits, no el nombre de formats;
- irregular registra més reparacions: les alternatives vàlides permeten continuar reparant procediments diferents. No s’ha alterat cap llindar per maquillar aquesta mètrica;
- la simulació específica confirma que la segona reparació de multiplicació i divisió deixa de repetir la plantilla simbòlica.

## Procediments que correctament continuen sense simplificació

Els procediments atòmics de Grup C —`fraction-as-quotient`, `compare-same-denominator`, `place-value`, `estimate-decimal`, `identify-percentage`, `solve-one-step`, `geometry-data-sufficiency`, `aggregate-data`, `estimate-length`, `choose-unit`, `convert-time` i `convert-capacity`— ja són la forma directa o mínima. Una “simplificació” canviaria el procediment o eliminaria justament el coneixement que s’ha d’observar.

`multiply-facts` i `divide-facts` tampoc declaren un nivell inferior: utilitzen càrrega numèrica reduïda quan cal, però conserven la mateixa estructura.

## Procediments que correctament continuen sense transferència

No es força transferència en conversions directes de temps/capacitat, estimacions atòmiques, suficiència d’una dada única, càlcul escrit o amb signes, i procediments on una segona representació només seria decorativa. La columna `—` de la matriu significa no aplicable, no una mancança.

## Limitacions obertes

1. Les aplicacions de fraccions `scale-fraction` i `recover-whole` són la mancança mitjana més completa: simplificació, diagnòstic i transferència.
2. Comparació i ordenació decimals encara no disposen de taula/descomposició seleccionable.
3. Part, total i taxa percentual necessiten diagnòstics treballats abans d’atribuir causes.
4. `unknown-both-sides` no aïlla errors de signe.
5. `scale-conversion` no reutilitza encara el diagnòstic de factor sota el mateix procediment.
6. L’auditoria avalua disponibilitat funcional; la validació amb alumnat real continua sent necessària per confirmar la utilitat de cada alternativa.
