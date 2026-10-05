# Sessió diària — fase 2: profunditat i estabilitat

## 1. Microlliçons i procediments coberts

S’han afegit onze microlliçons específiques, sense generar contingut amb IA:

| Microlliçó | Procediment del banc | Decisió pedagògica |
|---|---|---|
| `decimal-place-value` | Valor posicional | Disponible per inspecció i reforç; el banc encara no té un exercici autònom exclusiu d’aquest procediment. |
| `decimal-compare` | Comparar decimals | Alinea comes i compara posicions, no suma xifres. |
| `decimal-order` | Ordenar decimals | Explica per què els zeros finals no canvien el valor. |
| `decimal-representations` | Decimal–fracció–percentatge | Només s’activa per la plantilla de representacions existent. |
| `estimate-magnitude` | Ordre de magnitud d’una mesura | L’estimació serveix per descartar impossibles. |
| `estimate-result` | Estimació/plausibilitat d’una àrea | Compara una aproximació amb el resultat exacte. |
| `data-compare` | Comparació i diferència | Llegeix escala, ordena i resta. |
| `data-trend` | Augment, disminució o estabilitat | Descriu la tendència i prohibeix inferir-ne la causa. |
| `data-conclusion` | Conclusió justificada | Només accepta afirmacions sostingudes per les dades. |
| `equation-parentheses` | Distributiva i resolució | Diferencia explícitament `a(b+c)` de `ab+c` i comprova la solució. |
| `multistep-strategy` | Aplicació de més d’un pas | Selecciona dades, planifica, executa, interpreta i comprova sense imposar una recepta universal. |

No s’han afegit lliçons de suma/resta, multiplicació o divisió de decimals perquè aquests procediments **no tenen exercici autònom al banc actual**. Crear-les com si tinguessin recorregut complet hauria presentat una cobertura falsa i hauria ampliat el banc fora d’abast.

## 2. Prerequisits explícits

La dependència es declara en `daily-prerequisites.js` com `procediment → comprovació possible`:

- suma/resta de fraccions amb denominadors diferents → equivalència;
- divisió de fraccions → multiplicació/divisió aritmètica;
- equacions amb parèntesis → multiplicació necessària per aplicar la distributiva;
- augment/descompte percentual → relació decimal–fracció–percentatge;
- conversió, escala i problema multietapa de longitud → factor multiplicatiu o conversió directa.

No s’ha creat un prerequisit de mínim comú múltiple, signes o distributiva separada perquè el banc no ofereix aquestes habilitats com a activitats comprovables independents.

### Activació exacta

1. El procediment ha de tenir una dependència declarada.
2. Calen **dos errors autònoms** del mateix procediment entre les quatre evidències posteriors a l’última revisió, o **tres encerts assistits** del mateix procediment.
3. Un error aïllat, una solució consultada o errors en procediments diferents no activen res.
4. Després d’una revisió resolta hi ha almenys **set dies de refredament** i cal evidència nova compatible.
5. La comprovació ocupa una sola activitat i queda registrada a `profile.prerequisiteReviews`.
6. Si se supera autònomament, la ruta torna al procediment original. Si no, la següent activitat reforça el prerequisit; no es degrada automàticament tota l’habilitat superior.
7. Una comprovació assistida conserva la seva assistència i no crea domini autònom.

## 3. Resum pedagògic

El resum, inclòs el provisional d’una sessió interrompuda, respon a quatre preguntes:

- què s’ha treballat;
- què s’ha resolt autònomament;
- què continuarà apareixent o s’ha revisat amb ajuda;
- què ha ajustat FocusQuiz.

Diferencia procediments nous, reforços, prerequisits, ajuda i dominis realment confirmats durant la sessió. No dedueix domini del percentatge d’encerts ni usa etiquetes negatives. El resum és un model pur (`daily-summary.js`), de manera que la UI i la previsualització comparteixen exactament les mateixes regles descriptives.

## 4. Revisió visual i accessibilitat

- jerarquia textual explícita per aprenentatge, exemple guiat, pràctica, ajuda, prerequisit i comprovació;
- focus visible en botons, camps, selectors i `summary`;
- botons tàctils d’almenys 48 px en mòbil;
- graelles de resum i respostes reduïdes a una columna en pantalles estretes;
- contenidors matemàtics i passos protegits contra desbordament horitzontal;
- ajuda oberta amb vora i text, no només color;
- suport a `prefers-reduced-motion`;
- resum provisional accessible sense abandonar ni completar la sessió.

