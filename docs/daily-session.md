# Sessió diària: abast i arquitectura

La primera versió ofereix perfils locals per dispositiu perquè FocusQuiz no disposa d'una identificació comuna obligatòria per a l'alumnat. Desa a `localStorage` l'identificador actiu i un perfil independent per alumne amb habilitats, evidències, sessions diàries i pràctiques extra. L'alumne actiu es conserva entre el menú, la portada, recàrregues i visites posteriors. La sincronització entre dispositius queda pendent.

## Inventari reutilitzat

`math.js` ja inclou generadors d'aritmètica, identificació visual de fraccions, simplificació i operacions, a més de percentatges, geometria, coordenades, estadística, unitats, problemes competencials, equacions i funcions. La sessió inicial reutilitza només aritmètica i fraccions mitjançant `FocusMathGenerators`. S'hi ha afegit l'opció d'equivalències al mateix generador de fraccions. La resta no es declara coberta pel recorregut adaptatiu.

## Catàleg i cobertura inicial

El catàleg és independent dels generadors i descriu identificador, prerequisits, descripció, correspondència i cobertura. El recorregut verificat cobreix multiplicació/divisió, concepte visual de fracció, equivalències, simplificació i operacions. Les aplicacions contextualitzades consten com a `planned`, no com a contingut disponible.

## Regles provisionals

- Deu activitats amb barreja configurable 30% repàs, 50% habilitat principal i 20% aplicació/repte. Sense historial, el repàs es transforma en diagnòstic progressiu i pràctica.
- Dos errors recents en una habilitat activen suport guiat. Una activitat posterior es pot explorar amb suport encara que faltin prerequisits; això no bloqueja tot el recorregut.
- Les evidències distingeixen `none`, `hint` i `solution`. Només els encerts sense ajuda acrediten autonomia.
- Tres encerts autònoms recents permeten consolidar. El domini exigeix cinc encerts autònoms en almenys dos dies diferents.
- Els repassos es programen provisionalment a 1, 3, 7 i 14 dies. Errors reinicien l'interval.
- Cada selecció desa el motiu en l'auditoria del perfil. No es mostra en el flux normal de l'alumne.

Els llindars són inicials i s'han de calibrar amb ús real. La classificació d'errors conceptuals o de càlcul no s'infereix quan la resposta no dona evidència suficient.

## Ampliar el banc d'exercicis

Cada habilitat apunta a un generador i opcions dins `CATALOG`. Els generadors han de retornar `type`, `text` i `answer`, i poden afegir `html`. La sessió desa també `formatId` (què comprova i en quin format) i `variantId` (variant numèrica concreta). Això permetrà exigir diversitat de formats per al domini quan el banc en disposi, sense confondre canvis de nombres amb comprensió o aplicació.

Per ampliar una habilitat, cal afegir al seu banc nivells progressius, formats o contextos diferenciats, explicacions resoltes, pistes ordenades de general a específica i patrons d'error només quan la resposta els identifiqui de manera fiable. Tot aquest material és estàtic, revisable pel professorat i no utilitza IA generativa.

Les sessions fan servir la data civil de `Europe/Madrid`. Una sessió diària pot estar `in-progress`, `completed` o `incomplete`; en canviar de dia, una sessió antiga en curs s'arxiva sense perdre evidències. La pràctica extra es desa separadament i no crea un segon dia d'aprenentatge.
