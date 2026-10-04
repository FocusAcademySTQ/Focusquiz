# Adaptació real de dificultat

## Problemes detectats i correccions

Abans d'aquesta revisió, `estimatedLevel` podia canviar però moltes plantilles ignoraven el nivell, diverses habilitats declaraven quatre nivells sense quatre exigències reals i els descriptors de tota la sessió conservaven la dificultat inicial. A més, la retenció depenia d'una finestra de trenta intents, que encara podia perdre dies antics si hi havia molta pràctica en un sol dia.

Ara les preguntes es generen només quan es presenten. Després de cada resultat, `adaptRemainingItems` modifica i desa únicament els descriptors futurs no presentats; la pregunta actual i qualsevol pregunta ja generada queden intactes. Tres encerts autònoms amb la diversitat cognitiva exigida (un o dos formats reals) promocionen l'estimació. Tres errors autònoms en almenys dos formats cognitius —o quatre en un mateix format— la redueixen una vegada. Els resultats alterns compensen els comptadors per evitar oscil·lacions; un error aïllat, un encert amb ajuda o el pas del temps no canvien el nivell. Un encert diagnòstic pot programar una exploració superior sense declarar encara domini.

La retenció manté agregats estables per dia i format, independents del límit d'intents detallats. Els llindars continuen sent provisionals.

## Cobertura real per habilitat

| Habilitat | Nivells reals | Diferència matemàtica |
|---|---:|---|
| Multiplicació i divisió | 1–4 | Taules i divisions bàsiques; dues xifres per una; enters amb signe; expressió de dos passos. |
| Concepte de fracció | 1–2 | Parts simples en barra/pastís; després graelles i més particions. |
| Equivalència de fraccions | 1–3 | Factors petits, mitjans i grans. |
| Simplificació | 1–3 | Factors comuns i fraccions base progressivament menys immediates. |
| Operacions amb fraccions | 1–4 | Mateix denominador; denominadors relacionats; denominadors diferents i producte; després divisió. |
| Aplicacions de fraccions | 1–3 | Repartir/comparar; escalar receptes; interpretar escales. |
| Decimals | 1–3 | Comparar/representar; ordenar i aplicar descomptes; augments i impostos. |
| Percentatges | 1–3 | Equivalència; descompte; augment o impost. |
| Equacions lineals | 1–4 | Una operació; dues operacions/completar; incògnita als dos membres/raonament; parèntesis. |
| Àrees i perímetres | 1–3 | Aplicar o estimar; problema de perímetre; trobar una mesura desconeguda o detectar un error. |
| Gràfics i dades | 1–3 | Llegir valor/taula; comparar diferències o tendències; justificar una conclusió. |
| Unitats i conversions | 1–3 | Conversió directa/estimació; escala, temps o capacitat; problema multi-pas. |

Una petició superior a aquests nivells usa el màxim implementat i registra `coverageLimited`, la dificultat demanada i la dificultat real. No es presenta com un nivell nou.

## Exemples de progressió generada

- Equacions: `4x = 28` (nivell 1) → `4x + 3 = 31` o completar un pas (nivell 2) → `5x + 2 = 2x + 23` (nivell 3) → `3(x + 4) = 30` (nivell 4).
- Geometria: calcular l'àrea d'un rectangle (nivell 1) → calcular el marc necessari (nivell 2) → trobar l'altura a partir de l'àrea i la base (nivell 3).
- Dades: llegir la barra més alta (nivell 1) → calcular una diferència o interpretar una tendència (nivell 2) → triar una conclusió i justificar-la (nivell 3).
- Fraccions: sumar amb el mateix denominador (nivell 1) → denominadors relacionats (nivell 2) → denominadors diferents o producte (nivell 3) → divisió (nivell 4).

## Traçabilitat

L'auditoria del perfil registra generació i resultat amb habilitat principal, estimació anterior i posterior, confiança, dificultat demanada i real, plantilla, format, motiu, ajuda i causa del canvi. Els ajustos de preguntes futures també queden registrats, però aquesta informació no es mostra en el flux de l'alumne.