## 5. Previsualització

`daily-preview.html` no llegeix ni escriu `localStorage`. Permet seleccionar habilitat, procediment, format, nivell, estat d’intent, ajuda i amplada. Mostra microlliçó, exemple guiat, activitat, error específic/genèric, segon intent, solució, comprovació posterior, prerequisit i resum amb dades fictícies.

## 6. Simulacions de 30 i 60 dies

Cada fila representa 10 activitats diàries. Les dades són resultats d’escenaris deterministes, no prediccions sobre alumnat real; per això no s’estima temps en minuts ni es presenta un “dia de domini” com si fos una dada empírica.

| Dies | Perfil | Procediments explorats | Habilitats dominades (de 12) | Microlliçons activades | Prerequisits | Activitats assistides | Canvis de focus | Pujades / baixades |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 30 | Inicial | 40 | 12 | 22 | 0 | 40 | 23 | 24 / 0 |
| 30 | Intermedi | 37 | 12 | 20 | 2 | 0 | 28 | 19 / 0 |
| 30 | Avançat | 32 | 12 | 11 | 0 | 0 | 29 | 12 / 0 |
| 30 | Irregular | 34 | 12 | 20 | 8 | 0 | 24 | 23 / 12 |
| 30 | Dependent d’ajuda | 7 | 0 | 5 | 0 | 300 | 15 | 0 / 0 |
| 30 | Desigual | 21 | 4 | 9 | 3 | 70 | 15 | 8 / 0 |
| 30 | Falsa fluïdesa | 21 | 4 | 8 | 1 | 0 | 15 | 9 / 5 |
| 60 | Inicial | 40 | 12 | 22 | 0 | 40 | 53 | 24 / 0 |
| 60 | Intermedi | 39 | 12 | 20 | 3 | 0 | 58 | 19 / 0 |
| 60 | Avançat | 31 | 12 | 11 | 0 | 0 | 59 | 12 / 0 |
| 60 | Irregular | 39 | 12 | 20 | 21 | 0 | 52 | 35 / 24 |
| 60 | Dependent d’ajuda | 7 | 0 | 5 | 0 | 600 | 29 | 0 / 0 |
| 60 | Desigual | 25 | 5 | 10 | 7 | 118 | 29 | 10 / 0 |
| 60 | Falsa fluïdesa | 15 | 3 | 7 | 1 | 0 | 31 | 6 / 2 |

### Problemes detectats i correccions justificades

- **Bloqueig objectiu d’àlgebra al nivell 1:** només existeix un format cognitiu real en aquell nivell, però se n’exigien dos per promocionar. S’ha declarat `promoteMinFormatsByLevel: {1: 1}` només per aquest nivell; els nivells posteriors continuen exigint-ne dos. No s’ha canviat cap llindar d’encerts o errors.
- **Focus repetit quan només quedava una habilitat preparada:** la rotació només mirava habilitats no dominades i podia repetir-ne una durant molts dies. Cada quart focus pot tornar breument a una habilitat preparada ja dominada; el nivell i el domini no canvien.
- **Recomprovacions de prerequisit excessives:** ara només compta evidència posterior a l’última revisió i hi ha set dies de refredament.

### Lectura dels riscos

- El perfil dependent d’ajuda no promociona: és intencionat i confirma la separació entre ajuda i autonomia, però requereix intervenció pedagògica externa si el patró persisteix.
- El perfil irregular encara mostra pujades i baixades al llarg de 60 dies. No s’han ajustat llindars per embellir la simulació; el patró d’entrada és deliberadament extrem.
- La falsa fluïdesa domina poques habilitats quan canvia representació o raonament, que és el comportament esperat.
- “Procediments explorats” compta tuples cognitives visitades; no implica domini.

## 7. Compatibilitat i persistència

Els perfils antics reben valors segurs per a `prerequisiteReviews` i `pendingPrerequisites`. No s’elimina ni es reinterpreta cap evidència històrica en aquesta migració. Lliçons, intents, pistes, comprovacions, prerequisits, descriptors futurs i el model de resum són serialitzables i s’han cobert amb proves de recàrrega.
