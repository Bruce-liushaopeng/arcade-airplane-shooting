#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const write = (file, body) => {
  const out = path.join(root, file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, body.trimStart());
};

const svg = (w, h, body) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">
  <defs>
    <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
${body}
</svg>`;

const plane = ({ main, dark, light, accent, cockpit, hostile = false }) => svg(64, 80, `
  <path d="M30 4h4l8 22 2 18 16 18v10l-22-8-4 12h-4l-4-12-22 8V62l16-18 2-18z" fill="${dark}"/>
  <path d="M32 6l7 25v28l-7 15-7-15V31z" fill="${main}"/>
  <path d="M26 22h12l-2 18h-8z" fill="${light}"/>
  <path d="M28 16h8l-2 15h-4z" fill="${cockpit}" filter="url(#glow)"/>
  <path d="M12 48l14 3-1 9-15 6zM52 48l-14 3 1 9 15 6z" fill="${main}"/>
  <path d="M6 62l19-6-2 8-17 6zM58 62l-19-6 2 8 17 6z" fill="${accent}"/>
  <path d="M28 60h8l4 12H24z" fill="${dark}"/>
  <path d="M29 72h6l-3 7z" fill="${hostile ? "#ffb347" : "#63e8ff"}"/>
  <path d="M16 50h6v5h-6zM42 50h6v5h-6z" fill="${light}"/>
`);

write("assets/sprites/player/player_fighter.svg", plane({
  main: "#2878ff",
  dark: "#10368f",
  light: "#bcdcff",
  accent: "#63e8ff",
  cockpit: "#fff06a"
}));

write("assets/sprites/enemies/basic_red_fighter.svg", plane({
  main: "#e43e42",
  dark: "#7e1725",
  light: "#ff9d78",
  accent: "#ffd05e",
  cockpit: "#77fff7",
  hostile: true
}));

write("assets/sprites/enemies/green_zigzag_plane.svg", svg(58, 78, `
  <path d="M27 3h4l7 28 17 7-4 11-14-4-3 27H24l-3-27-14 4-4-11 17-7z" fill="#164b31"/>
  <path d="M29 6l5 28-5 36-5-36z" fill="#42d478"/>
  <path d="M25 19h8l-2 13h-4z" fill="#d8fff2" filter="url(#glow)"/>
  <path d="M9 41l14 3-1 8-15 6zM49 41l-14 3 1 8 15 6z" fill="#25995c"/>
  <path d="M24 60h10l2 12H22z" fill="#0b2e20"/>
`));

write("assets/sprites/enemies/silver_armored_plane.svg", svg(80, 92, `
  <path d="M37 4h6l12 38 22 16v13l-29-7-5 21h-6l-5-21-29 7V58l22-16z" fill="#46546a"/>
  <path d="M40 7l10 39-10 36-10-36z" fill="#c9d7e8"/>
  <path d="M31 30h18v16H31z" fill="#77879a"/>
  <path d="M34 17h12l-3 17h-6z" fill="#5ff2ff" filter="url(#glow)"/>
  <path d="M10 61h18v8H10zM52 61h18v8H52z" fill="#ffcf5a"/>
  <path d="M27 73h26v10H27z" fill="#2a3242"/>
`));

write("assets/sprites/enemies/purple_ufo.svg", svg(86, 54, `
  <ellipse cx="43" cy="28" rx="39" ry="15" fill="#4d236f"/>
  <path d="M10 28h66v11H10z" fill="#8c45e8"/>
  <path d="M28 27q15-25 30 0z" fill="#b481ff"/>
  <path d="M33 20h20v7H33z" fill="#60ffd4" filter="url(#glow)"/>
  <path d="M14 39h10v5H14zM38 41h10v5H38zM62 39h10v5H62z" fill="#ffdf66"/>
`));

write("assets/sprites/enemies/small_drone.svg", svg(46, 46, `
  <path d="M19 10h8l6 10-6 16h-8l-6-16z" fill="#263a4c"/>
  <path d="M20 15h6l3 7-3 8h-6l-3-8z" fill="#5cffd2" filter="url(#glow)"/>
  <path d="M3 15h13v8H3zM30 15h13v8H30zM7 28h10v7H7zM29 28h10v7H29z" fill="#86a4b8"/>
  <path d="M0 17h8v4H0zM38 17h8v4h-8z" fill="#ffe46b"/>
