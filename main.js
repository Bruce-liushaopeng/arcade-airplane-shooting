(() => {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;
  const DEBUG = new URLSearchParams(location.search).has("debug");
  const TAU = Math.PI * 2;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const dist2 = (a, b) => {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  };

  const THEMES = [
    { at: 0, name: "Ocean Sky", sky: "#113c7a", far: "#6cc6ff", near: "#0d8fb7", detail: "cloud" },
    { at: 360, name: "Island Battlefield", sky: "#186d75", far: "#7bd68a", near: "#26765e", detail: "island" },
    { at: 720, name: "Desert Airbase", sky: "#a86532", far: "#ffc66f", near: "#8f5e35", detail: "road" },
    { at: 1140, name: "Neon City", sky: "#161033", far: "#ca4dff", near: "#262d80", detail: "city" },
    { at: 1560, name: "Storm Zone", sky: "#1d2540", far: "#91a8d8", near: "#27344d", detail: "storm" },
    { at: 1680, name: "Fortress Approach", sky: "#24112a", far: "#ff667a", near: "#522034", detail: "fortress" },
    { at: 1800, name: "Endless Sector", sky: "#060914", far: "#42f6ff", near: "#171c3b", detail: "stars" }
  ];

  const ENEMY_TYPES = {
    basic: { label: "Scout", hp: 3, speed: 88, r: 18, score: 100, color: "#ff4b5f", fireDelay: 2.6, pattern: "straight" },
    zigzag: { label: "Zigzag", hp: 5, speed: 84, r: 18, score: 160, color: "#ff8f3d", fireDelay: 2.35, pattern: "aimed" },
    diver: { label: "Diver", hp: 4, speed: 64, r: 17, score: 180, color: "#f5ed62", fireDelay: 2.7, pattern: "aimed" },
    ufo: { label: "UFO", hp: 10, speed: 48, r: 23, score: 360, color: "#aa5cff", fireDelay: 1.6, pattern: "spread" },
    armored: { label: "Armored", hp: 18, speed: 46, r: 26, score: 520, color: "#c1d1e8", fireDelay: 1.7, pattern: "aimed" },
    turret: { label: "Turret", hp: 12, speed: 58, r: 21, score: 300, color: "#7cff9d", fireDelay: 1.45, pattern: "upAimed" },
    drone: { label: "Drone", hp: 2, speed: 150, r: 12, score: 90, color: "#5cffd2", fireDelay: 3.4, pattern: "none" },
    elite: { label: "Elite", hp: 26, speed: 76, r: 25, score: 760, color: "#ff4bd8", fireDelay: 1.15, pattern: "spiral" },
    laser: { label: "Laser Wing", hp: 16, speed: 62, r: 23, score: 680, color: "#ff3650", fireDelay: 2.4, pattern: "laser" }
  };

  const POWERUPS = [
    { type: "P", color: "#ffd45a", weight: 28 },
    { type: "S", color: "#42f6ff", weight: 12 },
    { type: "B", color: "#ff426d", weight: 10 },
    { type: "H", color: "#82ff70", weight: 12 },
    { type: "L", color: "#f074ff", weight: 10 },
    { type: "D", color: "#66a6ff", weight: 9 },
    { type: "SH", color: "#b5f7ff", weight: 7 },
    { type: "*", color: "#ffffff", weight: 10 },
    { type: "♥", color: "#ff7b9b", weight: 2 }
  ];

  const BOSSES = [
    { at: 270, key: "miniBomber", name: "WARNING: MINI-BOSS BOMBER", hp: 450, color: "#ff5f46", score: 7000, pattern: "spread", parts: 2 },
    { at: 600, key: "giantBomber", name: "WARNING: GIANT BOMBER", hp: 900, color: "#cde2ff", score: 16000, pattern: "walls", parts: 4 },
    { at: 1020, key: "mothership", name: "WARNING: UFO MOTHERSHIP", hp: 1250, color: "#a95cff", score: 24000, pattern: "radial", parts: 3 },
    { at: 1200, key: "airship", name: "WARNING: ARMORED AIRSHIP", hp: 1500, color: "#91a8d8", score: 28000, pattern: "walls", parts: 5 },
    { at: 1440, key: "twins", name: "WARNING: TWIN JET COMMANDERS", hp: 800, color: "#ffcc55", score: 30000, pattern: "crossfire", parts: 2, twin: true },
    { at: 1800, key: "fortress", name: "FINAL WARNING: SKY FORTRESS", hp: 2300, color: "#ff426d", score: 60000, pattern: "fortress", parts: 6 }
  ];

  const EVENTS = [
    [90, "ZIGZAG SQUADRONS"],
    [180, "WARNING: UFO AMBUSH"],
    [480, "GROUND TURRETS ACTIVE"],
    [840, "ARMORED WINGS DEPLOYED"],
    [900, "WARNING: MISSILE STORM"],
    [1260, "LASER ENEMIES INBOUND"],
    [1350, "WARNING: DRONE SWARM"],
    [1680, "FORTRESS DEFENSE ZONE"],
    [1860, "ENDLESS MODE"]
  ];

  const ASSET_PATHS = {
    player: "assets/sprites/player/player_fighter.svg",
    enemies: {
      basic: "assets/sprites/enemies/basic_red_fighter.svg",
      zigzag: "assets/sprites/enemies/green_zigzag_plane.svg",
      diver: "assets/sprites/enemies/missile_enemy.svg",
      ufo: "assets/sprites/enemies/purple_ufo.svg",
      armored: "assets/sprites/enemies/silver_armored_plane.svg",
      turret: "assets/sprites/enemies/turret_ground_cannon.svg",
      drone: "assets/sprites/enemies/small_drone.svg",
      elite: "assets/sprites/enemies/elite_black_fighter.svg",
      laser: "assets/sprites/enemies/elite_black_fighter.svg"
    },
    bosses: {
      miniBomber: "assets/sprites/bosses/giant_bomber.svg",
      giantBomber: "assets/sprites/bosses/giant_bomber.svg",
      mothership: "assets/sprites/bosses/ufo_mothership.svg",
      airship: "assets/sprites/bosses/armored_airship.svg",
      twins: "assets/sprites/bosses/twin_jet_commander.svg",
      fortress: "assets/sprites/bosses/sky_fortress.svg"
    },
    bullets: {
      player: "assets/sprites/bullets/player_energy.svg",
      enemy: "assets/sprites/bullets/enemy_plasma.svg",
      missile: "assets/sprites/bullets/missile.svg"
    },
    powerups: {
      P: "assets/sprites/powerups/power.svg",
      S: "assets/sprites/powerups/speed.svg",
      B: "assets/sprites/powerups/bomb.svg",
      H: "assets/sprites/powerups/homing.svg",
      L: "assets/sprites/powerups/laser.svg",
      D: "assets/sprites/powerups/drone.svg",
      SH: "assets/sprites/powerups/shield.svg",
      "*": "assets/sprites/powerups/star.svg",
      "♥": "assets/sprites/powerups/life.svg"
    },
    ui: {
      life: "assets/ui/hud/life_icon.svg",
      bomb: "assets/ui/hud/bomb_icon.svg"
    }
  };

  class AssetManager {
    constructor(paths) {
      this.images = new Map();
      this.load(paths);
    }

    load(value) {
      if (typeof value === "string") {
        this.image(value);
        return;
      }
      for (const item of Object.values(value)) this.load(item);
    }

    image(src) {
      if (!this.images.has(src)) {
        const img = new Image();
        img.decoding = "async";
        img.src = src;
        this.images.set(src, img);
      }
      return this.images.get(src);
    }

    draw(g, src, x, y, w, h, angle = 0, alpha = 1) {
      const img = this.image(src);
      if (!img.complete || img.naturalWidth === 0) return false;
      g.save();
      g.globalAlpha *= alpha;
      g.translate(x, y);
      g.rotate(angle);
      g.drawImage(img, -w / 2, -h / 2, w, h);
      g.restore();
      return true;
    }
  }

  class AudioManager {
    constructor() {
      this.muted = localStorage.getItem("sky45-muted") === "1";
      this.ctx = null;
      this.musicTimer = 0;
    }

    ensure() {
      if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.ctx.state === "suspended") this.ctx.resume();
    }

    tone(freq, duration = 0.08, type = "square", gain = 0.035, slide = 0) {
      if (this.muted) return;
      this.ensure();
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const vol = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + duration);
      vol.gain.setValueAtTime(gain, t);
      vol.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      osc.connect(vol).connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + duration);
    }

    shoot() { this.tone(650, 0.035, "square", 0.012, 120); }
    enemyShoot() { this.tone(210, 0.045, "sawtooth", 0.012, -50); }
    explode(big = false) { this.tone(big ? 95 : 150, big ? 0.25 : 0.13, "sawtooth", big ? 0.06 : 0.035, -70); }
    pickup() { this.tone(820, 0.08, "triangle", 0.045, 360); }
    hit() { this.tone(80, 0.22, "square", 0.055, -25); }
    warning() { this.tone(440, 0.12, "square", 0.05); setTimeout(() => this.tone(330, 0.12, "square", 0.05), 150); }
    toggleMute() {
      this.muted = !this.muted;
      localStorage.setItem("sky45-muted", this.muted ? "1" : "0");
    }

    update(dt, boss) {
      this.musicTimer -= dt;
      if (this.musicTimer <= 0 && !this.muted) {
        const base = boss ? 165 : 110;
        this.tone(base, 0.08, "triangle", 0.012);
        this.tone(base * 1.5, 0.05, "square", 0.007);
        this.musicTimer = boss ? 0.34 : 0.58;
      }
    }
  }

  class InputManager {
    constructor(game) {
      this.game = game;
      this.keys = new Set();
      this.pointer = { active: false, x: W / 2, y: H * 0.76 };
      this.joystick = null;
      this.usingTouch = false;
      this.bombButton = { x: W - 74, y: H - 86, r: 44, down: false };
      this.pauseButton = { x: W - 34, y: 34, r: 24 };
      this.bind();
    }

    bind() {
      window.addEventListener("keydown", (e) => {
        const key = e.key.toLowerCase();
        this.keys.add(key);
        if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(e.key.toLowerCase()) || e.code === "Space") e.preventDefault();
        if (key === "p") this.game.togglePause();
        if (e.code === "Space") this.game.useBomb();
        if (key === "m") this.game.audio.toggleMute();
        if (this.game.state === "welcome" && (key === "enter" || e.code === "Space")) this.game.startGame();
      }, { passive: false });
      window.addEventListener("keyup", (e) => this.keys.delete(e.key.toLowerCase()));
      canvas.addEventListener("mousemove", (e) => {
        if (this.usingTouch) return;
        const p = this.toCanvas(e.clientX, e.clientY);
        this.pointer = { active: true, x: p.x, y: p.y };
        if (this.game.state === "welcome") this.game.hoverWake = true;
      });
      canvas.addEventListener("click", (e) => {
        const p = this.toCanvas(e.clientX, e.clientY);
        this.game.handleMenuClick(p.x, p.y);
      });
      canvas.addEventListener("touchstart", (e) => this.touchStart(e), { passive: false });
      canvas.addEventListener("touchmove", (e) => this.touchMove(e), { passive: false });
      canvas.addEventListener("touchend", (e) => this.touchEnd(e), { passive: false });
      canvas.addEventListener("touchcancel", (e) => this.touchEnd(e), { passive: false });
    }

    toCanvas(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: clamp((clientX - rect.left) / rect.width * W, 0, W),
        y: clamp((clientY - rect.top) / rect.height * H, 0, H)
      };
    }

    touchStart(e) {
      e.preventDefault();
      this.usingTouch = true;
      for (const touch of e.changedTouches) {
        const p = this.toCanvas(touch.clientX, touch.clientY);
        if (dist2(p, this.bombButton) < this.bombButton.r * this.bombButton.r * 1.4 && this.game.state === "playing") {
          this.bombButton.down = true;
          this.game.useBomb();
          continue;
        }
        if (dist2(p, this.pauseButton) < this.pauseButton.r * this.pauseButton.r * 1.8 && this.game.state === "playing") {
          this.game.togglePause();
          continue;
        }
        if (this.game.state !== "playing") {
          this.game.handleMenuClick(p.x, p.y);
          continue;
        }
        if (!this.joystick) {
          this.joystick = { id: touch.identifier, sx: p.x, sy: p.y, x: p.x, y: p.y, dx: 0, dy: 0, mag: 0 };
        }
      }
    }

    touchMove(e) {
      e.preventDefault();
      if (!this.joystick) return;
      for (const touch of e.changedTouches) {
        if (touch.identifier !== this.joystick.id) continue;
        const p = this.toCanvas(touch.clientX, touch.clientY);
        const dx = p.x - this.joystick.sx;
        const dy = p.y - this.joystick.sy;
        const len = Math.hypot(dx, dy) || 1;
        const max = 74;
        this.joystick.x = this.joystick.sx + dx / len * Math.min(max, len);
        this.joystick.y = this.joystick.sy + dy / len * Math.min(max, len);
        this.joystick.dx = dx / len;
        this.joystick.dy = dy / len;
        this.joystick.mag = clamp(len / max, 0, 1);
      }
    }

    touchEnd(e) {
      e.preventDefault();
      for (const touch of e.changedTouches) {
        if (this.joystick && touch.identifier === this.joystick.id) this.joystick = null;
      }
      this.bombButton.down = false;
    }

    movementVector() {
      let x = 0, y = 0;
      if (this.keys.has("arrowleft") || this.keys.has("a")) x -= 1;
      if (this.keys.has("arrowright") || this.keys.has("d")) x += 1;
      if (this.keys.has("arrowup") || this.keys.has("w")) y -= 1;
      if (this.keys.has("arrowdown") || this.keys.has("s")) y += 1;
      if (this.joystick) {
        x += this.joystick.dx * this.joystick.mag;
        y += this.joystick.dy * this.joystick.mag;
      }
      const len = Math.hypot(x, y);
      return len > 1 ? { x: x / len, y: y / len } : { x, y };
    }
  }

  class Player {
    constructor(game) {
      this.game = game;
      this.resetForMode("classic");
    }

    resetForMode(mode) {
      this.mode = mode;
      this.x = W / 2;
      this.y = H * 0.78;
      this.targetX = this.x;
      this.targetY = this.y;
      this.r = 8;
      this.visualR = 23;
      this.baseSpeed = 250;
      this.speed = 250;
      this.weaponLevel = 1;
      this.weaponType = "basic";
      this.lives = mode === "coin" ? 5 : 3;
      this.maxLives = this.lives;
      this.bombs = mode === "coin" ? 2 : 1;
      this.multiplier = 1;
      this.multTimer = 0;
      this.fireDelayTimer = 0;
      this.invincible = 2.2;
      this.shield = 0;
      this.rapid = 0;
      this.laserTimer = 0;
      this.drones = 0;
      this.homing = 0;
      this.bank = 0;
    }

    update(dt) {
      const input = this.game.input;
      const vec = input.movementVector();
      const mouseActive = input.pointer.active && !input.usingTouch && this.game.state === "playing";
      if (mouseActive) {
        this.targetX = clamp(input.pointer.x, 28, W - 28);
        this.targetY = clamp(input.pointer.y, 80, H - 36);
        this.bank = clamp((this.targetX - this.x) / 90, -1, 1);
        this.x = lerp(this.x, this.targetX, 1 - Math.pow(0.001, dt));
        this.y = lerp(this.y, this.targetY, 1 - Math.pow(0.001, dt));
      } else {
        this.bank = lerp(this.bank, vec.x, 0.22);
        this.x += vec.x * this.speed * dt;
        this.y += vec.y * this.speed * dt;
      }
      this.x = clamp(this.x, 25, W - 25);
      this.y = clamp(this.y, 70, H - 35);
      this.fireDelayTimer -= dt;
      this.invincible = Math.max(0, this.invincible - dt);
      this.shield = Math.max(0, this.shield - dt);
      this.rapid = Math.max(0, this.rapid - dt);
      this.laserTimer = Math.max(0, this.laserTimer - dt);
      this.multTimer = Math.max(0, this.multTimer - dt);
      if (this.multTimer <= 0) this.multiplier = 1;
      if (this.fireDelayTimer <= 0) this.fire();
    }

    fire() {
      const level = this.weaponLevel;
      const rate = this.rapid > 0 ? 0.09 : Math.max(0.12, 0.22 - level * 0.012);
      this.fireDelayTimer = rate;
      const shots = [];
      const push = (ox, angle, speed = 600, type = "player") => shots.push({ x: this.x + ox, y: this.y - 24, vx: Math.sin(angle) * speed, vy: -Math.cos(angle) * speed, r: 4, damage: 1 + Math.floor(level / 3), type, life: 1.7, color: "#66f7ff" });
      push(0, 0);
      if (level >= 2) { push(-10, 0); push(10, 0); }
      if (level >= 4) { push(-15, -0.18); push(15, 0.18); }
      if (level >= 7) { push(-22, -0.32); push(22, 0.32); }
      if (this.homing > 0 && this.game.elapsed % 0.35 < 0.04) {
        shots.push({ x: this.x, y: this.y - 22, vx: -70, vy: -430, r: 6, damage: 3, type: "homing", life: 2.4, color: "#a2ff6a" });
        shots.push({ x: this.x, y: this.y - 22, vx: 70, vy: -430, r: 6, damage: 3, type: "homing", life: 2.4, color: "#a2ff6a" });
      }
      if (this.drones > 0) {
        const count = Math.min(2, this.drones);
        for (let i = 0; i < count; i++) {
          const side = i === 0 ? -1 : 1;
          shots.push({ x: this.x + side * 36, y: this.y - 4, vx: side * 18, vy: -520, r: 4, damage: 1, type: "player", life: 1.5, color: "#7ca6ff" });
        }
      }
      if (this.laserTimer > 0) {
        shots.push({ x: this.x, y: this.y - 110, vx: 0, vy: -900, r: 10, damage: 8, type: "laser", life: 0.28, color: "#f074ff" });
      }
      this.game.playerBullets.push(...shots);
      this.game.audio.shoot();
    }

    collect(power) {
      switch (power.type) {
        case "P": this.weaponLevel = Math.min(10, this.weaponLevel + 1); break;
        case "S": this.speed = Math.min(340, this.speed + 18); break;
        case "B": this.bombs = Math.min(6, this.bombs + 1); break;
        case "H": this.homing = Math.min(3, this.homing + 1); break;
        case "L": this.laserTimer = 12; break;
        case "D": this.drones = Math.min(2, this.drones + 1); break;
        case "SH": this.shield = 12; break;
        case "*": this.multiplier = Math.min(5, this.multiplier + 1); this.multTimer = 18; break;
        case "♥": this.lives = Math.min(8, this.lives + 1); break;
      }
      this.game.audio.pickup();
    }

    damage() {
      if (this.invincible > 0 || this.shield > 0) return;
      this.lives -= 1;
      this.weaponLevel = Math.max(1, this.weaponLevel - 2);
      this.drones = Math.max(0, this.drones - 1);
      this.invincible = 2.4;
      this.game.shake = 16;
      this.game.spawnExplosion(this.x, this.y, "#66f7ff", 24, true);
      this.game.audio.hit();
      if (this.lives <= 0) this.game.enterContinue();
    }

    draw(g) {
      const blink = this.invincible > 0 && Math.floor(this.invincible * 12) % 2 === 0;
      if (blink) return;
      g.save();
      g.translate(this.x, this.y);
      g.rotate(this.bank * 0.16);
      if (this.shield > 0) {
        g.strokeStyle = "rgba(181,247,255,0.75)";
        g.lineWidth = 3;
        g.beginPath();
        g.arc(0, 0, 34 + Math.sin(this.game.time * 6) * 3, 0, TAU);
        g.stroke();
      }
      g.shadowColor = "#42f6ff";
      g.shadowBlur = 10;
      const drew = this.game.assets.draw(g, ASSET_PATHS.player, 0, 0, 58, 72);
      g.shadowBlur = 0;
      const flame = 12 + Math.sin(this.game.time * 46) * 5 + Math.random() * 4;
      g.fillStyle = "#fff06a";
      g.fillRect(-3, 29, 6, flame * 0.45);
      g.fillStyle = "#ff7b32";
      g.fillRect(-5, 33, 10, flame);
      if (!drew) {
        g.fillStyle = "#245cff";
        g.beginPath();
        g.moveTo(0, -36); g.lineTo(26, 18); g.lineTo(6, 10); g.lineTo(0, 35); g.lineTo(-6, 10); g.lineTo(-26, 18); g.closePath(); g.fill();
        g.fillStyle = "#bcdcff"; g.fillRect(-4, -18, 8, 16);
      }
      for (let i = 0; i < this.drones; i++) {
        const side = i === 0 ? -1 : 1;
        this.game.assets.draw(g, ASSET_PATHS.enemies.drone, side * 39, 5, 26, 26);
      }
      if (DEBUG) {
        g.strokeStyle = "#fff";
        g.beginPath(); g.arc(0, 0, this.r, 0, TAU); g.stroke();
      }
      g.restore();
    }
  }

  class Enemy {
    constructor(game, type, x, y, opts = {}) {
      this.game = game;
      Object.assign(this, ENEMY_TYPES[type]);
      this.type = type;
      this.maxHp = Math.ceil(this.hp * opts.hpScale);
      this.hp = this.maxHp;
      this.x = x;
      this.y = y;
      this.baseX = x;
      this.t = opts.offset || 0;
      this.vx = opts.vx || 0;
      this.vy = (this.speed + opts.speedBonus) * (opts.vyScale || 1);
      this.fireDelayTimer = 0.8 + Math.random() * this.fireDelay;
      this.phase = Math.random() * TAU;
      this.dead = false;
      this.dropChance = opts.dropChance || 0.12;
      this.angle = Math.PI / 2;
    }

    update(dt) {
      this.t += dt;
      const p = this.game.player;
      if (this.type === "zigzag") this.x = this.baseX + Math.sin(this.t * 3.1 + this.phase) * 64;
      if (this.type === "diver") {
        this.vy = this.t < 1 ? 35 : 60 + this.t * 95;
        this.x += Math.sign(p.x - this.x) * Math.min(110, Math.abs(p.x - this.x)) * dt * 0.75;
      }
      if (this.type === "ufo") this.x = this.baseX + Math.sin(this.t * 2.2 + this.phase) * 94;
      if (this.type === "drone") this.x += Math.sin(this.t * 7 + this.phase) * 115 * dt;
      if (this.type === "elite") this.x = this.baseX + Math.sin(this.t * 2.6 + this.phase) * 82 + Math.sin(this.t * 5) * 20;
      if (this.type === "laser") this.x = this.baseX + Math.sin(this.t * 1.9 + this.phase) * 52;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.fireDelayTimer -= dt;
      if (this.fireDelayTimer <= 0 && this.y > 20 && this.y < H - 140) this.fire();
      if (this.y > H + 80 || this.x < -90 || this.x > W + 90) this.dead = true;
    }

    fire() {
      this.fireDelayTimer = Math.max(0.45, this.fireDelay - this.game.difficulty * 0.05 + Math.random() * 0.5);
      this.game.fireEnemyPattern(this, this.pattern);
    }

    hit(damage) {
      this.hp -= damage;
      if (this.hp <= 0) {
        this.dead = true;
        this.game.addScore(this.score, this.x, this.y);
        this.game.kills += 1;
        this.game.spawnExplosion(this.x, this.y, this.color, this.r + 12);
        if (Math.random() < this.dropChance) this.game.dropPower(this.x, this.y);
        this.game.audio.explode(false);
      }
    }

    draw(g) {
      g.save();
      g.translate(this.x, this.y);
      const bob = this.type === "ufo" ? Math.sin(this.game.time * 5 + this.phase) * 3 : 0;
      const src = ASSET_PATHS.enemies[this.type] || ASSET_PATHS.enemies.basic;
      const scale = this.type === "armored" ? 2.05 : this.type === "ufo" ? 1.3 : this.type === "turret" ? 1.08 : this.type === "drone" ? 1 : 1.15;
      const angle = this.type === "ufo" || this.type === "turret" || this.type === "drone" ? 0 : Math.PI;
      g.shadowColor = this.color;
      g.shadowBlur = this.type === "elite" || this.type === "ufo" ? 12 : 5;
      const drew = this.game.assets.draw(g, src, 0, bob, this.r * 2.25 * scale, this.r * 2.75 * scale, angle);
      g.shadowBlur = 0;
      if (!drew) {
        g.fillStyle = this.color;
        g.beginPath();
        g.moveTo(0, this.r + 9); g.lineTo(-this.r, -8); g.lineTo(-6, -this.r); g.lineTo(0, -5); g.lineTo(6, -this.r); g.lineTo(this.r, -8); g.closePath(); g.fill();
      }
      if (this.maxHp > 10) {
        g.fillStyle = "rgba(0,0,0,0.55)";
        g.fillRect(-this.r, -this.r - 10, this.r * 2, 4);
        g.fillStyle = "#5cff9d";
        g.fillRect(-this.r, -this.r - 10, this.r * 2 * Math.max(0, this.hp / this.maxHp), 4);
      }
      if (DEBUG) {
        g.strokeStyle = "#fff";
        g.beginPath(); g.arc(0, 0, this.r, 0, TAU); g.stroke();
      }
      g.restore();
    }
  }

  class Boss {
    constructor(game, spec, xOffset = 0) {
      this.game = game;
      this.spec = spec;
      this.name = spec.name.replace(/^WARNING: |^FINAL WARNING: /, "");
      this.x = W / 2 + xOffset;
      this.y = -110;
      this.r = spec.key === "fortress" ? 88 : 58;
      this.maxHp = spec.twin ? spec.hp : spec.hp;
      this.hp = this.maxHp;
      this.color = spec.color;
      this.score = spec.score;
      this.pattern = spec.pattern;
      this.parts = spec.parts;
      this.fireDelayTimer = 1;
      this.t = 0;
      this.dead = false;
      this.entered = false;
      this.phase = 1;
    }

    update(dt) {
      this.t += dt;
      if (this.y < 150) this.y += 70 * dt;
      else this.entered = true;
      this.x += Math.sin(this.t * (this.spec.key === "fortress" ? 0.7 : 1.2)) * 72 * dt;
      this.x = clamp(this.x, this.r + 20, W - this.r - 20);
      const hpRatio = this.hp / this.maxHp;
      this.phase = hpRatio < 0.33 ? 3 : hpRatio < 0.66 ? 2 : 1;
      this.fireDelayTimer -= dt;
      if (this.entered && this.fireDelayTimer <= 0) this.fire();
    }

    fire() {
      this.fireDelayTimer = Math.max(0.42, 1.45 - this.phase * 0.28 - this.game.difficulty * 0.035);
      this.game.fireBossPattern(this);
    }

    hit(damage) {
      this.hp -= damage;
      this.game.flash = Math.max(this.game.flash, 0.12);
      if (this.hp <= 0) {
        this.dead = true;
        this.game.addScore(this.score, this.x, this.y);
        this.game.kills += 8;
        for (let i = 0; i < 10; i++) {
          setTimeout(() => this.game.spawnExplosion(this.x + (Math.random() - 0.5) * this.r * 2, this.y + (Math.random() - 0.5) * this.r * 1.2, this.color, 34, true), i * 80);
        }
        this.game.dropPower(this.x - 30, this.y);
        this.game.dropPower(this.x + 30, this.y);
        this.game.shake = 28;
        this.game.audio.explode(true);
      }
    }

    draw(g) {
      g.save();
      g.translate(this.x, this.y);
      const src = ASSET_PATHS.bosses[this.spec.key] || ASSET_PATHS.bosses.giantBomber;
      const width = this.spec.key === "fortress" ? 205 : this.spec.key === "mothership" ? 184 : this.spec.key === "airship" ? 186 : this.spec.key === "twins" ? 124 : 172;
      const height = this.spec.key === "fortress" ? 158 : this.spec.key === "mothership" ? 108 : this.spec.key === "airship" ? 128 : this.spec.key === "twins" ? 104 : 126;
      const flash = this.game.flash > 0 ? 0.75 : 1;
      g.shadowColor = this.color;
      g.shadowBlur = 16;
      const drew = this.game.assets.draw(g, src, 0, 0, width, height, this.spec.key === "mothership" || this.spec.key === "fortress" || this.spec.key === "airship" ? 0 : Math.PI, flash);
      g.shadowBlur = 0;
      if (!drew) {
        g.fillStyle = this.color;
        g.beginPath();
        g.moveTo(0, -this.r); g.lineTo(this.r, 8); g.lineTo(this.r * 0.7, this.r); g.lineTo(0, this.r * 0.55); g.lineTo(-this.r * 0.7, this.r); g.lineTo(-this.r, 8); g.closePath(); g.fill();
      }
      g.fillStyle = "rgba(255,255,255,0.2)";
      for (let i = 0; i < this.parts; i++) {
        const px = lerp(-this.r * 0.65, this.r * 0.65, this.parts === 1 ? 0.5 : i / (this.parts - 1));
        g.fillStyle = i % 2 ? "#ffd45a" : "#42f6ff";
        g.fillRect(px - 4, this.r * 0.28, 8, 8);
      }
      g.restore();
    }
  }

  class WaveDirector {
    constructor(game) {
      this.game = game;
      this.spawnTimer = 0;
      this.eventIndex = 0;
      this.bossIndex = 0;
      this.lastFormation = "";
    }

    reset() {
      this.spawnTimer = 0;
      this.eventIndex = 0;
      this.bossIndex = 0;
      this.lastFormation = "";
    }

    update(dt) {
      const elapsed = this.game.elapsed;
      while (this.eventIndex < EVENTS.length && elapsed >= EVENTS[this.eventIndex][0]) {
        this.game.banner(EVENTS[this.eventIndex][1], "#ffd45a");
        this.game.audio.warning();
        this.eventIndex += 1;
      }
      if (this.bossIndex < BOSSES.length && elapsed >= BOSSES[this.bossIndex].at && !this.game.bosses.length) {
        this.spawnBoss(BOSSES[this.bossIndex]);
        this.bossIndex += 1;
        return;
      }
      if (this.game.bosses.length) return;
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) this.spawnWave();
    }

    spawnBoss(spec) {
      this.game.banner(spec.name, spec.key === "fortress" ? "#ff426d" : "#ffd45a");
      this.game.audio.warning();
      if (spec.twin) {
        this.game.bosses.push(new Boss(this.game, spec, -85), new Boss(this.game, spec, 85));
      } else {
        this.game.bosses.push(new Boss(this.game, spec));
      }
    }

    availableTypes() {
      const t = this.game.elapsed;
      const types = ["basic"];
      if (t > 75) types.push("zigzag");
      if (t > 135) types.push("diver", "ufo");
      if (t > 450) types.push("turret");
      if (t > 720) types.push("armored");
      if (t > 1080) types.push("drone", "elite");
      if (t > 1260) types.push("laser");
      if (t > 1800) types.push("elite", "drone", "ufo", "armored");
      return types;
    }

    spawnWave() {
      const diff = this.game.difficulty;
      const types = this.availableTypes();
      const formations = ["line", "v", "alternate", "ambush", "swarm", "circle"];
      const formation = formations[Math.floor(Math.random() * formations.length)];
      const count = clamp(Math.floor(4 + diff * 0.7 + Math.random() * 4), 4, formation === "swarm" ? 16 : 10);
      const type = types[Math.floor(Math.random() * types.length)];
      const opts = { hpScale: 1 + diff * 0.09, speedBonus: diff * 5, dropChance: 0.1 + Math.min(0.11, diff * 0.008) };
      this.lastFormation = `${formation} ${type}`;
      if (formation === "line") {
        for (let i = 0; i < count; i++) setTimeout(() => this.game.spawnEnemy(type, 70 + i * (W - 140) / Math.max(1, count - 1), -40, opts), i * 90);
      } else if (formation === "v") {
        for (let i = 0; i < count; i++) {
          const side = i % 2 ? 1 : -1;
          const row = Math.floor(i / 2);
          setTimeout(() => this.game.spawnEnemy(type, W / 2 + side * row * 35, -40 - row * 22, opts), i * 70);
        }
      } else if (formation === "alternate") {
        for (let i = 0; i < count; i++) setTimeout(() => this.game.spawnEnemy(types[i % types.length], i % 2 ? W - 62 : 62, -40, { ...opts, vx: i % 2 ? -22 : 22 }), i * 135);
      } else if (formation === "ambush") {
        for (let i = 0; i < count; i++) setTimeout(() => this.game.spawnEnemy(type, i % 2 ? -25 : W + 25, 120 + Math.random() * 220, { ...opts, vx: i % 2 ? 65 : -65, vyScale: 0.35 }), i * 95);
      } else if (formation === "circle") {
        for (let i = 0; i < count; i++) {
          const a = i / count * TAU;
          setTimeout(() => this.game.spawnEnemy(i % 3 === 0 ? "ufo" : type, W / 2 + Math.cos(a) * 120, -65 + Math.sin(a) * 35, { ...opts, offset: a }), i * 70);
        }
      } else {
        for (let i = 0; i < count + 5; i++) setTimeout(() => this.game.spawnEnemy("drone", 40 + Math.random() * (W - 80), -30 - Math.random() * 80, opts), i * 45);
      }
      this.spawnTimer = clamp(2.7 - diff * 0.075, 0.72, 2.7) + Math.random() * 0.55;
    }
  }

  class Game {
    constructor() {
      this.assets = new AssetManager(ASSET_PATHS);
      this.audio = new AudioManager();
      this.input = new InputManager(this);
      this.player = new Player(this);
      this.director = new WaveDirector(this);
      this.state = "welcome";
      this.mode = "classic";
      this.time = 0;
      this.elapsed = 0;
      this.difficulty = 0;
      this.score = 0;
      this.kills = 0;
      this.continues = 0;
      this.stage = 1;
      this.playerBullets = [];
      this.enemyBullets = [];
      this.enemies = [];
      this.bosses = [];
      this.powerups = [];
      this.explosions = [];
      this.floaters = [];
      this.lasers = [];
      this.banners = [];
      this.particles = [];
      this.shake = 0;
      this.flash = 0;
      this.continueTimer = 9;
      this.hoverWake = false;
      this.last = performance.now();
      this.fps = 60;
      this.storage = this.loadStorage();
      this.menuButtons = [];
      this.seedBackground();
      requestAnimationFrame((t) => this.loop(t));
    }

    loadStorage() {
      try {
        return JSON.parse(localStorage.getItem("sky45-records")) || { highScore: 0, longest: 0, stage: 1, kills: 0, fewestContinues: null };
      } catch {
        return { highScore: 0, longest: 0, stage: 1, kills: 0, fewestContinues: null };
      }
    }

    saveStorage() {
      const r = this.storage;
      r.highScore = Math.max(r.highScore, this.score);
      r.longest = Math.max(r.longest, this.elapsed);
      r.stage = Math.max(r.stage, this.stage);
      r.kills = Math.max(r.kills, this.kills);
      r.fewestContinues = r.fewestContinues === null ? this.continues : Math.min(r.fewestContinues, this.continues);
      localStorage.setItem("sky45-records", JSON.stringify(r));
    }

    seedBackground() {
      this.bg = Array.from({ length: 90 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        s: 18 + Math.random() * 82,
        lane: Math.floor(Math.random() * 4),
        p: Math.random(),
        kind: Math.floor(Math.random() * 6)
      }));
    }

    resetRun() {
      this.player.resetForMode(this.mode);
      this.elapsed = 0;
      this.difficulty = 0;
      this.score = 0;
      this.kills = 0;
      this.continues = 0;
      this.stage = 1;
      this.playerBullets.length = 0;
      this.enemyBullets.length = 0;
      this.enemies.length = 0;
      this.bosses.length = 0;
      this.powerups.length = 0;
      this.explosions.length = 0;
      this.floaters.length = 0;
      this.lasers.length = 0;
      this.banners.length = 0;
      this.director.reset();
      this.banner("STAGE 1: OCEAN SKY", "#42f6ff");
    }

    startGame() {
      this.audio.ensure();
      this.resetRun();
      this.state = "playing";
    }

    togglePause() {
      if (this.state === "playing") this.state = "paused";
      else if (this.state === "paused") this.state = "playing";
    }

    enterContinue() {
      this.state = "continue";
      this.continueTimer = 9.99;
      this.enemyBullets.length = 0;
      this.saveStorage();
      this.audio.warning();
    }

    continueGame() {
      this.continues += 1;
      this.player.lives = this.mode === "coin" ? 5 : 3;
      this.player.bombs = Math.max(this.player.bombs, 1);
      this.player.invincible = 4;
      this.player.x = W / 2;
      this.player.y = H * 0.78;
      this.enemyBullets.length = 0;
      this.state = "playing";
      this.banner("CREDIT ACCEPTED", "#5cff9d");
    }

    gameOver() {
      this.state = "gameover";
      this.saveStorage();
      this.audio.tone(100, 0.5, "sawtooth", 0.05, -55);
    }

    handleMenuClick(x, y) {
      const hit = this.menuButtons.find((b) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h);
      if (!hit) {
        if (this.state === "welcome" && this.hoverWake) this.startGame();
        return;
      }
      if (hit.action === "classic") this.mode = "classic";
      if (hit.action === "coin") this.mode = "coin";
      if (hit.action === "start") this.startGame();
      if (hit.action === "resume") this.state = "playing";
      if (hit.action === "restart") this.startGame();
      if (hit.action === "menu") this.state = "welcome";
      if (hit.action === "continue") this.continueGame();
      if (hit.action === "mute") this.audio.toggleMute();
    }

    useBomb() {
      if (this.state !== "playing" || this.player.bombs <= 0) return;
      this.player.bombs -= 1;
      this.enemyBullets.length = 0;
      this.shake = 26;
      this.flash = 0.35;
      for (const e of this.enemies) e.hit(8 + this.player.weaponLevel * 2);
      for (const b of this.bosses) b.hit(90);
      this.spawnExplosion(this.player.x, this.player.y - 80, "#ffffff", 90, true);
      this.audio.explode(true);
      this.banner("BOMB CLEAR", "#ffffff");
    }

    spawnEnemy(type, x, y, opts) {
      this.enemies.push(new Enemy(this, type, x, y, opts));
    }

    dropPower(x, y) {
      const total = POWERUPS.reduce((s, p) => s + p.weight, 0);
      let n = Math.random() * total;
      const picked = POWERUPS.find((p) => (n -= p.weight) <= 0) || POWERUPS[0];
      this.powerups.push({ ...picked, x, y, vy: 72, r: 18, t: 0 });
    }

    addScore(points, x, y) {
      const gained = Math.floor(points * this.player.multiplier);
      this.score += gained;
      this.floaters.push({ x, y, text: `+${gained}`, color: "#ffd45a", life: 0.8 });
    }

    spawnExplosion(x, y, color, size = 24, big = false) {
      this.explosions.push({ x, y, color, size, life: big ? 0.8 : 0.45, max: big ? 0.8 : 0.45 });
      const count = big ? 24 : 10;
      for (let i = 0; i < count; i++) {
        const a = Math.random() * TAU;
        const s = (big ? 80 : 45) + Math.random() * (big ? 180 : 90);
        this.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, color, life: 0.45 + Math.random() * 0.45 });
      }
    }

    banner(text, color) {
      this.banners.push({ text, color, life: 3, max: 3 });
    }

    fireEnemyPattern(source, pattern) {
      const p = this.player;
      const aimedAngle = Math.atan2(p.y - source.y, p.x - source.x);
      const speed = 120 + this.difficulty * 6;
      const bullet = (angle, sp = speed, r = 5, color = "#ffcf5a") => {
        this.enemyBullets.push({ x: source.x, y: source.y + 8, vx: Math.cos(angle) * sp, vy: Math.sin(angle) * sp, r, life: 5, color });
      };
      if (pattern === "none") return;
      if (pattern === "straight") bullet(Math.PI / 2, speed * 0.86);
      if (pattern === "aimed" || pattern === "upAimed") bullet(aimedAngle, speed);
      if (pattern === "spread") for (let i = -1; i <= 1; i++) bullet(Math.PI / 2 + i * 0.24, speed * 0.92, 5, "#ff75d6");
      if (pattern === "spiral") for (let i = 0; i < 5; i++) bullet(source.t * 2 + i * TAU / 5, speed * 0.8, 5, "#f074ff");
      if (pattern === "laser") {
        this.lasers.push({ x: source.x, y: source.y, angle: aimedAngle, warn: 0.75, fire: 0.28, life: 1.03 });
      }
      this.audio.enemyShoot();
    }

    fireBossPattern(boss) {
      const phase = boss.phase;
      const speed = 115 + this.difficulty * 8 + phase * 18;
      const bullet = (x, y, angle, sp = speed, r = 6, color = "#ffcf5a") => this.enemyBullets.push({ x, y, vx: Math.cos(angle) * sp, vy: Math.sin(angle) * sp, r, life: 6, color });
      const aimed = Math.atan2(this.player.y - boss.y, this.player.x - boss.x);
      if (boss.pattern === "spread") {
        for (let i = -3; i <= 3; i++) bullet(boss.x, boss.y + 35, Math.PI / 2 + i * 0.16);
      } else if (boss.pattern === "walls") {
        for (let i = 0; i < 9; i++) bullet(50 + i * 55, boss.y + 45, Math.PI / 2 + Math.sin(boss.t + i) * 0.08, speed * 0.72, 7, "#ff7b42");
        bullet(boss.x, boss.y, aimed, speed * 1.1, 6, "#ffffff");
      } else if (boss.pattern === "radial") {
        for (let i = 0; i < 14 + phase * 2; i++) bullet(boss.x, boss.y, boss.t * 0.8 + i * TAU / (14 + phase * 2), speed * 0.82, 5, "#b76cff");
      } else if (boss.pattern === "crossfire") {
        for (let i = -2; i <= 2; i++) bullet(boss.x, boss.y + 30, aimed + i * 0.18, speed, 6, "#ffd45a");
      } else {
        for (let i = 0; i < 18; i++) bullet(boss.x, boss.y + 45, boss.t + i * TAU / 18, speed * 0.75, 5, i % 2 ? "#ff426d" : "#42f6ff");
        if (phase > 1) this.lasers.push({ x: boss.x - 55, y: boss.y + 20, angle: Math.PI / 2, warn: 0.85, fire: 0.36, life: 1.21 });
        if (phase > 2) this.lasers.push({ x: boss.x + 55, y: boss.y + 20, angle: Math.PI / 2, warn: 0.85, fire: 0.36, life: 1.21 });
      }
      this.audio.enemyShoot();
    }

    update(dt) {
      this.time += dt;
      this.audio.update(dt, this.bosses.length > 0);
      this.updateEffects(dt);
      if (this.state === "playing") {
        this.elapsed += dt;
        this.difficulty = Math.min(40, this.elapsed / 60);
        this.stage = Math.max(1, Math.floor(this.elapsed / 180) + 1);
        this.player.update(dt);
        this.director.update(dt);
        this.updateEntities(dt);
        this.collisions();
      } else if (this.state === "continue") {
        this.continueTimer -= dt;
        if (this.continueTimer <= 0) this.gameOver();
      }
    }

    updateEffects(dt) {
      this.shake = Math.max(0, this.shake - 45 * dt);
      this.flash = Math.max(0, this.flash - dt);
      for (const b of this.banners) b.life -= dt;
      for (const f of this.floaters) { f.life -= dt; f.y -= 36 * dt; }
      for (const e of this.explosions) e.life -= dt;
      for (const p of this.particles) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.98; p.vy *= 0.98; }
      this.banners = this.banners.filter((b) => b.life > 0);
      this.floaters = this.floaters.filter((f) => f.life > 0);
      this.explosions = this.explosions.filter((e) => e.life > 0);
      this.particles = this.particles.filter((p) => p.life > 0);
    }

    updateEntities(dt) {
      for (const bullet of this.playerBullets) {
        if (bullet.type === "homing") {
          const target = this.enemies.concat(this.bosses).sort((a, b) => dist2(bullet, a) - dist2(bullet, b))[0];
          if (target) {
            const a = Math.atan2(target.y - bullet.y, target.x - bullet.x);
            bullet.vx = lerp(bullet.vx, Math.cos(a) * 520, 0.06);
            bullet.vy = lerp(bullet.vy, Math.sin(a) * 520, 0.06);
          }
        }
        bullet.x += bullet.vx * dt;
        bullet.y += bullet.vy * dt;
        bullet.life -= dt;
      }
      for (const bullet of this.enemyBullets) { bullet.x += bullet.vx * dt; bullet.y += bullet.vy * dt; bullet.life -= dt; }
      for (const enemy of this.enemies) enemy.update(dt);
      for (const boss of this.bosses) boss.update(dt);
      for (const power of this.powerups) { power.t += dt; power.y += power.vy * dt; power.x += Math.sin(power.t * 3) * 15 * dt; }
      for (const laser of this.lasers) {
        laser.life -= dt;
        if (laser.warn > 0) laser.warn -= dt;
        else laser.fire -= dt;
      }
      this.playerBullets = this.playerBullets.filter((b) => b.life > 0 && b.y > -80 && b.x > -80 && b.x < W + 80);
      this.enemyBullets = this.enemyBullets.filter((b) => b.life > 0 && b.y < H + 80 && b.y > -80 && b.x > -80 && b.x < W + 80);
      this.enemies = this.enemies.filter((e) => !e.dead);
      this.bosses = this.bosses.filter((b) => !b.dead);
      this.powerups = this.powerups.filter((p) => p.y < H + 40);
      this.lasers = this.lasers.filter((l) => l.life > 0 && l.fire > -0.05);
    }

    collisions() {
      for (const bullet of this.playerBullets) {
        if (bullet.dead) continue;
        for (const enemy of this.enemies) {
          if (!enemy.dead && dist2(bullet, enemy) < (bullet.r + enemy.r) ** 2) {
            enemy.hit(bullet.damage);
            bullet.dead = true;
            break;
          }
        }
        if (bullet.dead) continue;
        for (const boss of this.bosses) {
          if (dist2(bullet, boss) < (bullet.r + boss.r) ** 2) {
            boss.hit(bullet.damage);
            bullet.dead = true;
            break;
          }
        }
      }
      this.playerBullets = this.playerBullets.filter((b) => !b.dead);
      for (const bullet of this.enemyBullets) {
        if (dist2(bullet, this.player) < (bullet.r + this.player.r) ** 2) {
          bullet.dead = true;
          this.player.damage();
        }
      }
      this.enemyBullets = this.enemyBullets.filter((b) => !b.dead);
      for (const enemy of this.enemies) {
        if (!enemy.dead && dist2(enemy, this.player) < (enemy.r + this.player.r) ** 2) {
          enemy.hit(999);
          this.player.damage();
        }
      }
      for (const power of this.powerups) {
        if (dist2(power, this.player) < (power.r + 17) ** 2) {
          power.dead = true;
          this.player.collect(power);
        }
      }
      this.powerups = this.powerups.filter((p) => !p.dead);
      for (const laser of this.lasers) {
        if (laser.warn > 0) continue;
        const dx = this.player.x - laser.x;
        const dy = this.player.y - laser.y;
        const perp = Math.abs(Math.sin(laser.angle) * dx - Math.cos(laser.angle) * dy);
        const forward = Math.cos(laser.angle) * dx + Math.sin(laser.angle) * dy;
        if (perp < 11 && forward > -20 && forward < 900) this.player.damage();
      }
    }

    currentTheme() {
      let theme = THEMES[0];
      for (const t of THEMES) if (this.elapsed >= t.at) theme = t;
      return theme;
    }

    drawBackground(g) {
      const theme = this.currentTheme();
      const grd = g.createLinearGradient(0, 0, 0, H);
      grd.addColorStop(0, theme.sky);
      grd.addColorStop(0.55, theme.near);
      grd.addColorStop(1, "#03050d");
      g.fillStyle = grd;
      g.fillRect(0, 0, W, H);
      const speed = 45 + this.difficulty * 5;
      const scroll = this.elapsed * speed;
      if (theme.detail === "road") {
        g.globalAlpha = 0.45;
        g.fillStyle = "#6f593f";
        g.beginPath();
        g.moveTo(W * 0.42 + Math.sin(scroll * 0.003) * 55, 0);
        g.lineTo(W * 0.58 + Math.sin(scroll * 0.003) * 55, 0);
        g.lineTo(W * 0.7 + Math.sin(scroll * 0.002 + 2) * 70, H);
        g.lineTo(W * 0.28 + Math.sin(scroll * 0.002 + 2) * 70, H);
        g.closePath();
        g.fill();
        g.fillStyle = "#f2d48c";
        for (let y = -80 + (scroll * 0.6) % 120; y < H; y += 120) g.fillRect(W / 2 - 4, y, 8, 48);
        g.globalAlpha = 1;
      }
      if (theme.detail === "fortress") {
        g.globalAlpha = 0.5;
        g.fillStyle = "#1a1d29";
        for (let y = -120 + (scroll * 0.38) % 120; y < H; y += 120) {
          for (let x = 0; x < W; x += 90) {
            g.fillRect(x + ((y / 120) % 2) * 45, y, 82, 112);
            g.strokeStyle = "#384052";
            g.strokeRect(x + ((y / 120) % 2) * 45, y, 82, 112);
          }
        }
        g.globalAlpha = 1;
      }
      for (const item of this.bg) {
        item.y += speed * (0.25 + item.lane * 0.16) / 60;
        if (item.y > H + 80) { item.y = -80; item.x = Math.random() * W; item.p = Math.random(); }
        g.globalAlpha = 0.2 + item.lane * 0.13;
        if (theme.detail === "cloud" || theme.detail === "storm") {
          g.fillStyle = theme.detail === "storm" ? "#9fb1d1" : "#d7f2ff";
          g.fillRect(item.x, item.y, item.s, 9);
          g.fillRect(item.x + 10, item.y - 8, item.s * 0.45, 11);
          g.fillRect(item.x + item.s * 0.35, item.y + 8, item.s * 0.5, 7);
          if (item.kind === 0) {
            g.fillStyle = "#0b7bb2";
            g.fillRect(item.x + 12, item.y + 28, item.s * 0.8, 6);
            g.fillRect(item.x + 22, item.y + 39, item.s * 0.55, 4);
          }
        } else if (theme.detail === "city" || theme.detail === "fortress") {
          const bw = 18 + item.s * 0.22;
          const bh = item.s * (theme.detail === "city" ? 1.2 : 0.6);
          g.fillStyle = theme.detail === "city" ? "#14172d" : "#262b3a";
          g.fillRect(item.x, item.y, bw, bh);
          g.fillStyle = item.kind % 2 ? "#42f6ff" : "#ff4bd8";
          for (let wy = item.y + 8; wy < item.y + bh - 6; wy += 17) {
            g.fillRect(item.x + 5, wy, 4, 4);
            g.fillRect(item.x + bw - 10, wy + 6, 4, 4);
          }
          if (theme.detail === "fortress" && item.kind === 1) {
            g.fillStyle = "#ff426d";
            g.fillRect(item.x + bw / 2 - 4, item.y + bh + 4, 8, 8);
          }
        } else if (theme.detail === "road") {
          g.fillStyle = item.kind % 2 ? "#8c7351" : "#b38a52";
          if (item.kind < 3) {
            g.fillRect(item.x, item.y, item.s * 0.72, item.s * 0.35);
            g.fillStyle = "#4a4037";
            g.fillRect(item.x + 8, item.y + 6, item.s * 0.46, item.s * 0.16);
          } else {
            g.fillRect(item.x, item.y, item.s * 0.22, item.s * 0.8);
            g.fillRect(item.x - 8, item.y + item.s * 0.25, item.s * 0.38, 6);
          }
        } else if (theme.detail === "island") {
          g.fillStyle = "#f2da89";
          g.beginPath();
          g.ellipse(item.x, item.y, item.s * 0.58, item.s * 0.25, item.p * TAU, 0, TAU);
          g.fill();
          g.fillStyle = "#2ea05b";
          g.beginPath();
          g.ellipse(item.x + 4, item.y - 3, item.s * 0.43, item.s * 0.18, item.p * TAU, 0, TAU);
          g.fill();
          g.fillStyle = "#d6e8ff";
          g.fillRect(item.x - item.s * 0.22, item.y - 2, item.s * 0.42, 5);
          if (item.kind === 0) {
            g.fillStyle = "#ff426d";
            g.fillRect(item.x + item.s * 0.15, item.y - item.s * 0.18, 6, 12);
          }
        } else {
          g.fillStyle = item.kind % 2 ? "#ffffff" : theme.far;
          g.fillRect(item.x, item.y, 3 + item.lane, 3 + item.lane);
          if (item.kind === 0) {
            g.fillStyle = "#6f4dff";
            g.fillRect(item.x - 18, item.y + 20, item.s * 0.35, 8);
          }
        }
      }
      g.globalAlpha = 1;
      if (theme.detail === "cloud") {
        g.globalAlpha = 0.16;
        g.fillStyle = "#ffe79a";
        for (let y = -60 + (scroll * 0.18) % 160; y < H; y += 160) {
          g.fillRect(W * 0.63, y, 38, 120);
          g.fillRect(W * 0.63 - 26, y + 18, 90, 18);
        }
        g.globalAlpha = 1;
      }
      if (theme.detail === "storm" && Math.sin(this.time * 1.7) > 0.96) {
        g.fillStyle = "rgba(255,255,255,0.16)";
        g.fillRect(0, 0, W, H);
      }
    }

    drawUi(g) {
      g.font = "20px Courier New";
      g.textBaseline = "top";
      const hud = g.createLinearGradient(0, 0, 0, 62);
      hud.addColorStop(0, "rgba(5,8,21,0.94)");
      hud.addColorStop(1, "rgba(24,34,66,0.66)");
      g.fillStyle = hud;
      g.fillRect(0, 0, W, 62);
      g.strokeStyle = "rgba(66,246,255,0.55)";
      g.strokeRect(6, 6, W - 12, 50);
      g.fillStyle = "#f5fbff";
      g.shadowColor = "#42f6ff";
      g.shadowBlur = 5;
      g.fillText(String(this.score).padStart(8, "0"), 14, 11);
      g.shadowBlur = 0;
      g.fillStyle = "#ffd45a";
      g.fillText(`HI ${String(this.storage.highScore).padStart(8, "0")}`, 170, 11);
      g.fillStyle = "#42f6ff";
      g.fillText(`ST ${this.stage}`, 420, 11);
      this.assets.draw(g, ASSET_PATHS.ui.life, 21, 43, 22, 22);
      g.fillStyle = "#ff7b9b";
      g.fillText(`${this.player.lives}`, 36, 34);
      this.assets.draw(g, ASSET_PATHS.ui.bomb, 81, 43, 22, 22);
      g.fillStyle = "#ffffff";
      g.fillText(`${this.player.bombs}`, 96, 34);
      g.fillStyle = "#5cff9d";
      g.fillText(`PWR ${this.player.weaponLevel}`, 136, 34);
      if (this.player.multiplier > 1) {
        g.fillStyle = "#ffd45a";
        g.fillText(`x${this.player.multiplier}`, 232, 34);
      }
      g.fillStyle = "#f5fbff";
      g.fillRect(W - 44, 20, 6, 24);
      g.fillRect(W - 30, 20, 6, 24);
      if (this.bosses.length) {
        const hp = this.bosses.reduce((s, b) => s + Math.max(0, b.hp), 0);
        const max = this.bosses.reduce((s, b) => s + b.maxHp, 0);
        g.fillStyle = "rgba(0,0,0,0.7)";
        g.fillRect(54, 70, W - 108, 18);
        g.strokeStyle = "#ffd45a";
        g.strokeRect(54, 70, W - 108, 18);
        const bossFill = g.createLinearGradient(58, 0, W - 58, 0);
        bossFill.addColorStop(0, "#ff426d");
        bossFill.addColorStop(1, "#ffd45a");
        g.fillStyle = bossFill;
        g.fillRect(58, 74, (W - 116) * hp / max, 10);
        g.fillStyle = "#fff";
        g.font = "14px Courier New";
        g.fillText(this.bosses[0].name, 62, 92);
      }
      if (this.input.usingTouch) this.drawTouchControls(g);
    }

    drawTouchControls(g) {
      const b = this.input.bombButton;
      g.globalAlpha = 0.76;
      g.fillStyle = this.player.bombs > 0 ? "#ff426d" : "#313747";
      g.beginPath(); g.arc(b.x, b.y, b.r, 0, TAU); g.fill();
      g.strokeStyle = "#ffffff";
      g.lineWidth = 3;
      g.stroke();
      g.fillStyle = "#fff";
      g.font = "20px Courier New";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText("BOMB", b.x, b.y);
      const j = this.input.joystick;
      if (j) {
        g.globalAlpha = 0.36;
        g.fillStyle = "#42f6ff";
        g.beginPath(); g.arc(j.sx, j.sy, 74, 0, TAU); g.fill();
        g.globalAlpha = 0.78;
        g.beginPath(); g.arc(j.x, j.y, 28, 0, TAU); g.fill();
      }
      g.textAlign = "left";
      g.textBaseline = "alphabetic";
      g.globalAlpha = 1;
    }

    button(g, x, y, w, h, text, action, selected = false) {
      this.menuButtons.push({ x, y, w, h, action });
      const fill = g.createLinearGradient(x, y, x, y + h);
      fill.addColorStop(0, selected ? "#ffe47a" : "#263451");
      fill.addColorStop(1, selected ? "#d39224" : "#0d1324");
      g.fillStyle = fill;
      g.strokeStyle = selected ? "#ffffff" : "#42f6ff";
      g.lineWidth = 3;
      g.fillRect(x, y, w, h);
      g.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
      g.fillStyle = "rgba(255,255,255,0.12)";
      g.fillRect(x + 8, y + 7, w - 16, 6);
      g.fillStyle = selected ? "#080911" : "#f5fbff";
      g.shadowColor = selected ? "#fff" : "#42f6ff";
      g.shadowBlur = 6;
      g.font = "22px Courier New";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(text, x + w / 2, y + h / 2);
      g.shadowBlur = 0;
    }

    drawScreen(g) {
      this.menuButtons = [];
      g.textAlign = "center";
      g.textBaseline = "middle";
      if (this.state === "welcome") {
        g.fillStyle = "rgba(0,0,0,0.32)";
        g.fillRect(0, 0, W, H);
        g.fillStyle = "#42f6ff";
        g.font = "52px Courier New";
        g.fillText("SKY", W / 2, 170);
        g.fillStyle = "#ffd45a";
        g.font = "46px Courier New";
        g.fillText("CIRCUIT 45", W / 2, 222);
        g.font = "18px Courier New";
        g.fillStyle = "#f5fbff";
        g.fillText("TAP / MOVE MOUSE TO START", W / 2, 290);
        this.button(g, 94, 350, 160, 54, "CLASSIC 3", "classic", this.mode === "classic");
        this.button(g, 286, 350, 160, 54, "COIN 5", "coin", this.mode === "coin");
        this.button(g, 145, 438, 250, 62, "START", "start");
        this.button(g, 186, 518, 168, 44, this.audio.muted ? "UNMUTE" : "MUTE", "mute");
        g.fillStyle = "#b5f7ff";
        g.font = "17px Courier New";
        g.fillText("DESKTOP: MOVE MOUSE", W / 2, 625);
        g.fillText("MOBILE: TOUCH AND DRAG", W / 2, 653);
        g.fillStyle = "#f5fbff";
        g.font = "16px Courier New";
        g.fillText(`HIGH ${this.storage.highScore}  BEST ${this.formatTime(this.storage.longest)}`, W / 2, 724);
      }
      if (this.state === "paused") {
        g.fillStyle = "rgba(0,0,0,0.72)";
        g.fillRect(0, 0, W, H);
        g.fillStyle = "#ffd45a";
        g.font = "44px Courier New";
        g.fillText("PAUSED", W / 2, 265);
        this.button(g, 145, 344, 250, 58, "RESUME", "resume");
        this.button(g, 145, 424, 250, 58, "RESTART", "restart");
        this.button(g, 145, 504, 250, 58, "MAIN MENU", "menu");
      }
      if (this.state === "continue") {
        g.fillStyle = "rgba(0,0,0,0.72)";
        g.fillRect(0, 0, W, H);
        g.fillStyle = "#ff426d";
        g.font = "48px Courier New";
        g.fillText("CONTINUE?", W / 2, 250);
        g.fillStyle = "#ffd45a";
        g.font = "76px Courier New";
        g.fillText(String(Math.ceil(this.continueTimer)), W / 2, 350);
        g.font = "24px Courier New";
        g.fillText("INSERT COIN", W / 2, 440);
        this.button(g, 130, 510, 280, 62, "CONTINUE", "continue");
        this.button(g, 130, 590, 280, 54, "GAME OVER", "menu");
      }
      if (this.state === "gameover") {
        g.fillStyle = "rgba(0,0,0,0.74)";
        g.fillRect(0, 0, W, H);
        g.fillStyle = "#ff426d";
        g.font = "48px Courier New";
        g.fillText("GAME OVER", W / 2, 200);
        g.fillStyle = "#f5fbff";
        g.font = "19px Courier New";
        const lines = [
          `FINAL SCORE ${this.score}`,
          `TIME ${this.formatTime(this.elapsed)}`,
          `STAGE ${this.stage}`,
          `DESTROYED ${this.kills}`,
          `CONTINUES ${this.continues}`
        ];
        lines.forEach((line, i) => g.fillText(line, W / 2, 290 + i * 31));
        this.button(g, 145, 508, 250, 58, "RESTART", "restart");
        this.button(g, 145, 586, 250, 58, "MAIN MENU", "menu");
      }
      g.textAlign = "left";
      g.textBaseline = "alphabetic";
    }

    drawEntities(g) {
      for (const p of this.powerups) {
        g.save();
        g.translate(p.x, p.y);
        const pulse = 0.88 + Math.sin(p.t * 8) * 0.12;
        g.globalAlpha = pulse;
        g.shadowColor = p.color;
        g.shadowBlur = 14;
        const drew = this.assets.draw(g, ASSET_PATHS.powerups[p.type], 0, Math.sin(p.t * 4) * 2, 38, 38);
        g.shadowBlur = 0;
        if (!drew) {
          g.fillStyle = p.color;
          g.fillRect(-17, -17, 34, 34);
          g.fillStyle = "#060914";
          g.font = p.type === "♥" ? "24px Courier New" : "20px Courier New";
          g.textAlign = "center";
          g.textBaseline = "middle";
          g.fillText(p.type, 0, 1);
        }
        g.restore();
      }
      for (const bullet of this.playerBullets) {
        g.save();
        g.shadowColor = bullet.color;
        g.shadowBlur = bullet.type === "laser" ? 18 : 9;
        const src = bullet.type === "homing" ? ASSET_PATHS.bullets.missile : ASSET_PATHS.bullets.player;
        const drew = this.assets.draw(g, src, bullet.x, bullet.y, bullet.type === "laser" ? 20 : 14, bullet.type === "laser" ? 88 : 30, 0);
        if (!drew) {
          g.fillStyle = bullet.color;
          g.fillRect(bullet.x - bullet.r / 2, bullet.y - bullet.r * 2, bullet.r, bullet.r * 4);
        }
        if (bullet.type === "homing") {
          g.globalAlpha = 0.35;
          g.fillStyle = "#d8e6ef";
          g.fillRect(bullet.x - bullet.vx * 0.025, bullet.y - bullet.vy * 0.025, 8, 8);
        }
        g.restore();
      }
      for (const bullet of this.enemyBullets) {
        g.save();
        g.shadowColor = bullet.color;
        g.shadowBlur = 10;
        const drew = this.assets.draw(g, ASSET_PATHS.bullets.enemy, bullet.x, bullet.y, bullet.r * 3.2, bullet.r * 3.2);
        if (!drew) {
          g.fillStyle = bullet.color;
          g.beginPath(); g.arc(bullet.x, bullet.y, bullet.r, 0, TAU); g.fill();
        }
        g.restore();
      }
      for (const laser of this.lasers) {
        g.save();
        g.translate(laser.x, laser.y);
        g.rotate(laser.angle);
        g.strokeStyle = laser.warn > 0 ? "rgba(255,255,255,0.45)" : "rgba(255,66,109,0.9)";
        g.lineWidth = laser.warn > 0 ? 3 : 18;
        g.beginPath(); g.moveTo(0, 0); g.lineTo(900, 0); g.stroke();
        g.restore();
      }
      for (const enemy of this.enemies) enemy.draw(g);
      for (const boss of this.bosses) boss.draw(g);
      this.player.draw(g);
      for (const e of this.explosions) {
        const k = 1 - e.life / e.max;
        const a = e.life / e.max;
        g.globalAlpha = a;
        g.save();
        g.translate(e.x, e.y);
        g.rotate(k * 1.8);
        g.shadowColor = e.color;
        g.shadowBlur = 18;
        g.fillStyle = "#fff6a0";
        g.fillRect(-e.size * 0.15, -e.size * k, e.size * 0.3, e.size * 2 * k);
        g.fillRect(-e.size * k, -e.size * 0.15, e.size * 2 * k, e.size * 0.3);
        g.rotate(Math.PI / 4);
        g.fillStyle = e.color;
        g.fillRect(-e.size * 0.1, -e.size * 0.78 * k, e.size * 0.2, e.size * 1.56 * k);
        g.fillRect(-e.size * 0.78 * k, -e.size * 0.1, e.size * 1.56 * k, e.size * 0.2);
        g.strokeStyle = "#ffffff";
        g.lineWidth = 3;
        g.beginPath();
        g.arc(0, 0, e.size * 0.9 * k, 0, TAU);
        g.stroke();
        g.restore();
        g.globalAlpha = 1;
      }
      for (const p of this.particles) {
        g.globalAlpha = Math.max(0, p.life);
        g.fillStyle = p.color;
        g.fillRect(p.x, p.y, 4, 4);
      }
      g.globalAlpha = 1;
      for (const f of this.floaters) {
        g.globalAlpha = f.life / 0.8;
        g.fillStyle = f.color;
        g.font = "16px Courier New";
        g.textAlign = "center";
        g.fillText(f.text, f.x, f.y);
      }
      g.globalAlpha = 1;
      for (const b of this.banners) {
        const alpha = Math.min(1, b.life) * Math.min(1, (b.max - b.life) * 3);
        g.globalAlpha = alpha;
        g.fillStyle = "rgba(0,0,0,0.55)";
        g.fillRect(24, 120, W - 48, 54);
        g.strokeStyle = b.color;
        g.strokeRect(28, 124, W - 56, 46);
        g.fillStyle = b.color;
        g.font = "24px Courier New";
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillText(b.text, W / 2, 148);
      }
      g.globalAlpha = 1;
    }

    drawDebug(g) {
      if (!DEBUG) return;
      g.fillStyle = "rgba(0,0,0,0.6)";
      g.fillRect(8, H - 108, 250, 94);
      g.fillStyle = "#5cff9d";
      g.font = "14px Courier New";
      const lines = [
        `FPS ${this.fps.toFixed(0)}`,
        `WAVE ${this.director.lastFormation}`,
        `DIFF ${this.difficulty.toFixed(2)}`,
        `OBJ e${this.enemies.length} b${this.enemyBullets.length} p${this.playerBullets.length}`,
        `THEME ${this.currentTheme().name}`
      ];
      lines.forEach((line, i) => g.fillText(line, 16, H - 92 + i * 17));
    }

    formatTime(t) {
      const m = Math.floor(t / 60);
      const s = Math.floor(t % 60);
      return `${m}:${String(s).padStart(2, "0")}`;
    }

    render() {
      ctx.save();
      const sx = (Math.random() - 0.5) * this.shake;
      const sy = (Math.random() - 0.5) * this.shake;
      ctx.translate(sx, sy);
      this.drawBackground(ctx);
      this.drawEntities(ctx);
      ctx.restore();
      this.drawUi(ctx);
      this.drawDebug(ctx);
      if (this.flash > 0) {
        ctx.globalAlpha = Math.min(0.45, this.flash * 1.7);
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
      }
      if (this.state !== "playing") this.drawScreen(ctx);
    }

    loop(now) {
      const rawDt = Math.min(0.033, (now - this.last) / 1000 || 0.016);
      this.last = now;
      this.fps = lerp(this.fps, 1 / rawDt, 0.05);
      this.update(rawDt);
      this.render();
      requestAnimationFrame((t) => this.loop(t));
    }
  }

  new Game();
})();
