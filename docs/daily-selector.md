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

Amb tres èxits autònoms però només un format o representació, el selector busca una representació encara no observada del mateix procediment. Manté el nivell. Una transferència equivalent no es repeteix abans de 7 dies ni sense 3 evidències autònomes noves; si la cobertura no ofereix una alternativa real, no inventa contingut.

## Exploració reversible

Tres resultats autònoms recents permeten un objectiu del nivell següent ja existent. La decisió desa `isExploration: true` i un `probeKey`. El mateix salt exigeix evidència autònoma intermèdia abans de repetir-se i hi ha tres activitats no exploratòries entre proves globals. Un error exploratori queda a l’historial però no incrementa el comptador de descens.

## Persistència i recorreguts pendents

Les obligacions ja iniciades es busquen abans de generar candidats. Si una comprovació era en una posició posterior, es mou al següent espai sense regenerar-la. Decisions, motiu, detalls, traça de candidats i descartaments són serialitzables. Les sessions històriques desen una versió compacta de les decisions per controlar repeticions entre dies.

## Observabilitat

La vista «Decisió del selector» de `daily-preview.html` construeix un perfil fictici en memòria. Mostra selecció, motiu, nivell, format, tipus, evidències, deu candidats considerats i deu descartats amb la causa. No llegeix ni escriu perfils reals.

## Simulació i auditoria posterior

La simulació de 30 dies conserva percentatges de tots els motius, quota per habilitat i procediment, cadena màxima, patrons de longitud 2/3/4 i comparació del guanyador amb el segon candidat. Els resultats revisats, problemes detectats i correccions són a [`daily-selector-audit.md`](daily-selector-audit.md).

Els llindars continuen sent provisionals. En particular, els perfils dependent d’ajuda i desigual exhaureixen sovint els procediments accessibles: després de reparació, ensenyament i comprovació, el selector els ajorna durant la sessió i només usa equilibri com a fallback si tots els candidats estan ajornats.

## Estancament per procediment

El selector consulta `daily-stagnation.js` durant la generació de candidats. Un estat actiu no introdueix una puntuació ni un selector paral·lel: manté un motiu principal controlat (`repair_after_error` o `guided_practice`) i afegeix diagnòstic, confiança i estratègia com a submotiu. Les regles, simulacions i llindars provisionals es documenten a [daily-stagnation.md](daily-stagnation.md).
