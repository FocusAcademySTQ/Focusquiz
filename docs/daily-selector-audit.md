# Auditoria del selector pedagògic

Data: 3 d’octubre de 2026. Abast: selector i simulacions existents; no s’ha ampliat el banc ni s’han canviat els llindars de domini.

## 1. Distribució de motius

Percentatge sobre 300 decisions per perfil. Les columnes segueixen els dotze motius controlats.

| Perfil | Represa | Reparació | Prereq. | Retorn | Introducció | Guiada | Consolidació | Repàs | Transferència | Exploració | Confirmació | Equilibri |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Inicial | 0 | 11,0 | 0 | 0 | 12,7 | 1,7 | 57,0 | 5,0 | 0,3 | 5,3 | 3,7 | 3,3 |
| Intermedi | 0 | 3,3 | 0,3 | 0 | 10,0 | 1,0 | 61,3 | 13,7 | 0 | 6,7 | 1,7 | 2,0 |
| Avançat | 0 | 0 | 0 | 0 | 4,7 | 0 | 69,3 | 5,3 | 0,3 | 11,7 | 0,7 | 8,0 |
| Irregular | 0 | 36,0 | 1,0 | 0 | 12,3 | 8,3 | 33,7 | 8,7 | 0 | 0 | 0 | 0 |
| Dependent d’ajuda | 0 | 36,0 | 0 | 0 | 1,7 | 7,3 | 25,7 | 0 | 0 | 0 | 0 | 29,3 |
| Desigual | 0 | 35,3 | 0 | 0 | 1,7 | 7,3 | 22,3 | 0 | 0 | 0 | 0 | 33,3 |
| Falsa fluïdesa | 0 | 0 | 0 | 0 | 11,7 | 0 | 66,3 | 7,3 | 1,0 | 9,0 | 1,3 | 3,3 |

Les represa i retorn són 0 perquè la simulació completa cada torn sense interrupcions i resol els prerequisits dins la mateixa ruta. No indica que aquestes prioritats no funcionin; tenen proves unitàries específiques.

### Interpretació de concentracions

- **Avançat:** l’antiga simulació produïa 46% de transferències. Era un biaix: qualsevol candidat del procediment heretava la necessitat de transferir, encara que repetís la representació coneguda. Després de la correcció, transferència és 0,3%, exploració 11,7% i cada exploració queda seguida principalment de consolidació. Les 35 exploracions són salts diferents repartits entre habilitats; no hi ha `exploration → exploration`.
- **Dependent i desigual:** la reparació del 35–36% és conseqüència del patró d’entrada, però l’antic 80–96% revelava un bucle del selector. Ara dues reparacions sense autonomia canvien a ensenyament explícit, una comprovació autònoma i, si encara no hi ha informació nova, ajornament temporal. `coverage_balance` és alt perquè només queden cinc procediments accessibles mentre els prerequisits curriculars bloquegen la resta; és escassetat de candidats, no un empat accidental.
- **Irregular:** 36% de reparació és coherent amb dies sencers incorrectes alternats amb dies correctes. Les cadenes de reparació afecten procediments diferents; el mateix procediment continua limitat a dues reparacions seguides.
- **Inicial/intermedi/falsa fluïdesa:** predomina consolidació, coherent amb molts procediments introduïts però encara sense evidència estable.

## 2. Concentració per habilitat i procediment

| Perfil | Quota màxima | Cadena màxima | Distribució per habilitat |
|---|---:|---:|---|
| Inicial | càlcul 24,0% | 5 | dades 13,3%; fraccions-op. 13,3%; àlgebra 9,3%; unitats/aplicacions 7,7%; geometria 7,0%; resta ≤5% |
| Intermedi | fraccions-op. 24,7% | 5 | àlgebra 13,0%; aplicacions 12,3%; geometria 9,7%; càlcul 8,7%; unitats 8,0%; resta ≤6,7% |
| Avançat | fraccions-op. 21,7% | 3 | àlgebra 15,3%; aplicacions 12,7%; càlcul 11,0%; geometria 10,0%; resta ≤7,3% |
| Irregular | càlcul 16,3% | 5 | dades 16,0%; unitats 15,7%; fraccions-op. 13,0%; decimals 9,3%; aplicacions 8,0%; resta ≤6,3% |
| Dependent | càlcul 42,0% | 3 | dades 39,7%; concepte de fracció 18,3% |
| Desigual | càlcul 42,7% | 5 | dades 38,3%; concepte de fracció 19,0% |
| Falsa fluïdesa | fraccions-op. 18,0% | 3 | càlcul 16,7%; aplicacions 11,7%; àlgebra 11,0%; geometria 9,7%; resta ≤8,0% |

