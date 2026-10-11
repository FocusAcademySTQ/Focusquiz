# FocusDay Català

## Arquitectura

FocusDay Català utilitza `daily-subject-core.js` per crear un motor de subjecte a partir d'un catàleg i un registre de candidats. El selector, els prerequisits, l'estancament i el magatzem de perfils són els mateixos components que fa servir el recorregut de Matemàtiques. L'exportació matemàtica `FocusDaily` es conserva sense canvis incompatibles; el selector només accepta ara un registre `targets` opcional.

La identitat de l'alumne continua sent única. Matemàtiques conserva l'esquema superior històric i Català viu a `profile.subjects.catalan`. Aquesta vista de compatibilitat evita reinterpretar evidències antigues i permet dues sessions el mateix dia.

## Currículum inicial

| Àrea | Habilitat | Procediments inicials | Nivells | Formats | Simplificació | Transferència | Diagnòstic | Microlliçó | Prerequisit |
|---|---|---|---:|---|---|---|---|---|---|
| Ortografia | Accentuació | tipus de tònica, aplicar, reparar | 1–3 | paraula, frase, error | Sí a N2–3 | Sí | accent absent | Sí | tipus de tònica |
| Ortografia | Apostrofació | aplicar, reparar | 1–2 | sintagma, frase | Sí a N2 | Sí | apòstrof | Sí | — |
| Morfologia | Categories | identificar, interpretar en context | 1–2 | frase | Sí a N2 | Sí | no causal | Sí | — |
| Morfologia | Concordança | aplicar, reparar | 1–2 | frase, error resolt | Sí a N2 | Sí | gènere/nombre/persona | Sí | categories |
| Sintaxi | Subjecte | explícit, el·líptic, concordança | 1–3 | frase, error resolt | Sí a N2–3 | Sí | subjecte-verb | Sí | verb/persona |
| Lectura | Comprensió | literal, referent, inferència, conclusió | 1–4 | text breu | Sí a N2–4 | Sí | límit d'evidència | Sí | literal abans d'inferir |
| Escriptura | Cohesió | connector, ordre, frase irrellevant | 1–3 | parella, seqüència, paràgraf | Sí a N2–3 | Sí | relació discursiva | Sí | — |
| Vocabulari | Context | significat, sinònim, registre | 1–3 | frase, diàleg | Sí a N2–3 | Sí | no causal | Sí | — |

La cobertura és deliberadament inicial: no intenta representar tot el currículum de Primària i ESO. Les produccions obertes queden fora del domini automàtic fins que existeixi un flux de revisió fiable.

## Correcció determinista

`daily-catalan-answer.js` aplica una política declarada per activitat. Normalitza Unicode, espais, caixa, apòstrofs i puntuació només quan aquests elements no són l'objectiu. Els accents continuen sent significatius en ortografia. No s'utilitzen distàncies de text, semblança semàntica, serveis externs ni IA.

Les activitats obertes han d'utilitzar `answerType: non_autocorrective` o `autocorrect: false`; el validador retorna llavors una evidència no concloent. Aquesta primera versió ofereix expressió escrita estructurada i autocorrectiva, no una nota automàtica de redacció.

## Prerequisits

Els prerequisits s'activen només després de dos errors autònoms recents o tres encerts assistits, igual que al component compartit. El mapa català cobreix accentuació, concordança, subjecte el·líptic i comprensió inferencial. Superar la comprovació retorna al procediment original; no superar-la programa reforç sense rebaixar tota l'àrea.

## Persistència i migració

- Un perfil antic continua sent la vista matemàtica de compatibilitat.
- `subjects` s'inicialitza sense moure ni copiar evidències històriques.
- `subjectState(profile, 'mathematics')` retorna el perfil històric.
- `subjectState(profile, 'catalan')` crea o recupera un estat independent.
- La migració és idempotent i es prova amb una doble càrrega.

## Simulacions

Les simulacions deterministes de 30 i 60 dies cobreixen perfils inicial, irregular i dependent d'ajuda. Comproven continuïtat de sessions, generació de procediments i separació d'assistència. Són proves d'estabilitat de programari, no una validació científica dels intervals o del model curricular.

## Decisions provisionals i riscos

1. Els intervals de repàs i els llindars de domini es mantenen per coherència tècnica, però encara no estan validats específicament per llengua.
2. El banc inicial necessita revisió periòdica per docents i especialistes de llengua.
3. La varietat normativa es declara com a català general IEC; cal documentar alternatives dialectals abans d'ampliar respostes acceptades.
4. No s'avalua automàticament una redacció oberta.
5. Les simulacions no substitueixen un pilot amb alumnat ni una revisió d'accessibilitat amb tecnologies assistives reals.
6. El motor matemàtic conserva la implementació històrica mentre el nou factory dona servei a Català; una futura fase pot adoptar el factory internament només si les proves de caracterització demostren equivalència completa.
