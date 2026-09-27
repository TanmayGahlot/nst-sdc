/**
 * LetterGlitch — vanilla JS canvas version.
 * Ported from a React component so the rest of the site can stay
 * plain HTML/CSS/JS with no build step. Same behaviour: a grid of
 * random characters that occasionally swap and fade between colors.
 */
class LetterGlitch {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.glitchColors = options.glitchColors || ["#f5f5f5", "#c9c9c9", "#8a8a8a"];
    this.glitchSpeed = options.glitchSpeed ?? 60;
    this.smooth = options.smooth ?? true;
    this.characters =
      options.characters || "NSTSDC01{}<>/#*+=";

    this.fontSize = 16;
    this.charWidth = 10;
    this.charHeight = 20;

    this.letters = [];
    this.grid = { columns: 0, rows: 0 };
    this.lastGlitchTime = Date.now();
    this.rafId = null;

    this.resize = this.resize.bind(this);
    this.animate = this.animate.bind(this);

    window.addEventListener("resize", () => {
      clearTimeout(this._resizeTimeout);
      this._resizeTimeout = setTimeout(() => {
        cancelAnimationFrame(this.rafId);
        this.resize();
        this.animate();
      }, 100);
    });

    this.resize();
    this.animate();
  }

  randomChar() {
    return this.characters[Math.floor(Math.random() * this.characters.length)];
  }

  randomColor() {
    return this.glitchColors[Math.floor(Math.random() * this.glitchColors.length)];
  }

  hexToRgb(hex) {
    const shorthand = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthand, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
      : { r: 255, g: 255, b: 255 };
  }

  randomRgb() {
    return this.hexToRgb(this.randomColor());
  }

  mixRgb(start, end, factor) {
    return {
      r: Math.round(start.r + (end.r - start.r) * factor),
      g: Math.round(start.g + (end.g - start.g) * factor),
      b: Math.round(start.b + (end.b - start.b) * factor)
    };
  }

  rgbToCss({ r, g, b }) {
    return `rgb(${r}, ${g}, ${b})`;
  }

  resize() {
    const parent = this.canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const columns = Math.ceil(rect.width / this.charWidth);
    const rows = Math.ceil(rect.height / this.charHeight);
    this.grid = { columns, rows };

    const total = columns * rows;
    this.letters = Array.from({ length: total }, () => {
      const rgb = this.randomRgb();
      return { char: this.randomChar(), rgb, fromRgb: rgb, targetRgb: this.randomRgb(), progress: 1 };
    });

    this.draw();
  }

  draw() {
    if (!this.letters.length) return;
    const { width, height } = this.canvas.getBoundingClientRect();
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.font = `${this.fontSize}px monospace`;
    this.ctx.textBaseline = "top";

    this.letters.forEach((letter, i) => {
      const x = (i % this.grid.columns) * this.charWidth;
      const y = Math.floor(i / this.grid.columns) * this.charHeight;
      this.ctx.fillStyle = this.rgbToCss(letter.rgb);
      this.ctx.fillText(letter.char, x, y);
    });
  }

  update() {
    const updateCount = Math.max(1, Math.floor(this.letters.length * 0.04));
    for (let i = 0; i < updateCount; i++) {
      const index = Math.floor(Math.random() * this.letters.length);
      const letter = this.letters[index];
      if (!letter) continue;

      letter.char = this.randomChar();
      letter.fromRgb = letter.rgb;
      letter.targetRgb = this.randomRgb();
      letter.progress = this.smooth ? 0 : 1;
      if (!this.smooth) letter.rgb = letter.targetRgb;
    }
  }

  transition() {
    let redraw = false;
    this.letters.forEach((letter) => {
      if (letter.progress < 1) {
        letter.progress = Math.min(1, letter.progress + 0.05);
        letter.rgb = this.mixRgb(letter.fromRgb, letter.targetRgb, letter.progress);
        redraw = true;
      }
    });
    if (redraw) this.draw();
  }

  animate() {
    const now = Date.now();
    if (now - this.lastGlitchTime >= this.glitchSpeed) {
      this.update();
      this.draw();
      this.lastGlitchTime = now;
    }
    if (this.smooth) this.transition();
    this.rafId = requestAnimationFrame(this.animate);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("hero-glitch");
  if (canvas && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    new LetterGlitch(canvas, {
      glitchColors: ["#2b4539", "#61dca3", "#61b3dc"],
      glitchSpeed: 60
    });
  }
});