Els perfils dependent i desigual només arriben a càlcul, dades i concepte de fracció perquè no consoliden els prerequisits que obririen la resta. La concentració és curricularment explicable; el guard de tres decisions evita que una sola habilitat ocupi tota una seqüència.

Procediments amb quota màxima per perfil:

- inicial: fets de divisió i multiplicació, 5,7% cadascun;
- intermedi: resta de fraccions amb mateix denominador, 5,7%; resta amb denominadors diferents, 5,3%;
- avançat: equacions de dos passos, incògnita als dos membres, suma de fraccions diferents i àrea, 4,7% cadascun;
- irregular: resta de fraccions amb mateix denominador, 5,7%; tendència i simplificació, 5,0%;
- dependent: fets de divisió 21,7%, multiplicació 20,3%, suma de taula 20,3%, lectura de gràfic 19,3%, significat de fracció 18,3%;
- desigual: els mateixos cinc procediments, entre 19,0% i 22,0%;
- falsa fluïdesa: equacions de dos passos 6,0%; la resta ≤4,3%.

## 3. Transferència

Problemes detectats:

1. el selector marcava tots els formats d’un procediment com a transferència quan l’evidència només tenia una representació;
2. podia tornar a escollir la representació ja coneguda;
3. l’historial de transferència no frenava intents equivalents;
4. el generador de divisió no reconeixia `divide-facts` i generava multiplicacions, mantenint artificialment el procediment “nou”.

Correccions:

- només és candidat de transferència una representació no observada;
- una transferència equivalent queda refredada almenys 7 dies i exigeix 3 evidències autònomes noves abans de repetir-se;
- una transferència correcta que crea diversitat deixa pas a consolidació, confirmació o exploració;
- el generador respecta tant `divide-*` com `*-division`.

La falsa fluïdesa activa 3 transferències (1,0%), no una cadena dominant. Cap perfil conté `transferència → transferència`.

## 4. Exploració

Abans de l’auditoria, un mateix salt podia reaparèixer quan sortia de la finestra curta d’historial. Ara:

- cada salt desa `probeKey` (`habilitat:nivell actual→nivell següent`);
- cal evidència intermèdia autònoma no exploratòria abans de repetir el mateix salt;
- les decisions de totes les sessions, no només les dues últimes, participen en aquest control;
- hi ha com a mínim tres activitats no exploratòries entre dues exploracions globals;
- un error exploratori continua sense alimentar el comptador de descens.

L’avançat passa de 30 exploracions en l’informe anterior a 35 en aquesta simulació revisada perquè ara la simulació cobreix correctament divisions i més salts reals. És un 11,7%, no una conducta per defecte: 69,3% és consolidació, no hi ha exploracions consecutives i els patrons més comuns són `exploració → consolidació` i `consolidació → exploració`.

## 5. Repàs espaiat

Intervals observats:

| Perfil | % repàs | Rang observat |
|---|---:|---:|
| Inicial | 5,0 | 7–14 dies |
| Intermedi | 13,7 | 2–16 dies |
| Avançat | 5,3 | 11–15 dies |
| Irregular | 8,7 | 3–26 dies |
| Dependent / desigual | 0 | sense èxit autònom estable |
| Falsa fluïdesa | 7,3 | 2–15 dies |

Els 2–3 dies apareixen només amb evidència feble o errors recents; el contingut dominat de l’avançat reapareix al voltant dels 14 dies. No s’ha trobat interferència dominant del repàs. Els llindars de 3/7/14 dies, màxim 4 amb poca evidència i màxim 2 amb error continuen sent provisionals i no validats empíricament.

## 6. Qualitat de la reparació

La ruta de reparació diferencia ara:

1. pràctica de reparació;
2. ensenyament explícit si dues reparacions no donen autonomia;
3. una comprovació independent posterior;
4. prerequisit quan el mòdul detecta una dependència compatible;
5. ajornament del procediment durant la sessió si el cicle no aporta informació;
6. fallback equilibrat només si tots els procediments accessibles estan ajornats.

