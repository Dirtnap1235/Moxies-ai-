# Moxie Ember

An original GBA-style monster-collecting RPG that runs in a single HTML file (240x160 canvas, chiptune audio, autosave).

- `index.html` – the built, playable game (open it in a browser)
- `src/` – game source split by area (core, tiles, characters, creatures, data, maps, world, battle, menus)
- `build.sh` – concatenates `head.html`, `src/*.js` and `tail.html` into the game

Controls: arrows/WASD move, Z/Space = A, X = B (hold to run), Enter = Start.