`));

write("assets/sprites/enemies/turret_ground_cannon.svg", svg(70, 70, `
  <path d="M7 38h56v25H7z" fill="#384b43"/>
  <path d="M16 29h38v17H16z" fill="#5f766c"/>
  <path d="M29 7h12v28H29z" fill="#1f2b2b"/>
  <path d="M25 14h20v15H25z" fill="#8bd78e"/>
  <path d="M12 47h10v6H12zM30 48h10v6H30zM48 47h10v6H48z" fill="#25352f"/>
  <path d="M31 4h8v8h-8z" fill="#ffcf5a" filter="url(#glow)"/>
`));

write("assets/sprites/enemies/missile_enemy.svg", svg(64, 80, `
  <path d="M31 4h2l11 20v39l-12 13-12-13V24z" fill="#313747"/>
  <path d="M32 7l7 21v31l-7 11-7-11V28z" fill="#ff5f46"/>
  <path d="M17 45l10 7-2 11-12 7zM47 45l-10 7 2 11 12 7z" fill="#77222b"/>
  <path d="M28 18h8v9h-8z" fill="#ffd45a" filter="url(#glow)"/>
`));

write("assets/sprites/enemies/elite_black_fighter.svg", svg(76, 88, `
  <path d="M36 4h4l11 31 22 24-4 13-25-10-4 21h-4l-4-21-25 10-4-13 22-24z" fill="#080b12"/>
  <path d="M38 8l7 34-7 38-7-38z" fill="#2d3247"/>
  <path d="M32 22h12l-2 19h-8z" fill="#ff4bd8" filter="url(#glow)"/>
  <path d="M9 60l23-7-2 9-20 8zM67 60l-23-7 2 9 20 8z" fill="#5e1c74"/>
  <path d="M27 69h22v10H27z" fill="#141827"/>
`));

write("assets/sprites/bosses/giant_bomber.svg", svg(180, 126, `
  <path d="M84 7h12l24 54 54 25v24l-63-17-9 25H78l-9-25-63 17V86l54-25z" fill="#394456"/>
  <path d="M90 10l18 58-18 48-18-48z" fill="#9fb2c9"/>
  <path d="M67 48h46v28H67z" fill="#c8d8ed"/>
  <path d="M78 25h24l-6 28H84z" fill="#69f3ff" filter="url(#glow)"/>
  <path d="M25 82h22v18H25zM133 82h22v18h-22zM73 86h34v17H73z" fill="#20283a"/>
  <path d="M31 88h10v8H31zM139 88h10v8h-10zM85 90h10v8H85z" fill="#ff426d" filter="url(#glow)"/>
`));

write("assets/sprites/bosses/ufo_mothership.svg", svg(190, 112, `
  <ellipse cx="95" cy="57" rx="83" ry="28" fill="#3b1b55"/>
  <path d="M22 57h146v24H22z" fill="#8546d7"/>
  <path d="M58 56q37-56 74 0z" fill="#b982ff"/>
  <path d="M72 39h46v16H72z" fill="#5cffd2" filter="url(#glow)"/>
  <path d="M34 78h22v10H34zM84 83h22v10H84zM134 78h22v10h-22z" fill="#ffd45a" filter="url(#glow)"/>
  <path d="M11 62h26v12H11zM153 62h26v12h-26z" fill="#22102f"/>
`));

write("assets/sprites/bosses/armored_airship.svg", svg(190, 130, `
  <path d="M21 50h148l18 25-18 25H21L3 75z" fill="#34404d"/>
  <path d="M42 35h106l18 40-18 40H42L24 75z" fill="#8394a8"/>
  <path d="M64 49h62v20H64z" fill="#d0ddea"/>
  <path d="M77 30h36l-7 24H84z" fill="#ffe36b" filter="url(#glow)"/>
  <path d="M26 73h28v19H26zM136 73h28v19h-28zM78 84h34v22H78z" fill="#1d2530"/>
  <path d="M34 78h10v9H34zM146 78h10v9h-10zM90 91h10v9H90z" fill="#42f6ff" filter="url(#glow)"/>
`));

write("assets/sprites/bosses/twin_jet_commander.svg", svg(126, 104, `
  <path d="M60 4h6l16 36 38 34-7 17-43-15-5 22h-4l-5-22-43 15-7-17 38-34z" fill="#2a2638"/>
  <path d="M63 8l12 40-12 47-12-47z" fill="#ffc34d"/>
  <path d="M53 24h20l-4 26H57z" fill="#ffffff"/>
  <path d="M13 75l41-13-3 12-37 14zM113 75L72 62l3 12 37 14z" fill="#ff7348"/>
  <path d="M43 80h40v13H43z" fill="#1b1f2c"/>
