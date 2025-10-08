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
