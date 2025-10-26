# Flux de pantalles abans d'una prova

Aquest resum descriu les parts de la interfície que veu l'alumne abans d'iniciar un qüestionari dins de Focusquiz.

## 1. Inici de sessió local
- **Panell emergent de selecció d'usuari** (`#loginOverlay`): es mostra en obrir la web si no hi ha cap alumne actiu i permet triar un usuari guardat, crear-ne un de nou o importar/exportar dades.

## 2. Barra superior persistent
- **Capçalera i navegació principal** (`header.topbar`): conté la marca, els botons d'accés a Inici, Resultats i Qui som, així com els enllaços ràpids cap a teoria i altres eines.
- **Controls d'usuari actiu** (`.user-controls`): informen de l'alumne connectat i ofereixen accés als botons *Canvia* i *Surt*.

## 3. Vista d'inici
- **Targeta de benvinguda** (`#view-home .panel.card`): explica com començar i inclou el missatge inicial.
- **Graella de mòduls** (`#moduleGrid`): llistat de mòduls disponibles per configurar i llançar una pràctica.
- **Consell del tutor virtual** (`#recommendation`): recordatori opcional amb suggeriments d'estudi.
- **Accés a espais d'aprenentatge i flashcards**: dues targetes de navegació addicionals per explorar recursos abans del qüestionari.

## 4. Vista de configuració del mòdul
- **Capçalera de configuració** (`#view-config .controls`): mostra el nom i la descripció del mòdul seleccionat, amb els botons *Torna* i *Comença*.
- **Opcions comunes** (`#view-config .section-title` i `.controls`): permeten ajustar nombre de preguntes, temps i nivell abans de la prova.
- **Opcions específiques del mòdul** (`#cfg-specific`): espai on apareixen els paràmetres propis de cada matèria (p. ex. temes de llengua o tipus de preguntes de matemàtiques).

Quan l'alumne prem **Comença**, el sistema canvia a la vista del qüestionari (`#view-quiz`) i s'inicia la prova.
