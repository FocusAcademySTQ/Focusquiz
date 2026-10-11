# Auditoria pedagògica de la Sessió diària

Data de revisió: 3 d’octubre de 2026. Abast: implementació existent; no s’ha ampliat el banc ni s’han afegit àrees, IA, correu o sincronització.

## 1. Problemes detectats i correccions

1. **«Format» barrejava plantilla i variació cognitiva.** Barra, pastís i graella comptaven com tres formats tot i demanar exactament interpretar part/tot; impost i augment també duplicaven el mateix procediment. S’ha afegit una taxonomia cognitiva i l’evidència conserva alhora l’identificador brut i el significatiu.
2. **Operacions de fraccions massa agrupades.** Una lliçó ajuntava suma/resta i una altra multiplicació/divisió. S’han separat quatre procediments sense crear habilitats artificials: suma/resta amb denominador igual, suma/resta amb denominador diferent, multiplicació i divisió.
3. **Pèrdua diagnòstica fora del diagnòstic inicial.** El primer error d’una activitat normal només quedava a `attempts`; domini rebia únicament el final assistit. Ara el primer error sempre crea una evidència autònoma idempotent i conserva `firstAnswer`.
4. **La comprovació posterior a la solució no estava garantida.** La documentació deia que es programava, però l’adaptador només canviava el text del motiu. Ara reserva una activitat futura del mateix procediment, exigeix una variant diferent i la marca `verification`.
5. **Possibilitat de focus llarg.** En perfils que encara no reunien diversitat cognitiva, la mateixa habilitat podia ocupar sis dies. Després de tres focus consecutius es rota a una altra habilitat preparada; no s’infereix domini per fer-ho.
6. **Exemples massa compactes.** Especialment geometria no explicava per què es multiplicava o sumava. Els passos ara expliciten superfície, contorn i unitats.

## 2. Auditoria de microlliçons

| Habilitat | Procediment | Microlliçó | Objectiu | Punts forts | Problema detectat | Canvi recomanat/aplicat |
|---|---|---|---|---|---|---|
| Concepte de fracció | Interpretar part/tot | `fraction-meaning` | Interpretar una fracció com una part d’un tot | Visual informatiu i vocabulari directe | Cap error clar | Mantenir; vigilar que totes les parts siguin iguals |
| Equivalència | Escalar els dos termes | `fraction-equivalence` | Construir equivalents | Explica que el valor no canvia | La comprovació demana factor i el guiat l’aplica: seqüència adequada | Mantenir |
| Simplificació | Divisor comú fins irreductible | `fraction-simplify` | Arribar a forma irreductible | Passos correctes i breus | No ensenya a trobar el màxim divisor, però no és necessari en aquesta microlliçó | Mantenir sense ampliar |
| Operacions de fraccions | Suma/resta, denominador igual | `fraction-add-same` | Operar parts de la mateixa mida | Explica per què es conserva el denominador | Abans estava barrejat amb denominadors diferents | **Separada i reescrita** |
| Operacions de fraccions | Suma/resta, denominador diferent | `fraction-add-different` | Crear denominador comú i operar | Justifica el múltiple i cada equivalència | Abans el guiat amb denominador igual no preparava l’autònom difícil | **Separada i guiat alineat** |
| Operacions de fraccions | Multiplicació | `fraction-multiply` | Multiplicar termes i simplificar | Exemple complet amb simplificació | Abans compartia lliçó amb divisió però no explicava realment multiplicació | **Separada** |
| Operacions de fraccions | Divisió | `fraction-divide` | Transformar divisió en producte per la inversa | Indica quina fracció s’inverteix i conclou el càlcul | Abans el resultat final quedava implícit | **Separada i completada** |
| Equacions | Aïllar la incògnita | `linear-equation` | Preservar la igualtat | Cada operació es fa als dos membres | No cobreix encara incògnita als dos membres o parèntesis | Mantenir com a lliçó del procediment bàsic; risc documentat |
| Percentatges | Augment/descompte | `percent-change` | Calcular part i total final | Diferencia sumar i restar | El guiat calcula la part, no tot un augment | Acceptable com bastida curta; pendent observar transferència |
| Geometria | Àrea i perímetre de rectangle | `geometry-area-perimeter` | Distingir superfície i contorn | Dibuix necessari, mesures i unitats | Els passos només donaven operacions | **Afegit el perquè de multiplicar/sumar** |
| Dades | Llegir i comparar gràfic | `graph-reading` | Llegir escala, valors i diferència | Visual aporta les dades reals | L’escala no es dibuixa, tot i que el text la menciona | Mantenir per ara; el valor escrit evita ambigüitat |
| Mesura | Conversió m–cm | `unit-conversion` | Aplicar el factor en la direcció correcta | Equivalència i direcció explícites | No generalitza a capacitat o temps | Mantenir com a procediment de longitud; risc documentat |