La reparació continua alta en perfils deliberadament dependents, però ja no és la mateixa estratègia repetida. L’equilibri del 29–33% en aquests perfils és un fallback explícit per escassetat de candidats, registrat als descartaments; no sobreescriu una reparació urgent quan aquesta encara és informativa.

## 7. Patrons de seqüència

Patrons de longitud 2 més freqüents:

| Perfil | 1r | 2n | 3r |
|---|---|---|---|
| Inicial | consol.→consol. (118) | reparació→reparació (25) | introducció→consol. (20) |
| Intermedi | consol.→consol. (127) | repàs→repàs (27) | introducció→consol. (19) |
| Avançat | consol.→consol. (136) | exploració→consol. (32) | consol.→exploració (28) |
| Irregular | reparació→reparació (70) | consol.→consol. (48) | consol.→reparació (23) |
| Dependent | reparació→reparació (76) | equilibri→equilibri (64) | consol.→consol. (49) |
| Desigual | equilibri→equilibri (80) | reparació→reparació (77) | consol.→consol. (48) |
| Falsa fluïdesa | consol.→consol. (135) | exploració→consol. (24) | introducció→consol. (21) |

En longitud 3 i 4 predomina consolidació repetida. En irregular apareix `reparació×4` 30 vegades, però sobre procediments diferents: la protecció per procediment i la cadena màxima per habilitat continuen actives. En dependent/desigual apareix `equilibri×4` perquè tots els procediments accessibles poden quedar ajornats el mateix dia; és un risc pendent, no una prova de domini.

No apareixen `transferència→transferència` ni `exploració→exploració`. La protecció d’introducció impedeix una tercera introducció quan existeix consolidació vàlida.

## 8. Guanyador contra segon candidat

La traça desa el segon candidat, diferència de prioritat i regla de desempat.

| Cas mostrejat | Guanyador | Segon | Regla | Valoració |
|---|---|---|---|---|
| Inicial, primer torn | divisió bàsica / introducció | multiplicació bàsica / introducció | identificador estable, Δ0 | Equivalent; decisió reproduïble però no pedagògicament superior. |
| Inicial amb error | divisió / reparació | dades / introducció | prioritat pedagògica, Δ1 | Correcte: la reparació urgent precedeix novetat. |
| Avançat | equació de dos passos / exploració | divisió escrita / exploració | identificador estable, Δ0 | Ambdues són proves vàlides; els guards posteriors eviten monopoli. |
| Avançat postexploració | consolidació algebraica | equilibri aritmètic | prioritat pedagògica, Δ4 | Correcte: consolidar el salt aporta més informació. |
| Intermedi | consolidació de divisió | consolidació de càlcul mixt | identificador estable, Δ0 | Formalment equivalents; futura validació d’aula podria afinar ordre curricular. |

Quan les prioritats difereixen, varietat mai pot fer guanyar el candidat inferior. Quan tot és igual, l’ordre estable només garanteix reproduïbilitat i queda declarat com a tal, sense fingir una superioritat pedagògica.

## 9. Problemes detectats i correccions

1. **46% de transferència avançada:** biaix de classificació; corregit amb representació no vista, cooldown i evidència nova.
2. **Divisió generada com multiplicació:** error objectiu en la correspondència `divide-facts`; corregit.
3. **Exploració repetible del mateix salt:** corregit amb `probeKey`, historial complet, evidència intermèdia i separació global.
4. **Reparació→reparació sense canvi d’estratègia:** corregit amb ensenyament, comprovació, prerequisit o ajornament.
5. **Microlliçó reoberta en qualsevol dificultat:** la UI ara només reensenya quan la decisió és `guided_practice` amb `lesson_sequence`.
6. **Introduccions consecutives:** després de dues, una consolidació vàlida desplaça qualsevol introducció nova.
7. **Decisió formalment opaca entre candidats similars:** ara es desa segon candidat, Δ de prioritat i regla exacta.

## 10. Decisions provisionals

- Els intervals de repàs 3/7/14, 4 i 2 dies.
- Dos errors o tres dependències d’ajuda com a activació de reparació.
- Dues reparacions abans de canviar estratègia.
- Set dies i tres evidències noves abans de repetir una transferència equivalent.
- Tres activitats entre exploracions globals.
- L’ordre alfabètic estable quan dos candidats són indistingibles amb les dades disponibles.
- El fallback d’equilibri quan tots els procediments accessibles estan ajornats; cal observar-lo amb alumnat real.
