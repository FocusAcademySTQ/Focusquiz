# Simulació adaptativa de catorze dies

Execució: `node tests/daily-two-week-simulation.test.js` amb dates de l'1 al 14 de setembre de 2026 i respostes autònomes correctes per poder observar la progressió màxima. Cada perfil completa 140 activitats.

| Perfil | Habilitats diferents | Parelles habilitat-format | Repàs | Focus | Repte | Diagnòstic |
|---|---:|---:|---:|---:|---:|---:|
| Inicial | 12 | 30 | 33 | 76 | 28 | 3 |
| Intermedi | 12 | 31 | 33 | 79 | 28 | 0 |
| Avançat | 12 | 33 | 30 | 82 | 28 | 0 |

En els tres casos apareixen càlcul, concepte/equivalència/simplificació/operacions/aplicacions de fraccions, decimals, percentatges, equacions, geometria, dades i unitats. El perfil inicial progressa pels prerequisits; l'intermedi parteix amb càlcul i fonaments de fraccions dominats; l'avançat parteix amb totes les habilitats dominades i rota el focus en lloc de tornar permanentment al primer contingut.

La prova falla si algun perfil visita menys de cinc habilitats, menys de vuit parelles habilitat-format, no rep repàs espaiat, encadena el mateix focus més de tres dies o rep un repte amb prerequisits no preparats. En aquesta execució no s'han detectat bucles ni habilitats inaccessibles. La simulació és determinista quant a planificació, però no substitueix l'observació amb respostes reals i patrons d'error diversos.
