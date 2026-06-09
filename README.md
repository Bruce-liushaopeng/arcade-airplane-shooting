# Sky Circuit 45

A retro vertical scrolling airplane shooter for desktop and mobile browsers. It is built with plain HTML, CSS, JavaScript, Canvas, generated SVG arcade sprites, and Web Audio API placeholder sounds.

## Run

Open `index.html` directly in a browser, or serve the folder locally:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Art Assets

The game uses original generated SVG assets organized under `assets/`:

- `assets/sprites/player/`: blue/silver player fighter.
- `assets/sprites/enemies/`: red fighters, green jets, armored planes, UFOs, drones, turrets, missile enemies, and elite fighters.
- `assets/sprites/bosses/`: giant bomber, UFO mothership, armored airship, twin commander, and sky fortress.
- `assets/sprites/bullets/`: energy bolts, plasma bullets, missiles.
- `assets/sprites/powerups/`: glowing arcade item icons.
- `assets/ui/hud/`: life and bomb HUD icons.
- `assets/backgrounds/`: theme folders for future authored background layers.

Regenerate the SVG set with:

```sh
node tools/generate-assets.js
```

## Controls

Desktop:

- Move the mouse over the canvas to smoothly guide the fighter.
- `WASD` or arrow keys also move the fighter.
- `Space` uses a bomb.
- `P` pauses.
- `M` toggles mute.

Mobile and tablet:

- Touch the play area to create a dynamic joystick where your thumb lands.
- Drag to move.
- Release to hide the joystick.
- Tap the lower-right bomb button to use a bomb.
- Tap the pause icon in the top-right of the playfield.

## Game Modes

- Classic: starts with 3 lives and 1 bomb.
- Coin Mode: starts with 5 lives and 2 bombs.

When lives hit zero, the game enters an arcade continue countdown. Continuing restores the mode's life count, clears bullets, grants temporary invincibility, and records a continue in the final stats.

## Content

The game includes basic planes, zigzag planes, diving enemies, UFOs, armored aircraft, turrets, drone swarms, elite enemies, and laser wings. Bosses and mini-bosses appear on the 30-minute timeline, including a mini bomber, giant bomber, UFO mothership, armored airship, twin commanders, and the final sky fortress.

Power-ups include weapon power, speed, bombs, homing missiles, laser time, drone wingmen, shield, score multiplier, and rare extra lives.

## Wave System

`WaveDirector` mixes scripted timeline events with procedural formations. Each spawn cycle chooses from formations such as line, V formation, alternating side entries, ambushes, circles, and drone swarms. Enemy availability is unlocked by survival time, so the first minute stays readable and later minutes become denser.

To add an enemy:

1. Add a definition to `ENEMY_TYPES` in `main.js`.
2. Add its unlock timing in `WaveDirector.availableTypes()`.
3. Add movement or drawing behavior in the `Enemy` class if needed.

## Bosses

Boss timing and stats live in the `BOSSES` array in `main.js`. To add a boss, create a new entry with `at`, `key`, `name`, `hp`, `color`, `score`, `pattern`, and `parts`, then add a matching pattern in `fireBossPattern()` if the existing patterns are not enough.

## Backgrounds

Background stages live in the `THEMES` array. Each theme has an unlock time, colors, name, and detail type. The renderer scrolls themed parallax details such as ocean reflections, clouds, islands, airbase roads, hangars, neon buildings, stars, and fortress panels.

## Difficulty Tuning

Difficulty is time-based: `difficulty = elapsed / 60`, capped in code. It influences enemy health, speed, bullet speed, spawn frequency, and boss fire cadence. Tune the values in `WaveDirector.spawnWave()`, `Enemy.fire()`, and `fireBossPattern()`.

## Debug Mode

Append `?debug` to the URL to show FPS, wave name, difficulty, object counts, current theme, and hitboxes.

## Files

- `index.html`: page shell and canvas.
- `style.css`: responsive arcade cabinet layout and mobile full-screen handling.
- `main.js`: game loop, sprite rendering, input, enemies, waves, bosses, scoring, audio, storage.
- `tools/generate-assets.js`: original SVG sprite generator.
- `assets/`: generated sprites, HUD icons, background theme folders, and audio placeholder folder.
