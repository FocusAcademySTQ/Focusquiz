# Selector pedagògic de la Sessió diària

## Arquitectura

`daily-pedagogical-selector.js` és la capa única que respon «quina activitat toca ara i per què?». El motor existent continua mantenint catàleg, evidència, nivell i domini; les microlliçons, prerequisits i adaptació continuen sent components independents. El selector els coordina així:

1. el motor crea els espais persistents de la sessió;
2. `ensureNextDecision` decideix **només el següent espai**, just abans de presentar-lo;
3. la decisió completa queda a `item.pedagogicalDecision`, `session.decisions` i l’auditoria del perfil;
4. una recàrrega reutilitza la decisió existent i l’exercici generat, sense tornar a seleccionar;
5. després d’una resposta, els components de solució/prerequisit poden crear una obligació; el torn següent torna a passar pel selector, que li dona prioritat.

`selectNextActivity(profile, sessionState)` retorna habilitat, procediment, nivell de l’activitat, format cognitiu objectiu, família generadora, tipus, un únic motiu principal, detalls d’evidència, candidats vàlids i candidats descartats. No existeix cap puntuació global d’aprenentatge.

## Ordre exacte de prioritats

| Prioritat | Regla | Motiu controlat |
|---:|---|---|
| A | comprovació després de solució | `mastery_confirmation` |
| A | comprovació de prerequisit | `check_prerequisite` |
| A | retorn després de prerequisit | `return_after_prerequisite` |
| A | activitat presentada i incompleta | `resume_activity` |
| B | 2 errors autònoms recents o 3 encerts assistits | `repair_after_error` |
| C | procediment sense evidència | `introduce_procedure` |
| C | lliçó completada però sense èxit autònom | `guided_practice` |
| D | menys de 3 èxits autònoms | `independent_consolidation` |
| E | interval provisional vençut | `spaced_review` |
| F | almenys 3 èxits limitats a un format o representació | `representation_transfer` |
| G | 3 resultats autònoms recents i nivell superior cobert | `difficulty_probe` |
| G | consolidació pendent de confirmar | `mastery_confirmation` |
| H | cap necessitat anterior | `coverage_balance` |

Cada activitat té exactament un valor de la llista controlada. La frase mostrada a l’alumne és separada del codi tècnic.

## Generació, descart i desempat de candidats

El registre `TARGETS` enumera únicament procediments ja presents al banc i declara nivell mínim, família de plantilla, representació i microlliçó. Per cada torn:

1. es generen tots els objectius dins de cobertura;
2. es descarten habilitats amb prerequisits curriculars encara no preparats, nivells inexistents i procediments per damunt de l’estimació actual;
3. es classifica la necessitat de cada candidat amb regles interpretables;
4. es descarta una microlliçó ja completada i es converteix en pràctica;
5. es descarta la mateixa plantilla consecutiva quan no hi ha reparació o confirmació justificada;
6. es trenca una cadena de dues reparacions del mateix procediment, quatre reparacions de la mateixa habilitat entre sis decisions, o tres decisions consecutives de la mateixa habilitat;
7. s’ordena per prioritat, menys repetició, menys evidència disponible i, finalment, identificadors estables. No s’usa aleatorietat per decidir.

Els descartaments conserven `discardReason`; la selecció conserva `reasonDetails` i `evidence`.

## Repàs temporal provisional

`REVIEW` centralitza els intervals inicials:

- aprenentatge: 3 dies;
- consolidació: 7 dies;
- domini: 14 dies;
- evidència escassa: màxim 4 dies;
- error recent: màxim 2 dies.

La necessitat usa l’última evidència autònoma, l’estat de domini, el volum d’evidència i els errors recents. Són llindars provisionals, no una fórmula universal. El repàs no modifica per si mateix nivell o domini.

## Transferència i falsa fluïdesa

Amb tres èxits autònoms però només un format o representació, el selector busca una altra família del mateix procediment. Manté el nivell: canviar de representació no equival a augmentar dificultat. Si la cobertura no ofereix una alternativa real, el candidat no inventa contingut.

## Exploració reversible

Tres resultats autònoms recents permeten un objectiu del nivell següent ja existent. La decisió desa `isExploration: true`. Una resposta exploratòria incorrecta queda a l’historial, però no incrementa el comptador de descens ni provoca regressió automàtica. El següent torn torna a ser seleccionat amb l’evidència disponible.

## Persistència i recorreguts pendents

Les obligacions ja iniciades es busquen abans de generar candidats. Si una comprovació era en una posició posterior, es mou al següent espai sense regenerar-la. Decisions, motiu, detalls, traça de candidats i descartaments són serialitzables. Les sessions històriques desen una versió compacta de les decisions per controlar repeticions entre dies.

## Observabilitat

La vista «Decisió del selector» de `daily-preview.html` construeix un perfil fictici en memòria. Mostra selecció, motiu, nivell, format, tipus, evidències, deu candidats considerats i deu descartats amb la causa. No llegeix ni escriu perfils reals.

## Simulació de 30 dies (300 activitats per perfil)

| Perfil | Motius principals | Interval de repàs observat | Repetició procediment | Transferència | Exploracions | Reparacions | Prerequisits | Consolidacions | Màxima quota d’una habilitat |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Inicial | introducció 144; consolidació 79; reparació 50; repàs 19 | 7–18 dies | 1% | 3% | 0 | 50 | 0 | 79 | 54% |
| Intermedi | consolidació 155; introducció 42; repàs 39; reparació 35 | 2–14 dies | 7% | 10% | 0 | 35 | 0 | 155 | 37% |
| Avançat | transferència 139; introducció 59; repàs 53; exploració 30 | 14–26 dies | 0% | 46% | 30 | 0 | 0 | 19 | 56% |
| Irregular | reparació 141; introducció 97; consolidació 60 | — | 21% | 0% | 0 | 141 | 2 | 60 | 56% |
| Dependent d’ajuda | reparació 287; introducció 8 | — | 19% | 0% | 0 | 287 | 0 | 5 | 52% |
| Desigual | reparació 289; introducció 7 | — | 16% | 0% | 0 | 289 | 0 | 4 | 52% |
| Falsa fluïdesa | introducció 170; consolidació 86; repàs 37; transferència 7 | 2–15 dies | 0% | 2% | 0 | 0 | 0 | 86 | 56% |

La simulació verifica que no hi ha repeticions de plantilla sense motiu, cap cadena supera dues reparacions consecutives del mateix procediment, cap habilitat supera el 70% de la ruta, l’alumnat avançat rep exploració i la falsa fluïdesa rep transferència.

## Problemes i decisions provisionals

- Els perfils dependent d’ajuda i desigual continuen generant molta reparació. Els guards eviten un bucle local i reparteixen habilitats, però no converteixen ajuda en autonomia ni amaguen la necessitat. Cal validació d’aula abans de canviar llindars.
- La transferència només pot usar representacions que ja existeixen; algunes habilitats tenen poca varietat real.
- Els intervals de repàs són inicials. Les simulacions mostren 2–26 dies segons estat i errors, però no demostren que aquests intervals siguin òptims.
- La introducció és freqüent en perfils sense historial perquè el banc conté molts procediments. El selector evita repetir plantilla i habilitat, però l’ordre curricular fi continua limitat pels prerequisits existents.
- La mètrica «quota d’una habilitat» agrupa procediments; una quota alta pot ser legítima en reparació, per això es documenta i no es transforma en una penalització opaca.
