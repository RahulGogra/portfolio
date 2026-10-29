import * as THREE from "three";

export const LIGHT_YEAR_KM = 9.46e12;
/** Distance in front of the camera at which the zoom layer is drawn. */
export const ZOOM_DEPTH = 10;
/** Distance from Earth at the top of the page: the whole globe, large, beside the hero text. */
export const START_LOG_KM = 4.5;
/** Distance from Earth at the bottom of the page, where the whole galaxy fits in the frame. */
export const JOURNEY_END_KM = 100000 * LIGHT_YEAR_KM;
const END_LOG_KM = Math.log10(JOURNEY_END_KM);

/**
 * Distance from Earth for a scroll position (0 = top, 1 = bottom). Linear in powers of ten, so every
 * screen of scrolling widens the view by the same factor: one steady pull-back with no jumps.
 */
export function distanceKm(progress: number) {
  return Math.pow(10, THREE.MathUtils.lerp(START_LOG_KM, END_LOG_KM, THREE.MathUtils.clamp(progress, 0, 1)));
}

/**
 * Where home (Earth, later the Sun) sits on screen, in -1..1 screen coordinates.
 * On wide screens it sits to the right of the reading column from the first screen on (crossing to the left
 * while the Work section has its text on the right), and returns to the
 * centre for the last view of the whole galaxy. On phones it starts as a horizon under the hero text.
 */
export function framing(progress: number, narrow: boolean, flip = 0): [number, number] {
  const settle = THREE.MathUtils.smoothstep(progress, 0, 0.12);
  const finish = THREE.MathUtils.smoothstep(progress, 0.86, 1);
  const hero: [number, number] = narrow ? [0, -1.2] : [0.62, -0.04];
  // While Work has its text on the right, the view crosses over to the left.
  const middle: [number, number] = narrow ? [0, 0.15] : [THREE.MathUtils.lerp(0.5, -0.5, flip), 0];
  return [
    THREE.MathUtils.lerp(THREE.MathUtils.lerp(hero[0], middle[0], settle), 0, finish),
    THREE.MathUtils.lerp(THREE.MathUtils.lerp(hero[1], middle[1], settle), 0, finish),
  ];
}

/**
 * Mutable state shared between the page and the render loop.
 * Kept outside React on purpose: it changes every frame and must not trigger re-renders.
 */
export const journey = {
  /** Scroll position, 0 at the top of the page and 1 at the bottom. */
  target: 0,
  /** Smoothed version the camera actually uses. */
  progress: 0,
  /** 1 while the text is on the right (Work), so the view should move left. Set by the page. */
  flipTarget: 0,
  /** Smoothed version of flipTarget. */
  flip: 0,
  /** Current distance from Earth, in kilometres. */
  km: Math.pow(10, START_LOG_KM),
  pointerX: 0,
  pointerY: 0,
  /** Seconds of animation time. Stops advancing when the visitor prefers reduced motion. */
  time: 0,
  reducedMotion: false,
  /** Live theme colours. Every shader holds a reference to these two objects. */
  colorA: new THREE.Color("#a855f7"),
  colorB: new THREE.Color("#ec4899"),
};

/* ---------- The galaxy, and the Sun's place in it ---------- */

export const GALAXY = {
  position: [0, 0.3, -17] as [number, number, number],
  rotation: [0.46, 0, 0.14] as [number, number, number],
  /** Radians per second. */
  spinRate: 0.018,
  /** The Sun sits out in a spiral arm, about half way to the edge. */
  sun: { radius: 4.6, angle: 2.39 },
};

const galaxyEuler = new THREE.Euler();
const galaxyOffset = new THREE.Vector3();

/** World position of the Sun inside the galaxy, following the galaxy's slow spin. */
export function sunWorldPosition(out: THREE.Vector3, time: number) {
  const angle = GALAXY.sun.angle - time * GALAXY.spinRate;
  out.set(Math.cos(angle) * GALAXY.sun.radius, 0, Math.sin(angle) * GALAXY.sun.radius);
  out.applyEuler(galaxyEuler.set(GALAXY.rotation[0], GALAXY.rotation[1], GALAXY.rotation[2]));
  return out.add(galaxyOffset.set(GALAXY.position[0], GALAXY.position[1], GALAXY.position[2]));
}

/** Small seeded generator so star layouts are identical on every load. */
export function mulberry32(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- Shared textures ---------- */

let glow: THREE.Texture | null = null;

/** Soft round glow used for distant bodies and markers. */
export function glowTexture() {
  if (glow) return glow;
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.18, "rgba(255,255,255,0.55)");
  gradient.addColorStop(0.45, "rgba(255,255,255,0.14)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  glow = new THREE.CanvasTexture(canvas);
  return glow;
}

let cloud: THREE.Texture | null = null;

/** Wispy cloud used for the nebulae. Painted once so the GPU only has to sample a texture. */
export function cloudTexture() {
  if (cloud) return cloud;
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const rng = mulberry32(7);
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 70; i++) {
    const angle = rng() * Math.PI * 2;
    const dist = Math.pow(rng(), 0.8) * size * 0.3;
    const x = size / 2 + Math.cos(angle) * dist;
    const y = size / 2 + Math.sin(angle) * dist * 0.75;
    const r = 18 + rng() * 46;
    const blob = ctx.createRadialGradient(x, y, 0, x, y, r);
    blob.addColorStop(0, "rgba(255,255,255,0.07)");
    blob.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = blob;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ctx.globalCompositeOperation = "destination-in";
  const mask = ctx.createRadialGradient(size / 2, size / 2, size * 0.1, size / 2, size / 2, size / 2);
  mask.addColorStop(0, "rgba(0,0,0,1)");
  mask.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = mask;
  ctx.fillRect(0, 0, size, size);
  cloud = new THREE.CanvasTexture(canvas);
  return cloud;
}