Cap microlliçó crea evidència de domini. Les respostes de comprovació i exemple guiat es desen i es recuperen després de recarregar.

## 3. Procediments per habilitat

«Separat» significa evidència distingible dins l’habilitat, no necessàriament una habilitat nova.

| Habilitat | Procediments existents | Agrupació mantinguda | Separació necessària | Evidència per considerar-lo conegut | Microlliçó |
|---|---|---|---|---|---|
| Multiplicació i divisió | fets, algorismes de dues xifres, signe, dos passos | Multiplicació/divisió comparteixen habilitat prerequisit | Identificador separa fets, escrit, signe i mixt | Encert autònom del procediment a la dificultat corresponent | — |
| Concepte de fracció | part/tot en graella, barra, cercle | Les tres representacions són el mateix procediment | No separar per forma | Encert autònom d’interpretació; canviar forma no afegeix diversitat cognitiva | `fraction-meaning` |
| Equivalència | terme que falta al numerador o denominador | Una relació multiplicativa | No separar: canvia la posició de la incògnita, no el raonament | Completar autònomament una relació equivalent | `fraction-equivalence` |
| Simplificació | dividir per factor comú fins irreductible | Un procediment | No separar per valors | Fracció final equivalent i irreductible sense ajuda | `fraction-simplify` |
| Operacions de fraccions | suma/resta igual denominador; suma/resta diferent; producte; quocient | Suma i resta comparteixen lògica dins cada cas de denominadors | **Quatre procediments cognitius diferenciats** | Un encert autònom per procediment no prova els altres; promoció requereix la diversitat significativa configurada | Quatre lliçons específiques |
| Aplicacions de fraccions | repartiment, comparació, escala de recepta, recuperar el tot | Contextos dins una habilitat d’aplicació | Separar quotient, comparació, proporcionalitat i recuperació del tot | Resoldre autònomament el model corresponent amb dades noves | — |
| Decimals | comparar, ordenar, convertir representació, descompte | Comparar/ordenar relacionats però no idèntics | Conversió i aplicació són procediments diferents | Encert autònom en almenys dos formats cognitius per domini/promoció | — |
| Percentatges | equivalència, descompte, augment/impost, comparació | Augment i impost són el mateix procediment | Descompte separat d’augment | Calcular part i total final autònomament en cada direcció | `percent-change` (canvi percentual) |
| Equacions lineals | un pas, dos passos, completar, justificar, detectar error, dos membres, parèntesis | Completar/justificar poden ser evidències del procediment de dos passos | Separar dos membres i parèntesis | Solució correcta autònoma; justificar/detectar no substitueix sempre executar | `linear-equation` (bàsica) |
| Geometria | àrea, perímetre, estimació, costat desconegut, detectar confusió | Context del marc és perímetre | Separar àrea, perímetre i inversa de l’àrea | Resultat, unitat i selecció de fórmula correctes sense ajuda | `geometry-area-perimeter` |
| Dades | llegir valor, sumar taula, comparar, tendència, justificar | Lectura i justificació dins interpretació de dades | Representació i raonament queden identificats | Lectura/càlcul/conclusió correctes; en compostes també justificació correcta | `graph-reading` |
| Unitats | estimar, longitud, escala, temps, capacitat, multi-pas | Conversions comparteixen estructura multiplicativa | Magnitud i aplicació multi-pas diferenciades | Factor, direcció, valor i unitat correctes sense ajuda | `unit-conversion` (longitud) |

## 4. Definició final de «format diferent»

Un format és la tupla:

`procediment | representació | nivell de raonament | nombre de passos | tipus de resposta`

El context es desa per auditar-lo, però només diferencia format si obliga a canviar procediment; noms, valors, ordre, disposició o decoració no compten. Exemples:

- graella/barra/pastís per identificar part/tot: **un sol format cognitiu**;
- impost i augment d’un preu: **un sol format cognitiu**;
- llegir una barra i interpretar una tendència: **dos formats**;
- sumar fraccions i dividir fraccions: **dos procediments** encara que tots dos siguin simbòlics.

