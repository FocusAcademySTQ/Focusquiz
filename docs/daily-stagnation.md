# Detecció i resposta a l’estancament

Data de l’auditoria: 4 d’octubre de 2026. Aquesta capa no modifica domini, progressió ni cobertura curricular; aporta informació al selector existent.

## Definició exacta

L’estancament és un estat **per procediment**, no per habilitat. Només s’activa quan coincideixen tots aquests mínims provisionals:

1. el procediment ha aparegut en almenys **3 dies**;
2. hi ha almenys **4 intents significatius** (s’exclouen exploracions);
3. han passat almenys **2 dies** des del primer senyal;
4. coincideixen almenys **2 senyals** entre errors autònoms repetits, dependència sostinguda d’ajuda, dues reparacions improductives, falsa fluïdesa o absència de millora recent;
5. ja existeix evidència d’intervenció: dues reparacions, una lliçó/revisió de prerequisit, o tres intents assistits.

Per això no activen l’estat un error aïllat, una sola mala sessió, una exploració fallada, un format nou fallat ni una ajuda puntual. Quatre errors distribuïts en dies tampoc basten si encara no s’ha provat cap intervenció: serien dificultat, però no evidència que l’estratègia estigui estancada.

L’estat persistent desa només un resum auditable: habilitat/procediment, estat, tipus, confiança, detecció, comptadors activadors, estratègies/resultats, última autonomia i resolució. L’evidència detallada continua a l’historial original.

## Tipus i confiança

| Tipus | Evidència necessària | Confiança inicial |
|---|---|---|
| `procedural` | ≥3 errors autònoms persistents en ≥2 formats, després d’intervenció | mitjana |
| `conceptual` | comprovació d’un prerequisit compatible que necessita reforç | alta |
| `help_dependence` | ≥3 intents assistits i menys de 2 èxits autònoms | alta |
| `false_fluency` | ≥3 èxits en una representació i errors en una altra | alta |
| `difficulty_overload` | èxit autònom a càrrega inferior i ≥2 errors a dificultat superior | alta |
| `undetermined` | compleix la definició d’estancament, però cap causa anterior és prou sustentada | baixa |

No s’infereix una causa conceptual només perquè existeixi una dependència curricular: cal el resultat compatible de la comprovació.

## Estratègies i selecció

Les intervencions són submotius del selector actual; no constitueixen un segon selector.

- Procedimental: exemple guiat nou → simplificar → reensenyar → canviar representació → pausa.
- Conceptual: prerequisit → reensenyar → representació alternativa → pausa.
- Dependència d’ajuda: retirada gradual d’ajuda → simplificar → comprovació autònoma → pausa.
- Falsa fluïdesa: canvi de representació → comprovació/transferència → confirmació diagnòstica → pausa.
- Sobrecàrrega: simplificar → comprovació autònoma → canvi de representació → pausa.
- Indeterminada: confirmació diagnòstica → canvi de representació → pausa.

`new_guided_example` i `reteach` reutilitzen la microlliçó específica existent. Un exemple guiat no repeteix el darrer format guiat: el selector prefereix una variant disponible i, si no n’hi ha cap, degrada explícitament la intervenció a simplificació. `simplify` redueix un nivell sense canviar el procediment. `diagnostic_confirmation` busca informació, no entrenament. Les comprovacions de prerequisit continuen sotmeses a les regles de compatibilitat i cooldown del mòdul de prerequisits.

## Proteccions contra bucles

- Una estratègia usada no torna a ser la següent dins del mateix episodi.
- La microlliçó no es repeteix indefinidament: reensenyament i exemple guiat són intervencions diferents i d’un sol ús per episodi.
- Després d’esgotar intervencions, el procediment descansa **2 dies**.
- La pausa queda registrada fins i tot quan guanya una altra activitat, i després genera `return_after_pause`; no equival a domini ni abandó.
- Cada resultat d’estratègia passa de `pending` a `new_autonomy` o `no_improvement` quan arriba evidència posterior.
- Un prerequisit superat continua protegit pel cooldown existent i no es reobre només per l’estat d’estancament.

## Resolució

- Un èxit assistit no canvia l’estat.
- El primer èxit autònom posterior a la detecció canvia `active` a `still_learning`.
- L’estat passa a `stagnation_resolved` amb dos èxits autònoms posteriors en dies o formats diferents i sense error autònom repetit immediat.
- `stagnation_resolved`, `still_learning` i `mastered` són conceptes separats: trencar l’estancament no declara domini.

## Integració i persistència

`daily-stagnation.js` calcula el diagnòstic i recomana una intervenció. `daily-pedagogical-selector.js` continua fent la selecció final, manté `repair_after_error` o `guided_practice` com a motiu principal controlat i desa `stagnation` com a submotiu auditable. La decisió, estratègia i criteri de resolució sobreviuen a una recàrrega.

Els perfils nous inicialitzen `stagnationStates: {}`. La migració de perfils antics afegeix aquest valor per defecte sense tocar evidències històriques.

## Simulacions deterministes

| Perfil | Diagnòstic | Primera estratègia | Resultat simulat |
|---|---|---|---|
| Divisió de fraccions amb prerequisit fallit | conceptual | prerequisit | actiu |
| Equacions resoltes només amb pistes | dependència d’ajuda | retirada gradual | actiu |
| Simbòlic correcte, context incorrecte | falsa fluïdesa | canvi de representació | actiu |
| Èxit simple, errors a dificultat alta | sobrecàrrega | simplificar | actiu |
| Errors procedimentals i millora després de reensenyar | procedimental | exemple guiat nou | resolt amb 2 autonomies |
| Cap estratègia produeix millora | procedimental | rotació i pausa | continua obert |
| Una mala sessió puntual | cap | cap | no detectat |

La simulació exposa per procediment dies fins a detecció, reparacions prèvies, estratègies, activitats fins a nova autonomia i percentatges assistits/autònoms abans i després. Per perfil exposa oberts, resolts, percentatge de resolució, dies mitjans oberts i intervencions més freqüents. No són mètriques visibles per a l’alumne.

## Riscos i llindars provisionals

- 3 dies, 4 intents, 2 senyals i 2 dies transcorreguts no tenen validació experimental externa.
- La pausa de 2 dies és una protecció operativa provisional.
- La classificació procedimental és de confiança mitjana perquè els identificadors de format no descriuen sempre l’error concret de pas o signe.
- La reducció d’un nivell és una aproximació a menor càrrega; alguns procediments només tenen una plantilla generable al seu nivell curricular.
- Amb molt pocs procediments accessibles, el selector pot necessitar una confirmació diagnòstica durant una pausa per no deixar la sessió sense candidat.
- Cal observar episodis recurrents després d’una resolució amb dades reals abans de decidir si s’han de reobrir automàticament com un episodi nou.