`));

write("assets/sprites/bosses/sky_fortress.svg", svg(220, 170, `
  <path d="M25 42h170l18 36v62H7V78z" fill="#322539"/>
  <path d="M43 20h134l20 55H23z" fill="#6a3448"/>
  <path d="M72 38h76l13 36H59z" fill="#9f5263"/>
  <path d="M91 32h38l-8 35H99z" fill="#ffcf5a" filter="url(#glow)"/>
  <path d="M17 90h34v35H17zM169 90h34v35h-34zM71 107h28v40H71zM121 107h28v40h-28z" fill="#151925"/>
  <path d="M27 101h14v12H27zM179 101h14v12h-14zM80 119h10v15H80zM130 119h10v15h-10z" fill="#ff426d" filter="url(#glow)"/>
  <path d="M4 135h212v25H4z" fill="#202433"/>
`));

write("assets/sprites/bullets/player_energy.svg", svg(20, 38, `
  <path d="M8 1h4l5 10v16l-7 10-7-10V11z" fill="#42f6ff" filter="url(#glow)"/>
  <path d="M9 6h2v21H9z" fill="#fff"/>
`));

write("assets/sprites/bullets/enemy_plasma.svg", svg(24, 24, `
  <circle cx="12" cy="12" r="9" fill="#ff7b32" filter="url(#glow)"/>
  <circle cx="12" cy="12" r="4" fill="#ffe36b"/>
`));

write("assets/sprites/bullets/missile.svg", svg(28, 48, `
  <path d="M13 2h2l8 13v22l-9 9-9-9V15z" fill="#f3f4f7"/>
  <path d="M8 25l-7 9v8l9-5zM20 25l7 9v8l-9-5z" fill="#ff426d"/>
  <path d="M10 38h8l-4 10z" fill="#ffcf5a" filter="url(#glow)"/>
`));

const power = (label, color, extra = "") => svg(46, 46, `
  <rect x="5" y="5" width="36" height="36" rx="4" fill="#09111f" stroke="${color}" stroke-width="3" filter="url(#glow)"/>
  <path d="M10 10h26v5H10zM10 31h26v5H10z" fill="rgba(255,255,255,.18)"/>
  ${extra || `<text x="23" y="30" text-anchor="middle" font-family="Courier New, monospace" font-size="22" font-weight="700" fill="${color}">${label}</text>`}
`);

write("assets/sprites/powerups/power.svg", power("P", "#ffd45a"));
write("assets/sprites/powerups/speed.svg", power("S", "#42f6ff"));
write("assets/sprites/powerups/bomb.svg", power("B", "#ff426d"));
write("assets/sprites/powerups/homing.svg", power("H", "#82ff70"));
write("assets/sprites/powerups/laser.svg", power("L", "#f074ff"));
write("assets/sprites/powerups/drone.svg", power("D", "#66a6ff"));
write("assets/sprites/powerups/star.svg", power("★", "#ffffff"));
write("assets/sprites/powerups/shield.svg", power("", "#b5f7ff", `<circle cx="23" cy="23" r="11" fill="none" stroke="#b5f7ff" stroke-width="4"/><path d="M23 11l10 5v9q0 9-10 13Q13 34 13 25v-9z" fill="rgba(181,247,255,.4)"/>`));
write("assets/sprites/powerups/life.svg", power("", "#ff7b9b", `<path d="M23 35C8 24 10 11 19 12c3 0 4 2 4 2s1-2 4-2c9-1 11 12-4 23z" fill="#ff7b9b" filter="url(#glow)"/>`));

write("assets/ui/hud/life_icon.svg", svg(32, 32, `
  <path d="M15 2h2l5 11 8 8v5l-10-3-3 7h-2l-3-7-10 3v-5l8-8z" fill="#66a6ff"/>
  <path d="M16 5l4 12-4 10-4-10z" fill="#d8efff"/>
`));
write("assets/ui/hud/bomb_icon.svg", svg(32, 32, `
  <circle cx="15" cy="18" r="10" fill="#ff426d"/>
  <path d="M20 9l7-6 2 2-6 7z" fill="#ffd45a"/>
  <path d="M10 15h10v5H10z" fill="#ffd6df"/>
`));

for (const theme of ["ocean", "island", "desert", "city", "space", "fortress", "storm"]) {
  write(`assets/backgrounds/${theme}/README.md`, `# ${theme}\n\nCanvas-rendered parallax stage art uses this folder as the theme asset home. Add far_background, cloud_layer, terrain_layer, detail_layer, and lighting_overlay images here for future replacement.\n`);
}
write("assets/audio/README.md", "# Audio\n\nPlaceholder arcade sounds are currently synthesized with Web Audio. Drop short loops and effects here when replacing them with authored audio.\n");

console.log("Generated arcade SVG assets.");