Les xifres històriques 32–33 eren parelles `habilitat:formatFamily`, no una mesura vàlida: podien inflar representacions cosmètiques i alhora amagar procediments diferents dins `symbolic`. La simulació ara genera l’activitat real i compta la tupla cognitiva. Amb llavor fixa obté 33, 27 i 33 parelles per als perfils inicial, intermedi i avançat; aquestes xifres sí són auditables, però no són un objectiu pedagògic.

## 5. Regles finals de progressió

- **Promoció:** 3 encerts autònoms al nivell actual i la diversitat cognitiva exigida per l’habilitat (1 quan només existeix un procediment real; 2 quan n’hi ha diversos).
- **Domini:** 5 encerts autònoms, en almenys 2 dies i amb la diversitat significativa configurada.
- **Ajuda:** pista, microlliçó o solució mai compten com encert autònom ni promocionen.
- **Baixada:** 3 errors autònoms si afecten almenys 2 formats cognitius; calen 4 si tots són del mateix format. Un encert redueix el comptador d’errors i un error redueix el d’encerts.
- **Exploració:** un encert diagnòstic autònom programa una pregunta un nivell superior, però no canvia per si sol l’estimació.
- **Rotació:** després de 3 dies amb el mateix focus es prova una altra habilitat preparada, sense alterar nivell ni domini.
- **Solució:** consultar-la no crea domini; programa una comprovació del mateix procediment amb variant nova.

## 6. Resultats dels set casos simulats

| Cas | Inicial | Seqüència i comptadors finals | Resultat | Exploració | Canvi | Coherent |
|---|---:|---|---:|---|---|---|
| 1. Encert estable | Àlgebra 1 | C, C, C en 2 formats; autònoms 3, errors 0 | 2 | No | Puja una vegada | Sí |
| 2. Alterna | Dades 2 | C,E ×4; els comptadors es compensen | 2 | No | Cap | Sí, no oscil·la |
| 3. Falla format nou | Dades 2 | C,C en habituals; E en justificació nova; autònoms 1, errors 1 després compensació | 2 | No | Cap | Sí, un format nou no penalitza |
| 4. Només amb pistes | Àlgebra 1 | 6 C assistits; autònoms 0 | 1 | No | Cap | Sí |
| 5. Errors en un format | Àlgebra 3 | E,E,E: es manté; quart E: baixa | 2 | No | Una baixada | Sí |
| 6. Avançat | Àlgebra 1 | 1 C diagnòstic; autònoms 1 | 1 estimat; pregunta següent a 2 | Sí | No promociona encara | Sí, explora ràpid |
| 7. Desigual entre procediments/habilitats | Operacions 2; aplicacions 1 | 2 C en suma/resta; 3 E en recuperar el tot | 2 i 1 | No | Sense contaminació entre habilitats | Sí |

## 7. Recorregut complet d’un error

1. **Primera resposta incorrecta:** es desa a `item.attempts[0]`, `firstAnswer` i una evidència `:first` amb `assistance: none`.
2. **Primera pista:** `hintsUsed` i `draftAssistance: hint`; no crea evidència.
3. **Segon intent:** queda a `attempts[1]` amb ajuda. Si és correcte, l’evidència final és correcta però assistida i no promociona.
4. **Ajuda completa/solució:** `solutionViewed: true`, final amb `assistance: solution`; no crea encert autònom i tampoc duplica l’error autònom.
5. **Activitat semblant:** una futura activitat de la mateixa habilitat/procediment passa a `verification`, conserva el `formatFamily` i desa `mustDifferFromVariant`.
6. **Comprovació:** si la variant nova es resol sense ajuda, crea una evidència autònoma nova. Una sola comprovació no basta per promocionar.
7. **Recàrrega:** exercici generat, primera resposta, intents, ajuda, solució i descriptor de comprovació formen part de la sessió serialitzada i reapareixen exactament.

## 8. Riscos pedagògics pendents

- Falten microlliçons específiques per decimals, repartiment/escala de fraccions, equacions amb incògnita als dos membres o parèntesis, tendències i conversions que no siguin longitud. No s’han afegit perquè ampliaria l’abast funcional.
- Els llindars (3/5, 2 dies, 3/4 errors) continuen sent heurístics; necessiten validació amb dades reals d’aula.
- La taxonomia descriu les plantilles actuals. Qualsevol plantilla futura ha d’entrar-hi explícitament o quedarà com `unspecified`, que deliberadament no infla diversitat.
- Una resposta d’opció múltiple pot sobreestimar comprensió; es mitiga exigint justificació en alguns formats, però no s’elimina.
