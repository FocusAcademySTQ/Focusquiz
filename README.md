# Focusquiz

## Resolució de conflictes de Git
Quan GitHub mostra el missatge **“This branch has conflicts that must be resolved”**, vol dir que els canvis de la branca actual entren en conflicte amb el que ja hi ha a la branca base (normalment `main`). Git no pot decidir automàticament quina versió ha de conservar i et demana que ho revisis manualment.

### Per què apareix
- Algú ha modificat els mateixos fitxers o línies a `main` després que creessis la teva branca.
- Hi ha arxius nous amb el mateix nom en ambdues branques.
- S'han eliminat o mogut fitxers que tu encara estàs editant.

### Com resoldre-ho localment
1. **Actualitza la branca base**:
   ```bash
   git checkout main
   git pull
   ```
2. **Torna a la teva branca de treball** i fusiona els canvis recents:
   ```bash
   git checkout work
   git merge main
   ```
3. **Obre els fitxers en conflicte**. Git marcarà les seccions amb `<<<<<<<`, `=======` i `>>>>>>>`. Escull quin codi s'ha de quedar o combina'ls manualment.
4. **Marca els conflictes com a resolts**:
   ```bash
   git add <fitxer>
   ```
5. **Completa la fusió**:
   ```bash
   git commit
   ```
6. **Puja la solució a GitHub**:
   ```bash
   git push
   ```

Si prefereixes fer-ho des del navegador, GitHub ofereix un editor de conflictes quan pitges “Resolve conflicts” al pull request.

### Consells
- Fes `git fetch` i `git merge main` sovint per evitar grans conflictes acumulats.
- Revisa els tests després de resoldre un conflicte per assegurar-te que el codi continua funcionant.
- Evita editar directament els fitxers generats automàticament a menys que sigui imprescindible.

Aquests passos t’ajudaran a entendre i solucionar els conflictes abans de completar el teu pull request.

## Nou mòdul: Països d'Europa

La plataforma incorpora ara un apartat de **Mòduls de geografia** amb el paquet *Països d'Europa*. Pots escollir entre tres
modalitats diferenciades:

- **Preguntes generals**: capitals, pistes contextuals, fronteres i països sense sortida al mar.
- **Banderes**: identifica a quin país pertany cada bandera europea.
- **Mapa interactiu**: localitza el país sobre un mapa d'Europa fent clic al punt corresponent.

Els nivells 1 a 4 desbloquegen progressivament països i dificultats (microestats, península balcànica, etc.).

## Gestor de tasques amb Supabase

Aquest projecte inclou un panell opcional per connectar Focusquiz amb un backend Supabase. Segueix els passos següents per tenir-lo en funcionament:

1. **Crear el projecte Supabase**
   - Accedeix a [supabase.com](https://supabase.com/), crea un projecte nou i apunta't l'URL i la `anon key` disponibles a `Settings → API`.
2. **Definir l'esquema**
   - Obre l'apartat `SQL Editor` i enganxa el contingut de `supabase/setup.sql` per crear les taules `profiles`, `assignments`, `assignment_assignees` i `submissions`, a més de les polítiques RLS necessàries.
3. **Configurar RLS i polítiques**
   - Confirma que RLS està activat a totes les taules (el script ja inclou `alter table ... enable row level security`).
   - Revisa que les polítiques generades permeten als mestres gestionar les seves tasques i als alumnes veure i actualitzar només les seves dades.
4. **Configurar Supabase Auth**
   - A `Settings → Auth`, activa el mètode d'email i crea manualment els usuaris mestres/alumnes. Recorda afegir el seu `full_name`, `email` i `role` (`teacher` o `student`) a la taula `profiles` amb el mateix `id` (`uuid`) que el compte d'`auth.users`.
5. **Preparar el frontend**
   - Duplica `supabase-config.example.js` amb el nom `supabase-config.js` i enganxa-hi l'URL i la `anon key` del projecte.
   - Obre `supabase-portal.html` en un navegador per accedir al panell. Els mestres poden crear proves automàtiques (amb nombre de preguntes, temps i nivell predefinits) i assignar-les als alumnes seleccionats; els alumnes poden obrir directament la prova i enviar les respostes.
6. **(Opcional) Edge Functions o backend extra**
   - Si necessites lògica avançada (per exemple, notificacions o correcció automàtica), implementa-la amb Edge Functions des del mateix projecte Supabase.
7. **Proves i validació**
   - Accedeix amb usuaris de prova (mestres i alumnes) per validar que les polítiques RLS funcionen segons el rol.
8. **Desplegament**
   - Desplega el frontend en el domini que necessitis i assegura't que `supabase-config.js` es carrega des d'un entorn segur (per exemple, variables d'entorn inyectades en temps de build o secrets del proveïdor d'hosting).

### Mode Live amb quizzes sincronitzats

Per habilitar el nou mode Live cal executar de nou l'script `supabase/setup.sql` perquè afegeix les taules i polítiques següents:

1. **Taules noves**
   - `quizzes` i `quiz_questions`: emmagatzemen plantilles amb preguntes manuals o vinculades a mòduls FocusQuiz.
   - `games`, `players` i `answers`: gestionen les partides en directe, els alumnes connectats i les respostes cronòmetrades.
2. **Polítiques RLS**
   - Els docents (usuari autenticat) poden crear, editar i eliminar quizzes, partides i respostes.
   - L'alumnat (sessions anònimes amb l'anon key) pot unir-se a una partida amb el codi generat i enviar respostes mentre la partida estigui oberta.
3. **Funcions i triggers**
   - `generate_live_join_code()` genera codis curts únics per compartir la partida (`FQ7D9K`).
   - Els triggers `set_timestamp` actualitzen automàticament el camp `updated_at` en quizzes, preguntes i partides.

Després d'executar l'script, entra al portal docent (`portal/supabase-portal.html`) i comprova la pestanya **Live** per:

- Crear plantilles de quiz amb preguntes manuals i bonificacions per temps.
- Llistar i eliminar quizzes guardats o reutilitzar-los per a una partida.
- Generar partides en directe per a qualsevol classe, obtenir el codi i compartir l'enllaç `https://focusquiz.netlify.app/play?code=XXXXXX` amb l'alumnat.

Recorda mantenir el formulari de l'alumnat a `index.html` (etiqueta "Has rebut un codi de prova?") perquè també accepti els codis generats des del mode Live.

### Flux d'ús ràpid

1. Inicia sessió com a mestre a `supabase-portal.html`.
2. Recarrega el llistat d'alumnes i selecciona'ls al formulari.
3. Publica una prova; apareixerà a "Assignacions publicades" amb el resum de configuració i l'estat de cada alumne.
4. Inicia sessió com a alumne per veure la prova, iniciar-la amb la configuració predefinida, actualitzar l'estat i enviar la resposta.
