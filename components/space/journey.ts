import * as THREE from "three";

/** Sections in page order. The camera reaches station N when section N hits the top of the viewport. */
export const SECTION_IDS = ["home", "about", "skills", "experience", "projects", "contact"] as const;

/** World distance the camera travels between two sections. */
export const STATION_SPACING = 26;

/** Distance in front of the camera at which the pieces that follow the HTML layout are drawn. */
export const VIEW_DEPTH = 14;

/** Direction towards the key light, in view space, so lighting stays put on screen as the camera turns. */
export const LIGHT_DIR = new THREE.Vector3(-0.92, 0.04, 0.39).normalize();

/**
 * Mutable state shared between the DOM listeners and the render loop.
 * Kept outside React on purpose: it changes every frame and must not trigger re-renders.
 */
export const journey = {
  /** Where scrolling says we should be: 0 = hero, 5 = contact. */
  target: 0,
  /** Smoothed position the camera actually uses. */
  progress: 0,
  /** Sections per second, smoothed. Drives the sense of speed. */
  velocity: 0,
  pointerX: 0,
  pointerY: 0,
  /** Seconds of animation time. Stops advancing when the visitor prefers reduced motion. */
  time: 0,
  reducedMotion: false,
  /** Skill name / project index currently hovered in the HTML, so the scene can highlight it. */
  activeSkill: null as string | null,
  activeProject: -1,
  /** Live theme colours. Every shader holds a reference to these two objects. */
  colorA: new THREE.Color("#a855f7"),
  colorB: new THREE.Color("#ec4899"),
};

/** Small seeded generator so star and galaxy layouts are identical on every load. */
export function mulberry32(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- DOM anchors ---------- */

const anchorCache = new Map<string, HTMLElement | null>();

/** Finds the element marked with data-space-anchor="id". */
export function anchorElement(id: string) {
  let el = anchorCache.get(id);
  if (!el || !el.isConnected) {
    el = document.querySelector<HTMLElement>(`[data-space-anchor="${id}"]`);
    anchorCache.set(id, el);
  }
  return el;
}

export interface Placement {
  /** Centre of the anchor in view space, at the requested depth. */
  x: number;
  y: number;
  /** Size of the anchor in world units at that depth. */
  width: number;
  height: number;
  /** World units per CSS pixel at that depth. */
  unitsPerPx: number;
  /** How far the anchor's centre is below (+) or above (-) the middle of the screen, in viewport heights. */
  offset: number;
  /** Anchor rectangle in CSS pixels. */
  left: number;
  top: number;
  pxWidth: number;
  pxHeight: number;
  visible: boolean;
}

export function createPlacement(): Placement {
  return { x: 0, y: 0, width: 0, height: 0, unitsPerPx: 0, offset: 0, left: 0, top: 0, pxWidth: 0, pxHeight: 0, visible: false };
}

export function unitsPerPixel(camera: THREE.PerspectiveCamera, viewportHeight: number, depth = VIEW_DEPTH) {
  return (2 * depth * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)) / viewportHeight;
}

/**
 * Works out where an HTML anchor sits in view space, so a 3D object can be drawn exactly over it.
 * Returns false (and marks the placement invisible) when the anchor is missing or well off screen.
 */
export function placeAnchor(
  id: string,
  camera: THREE.PerspectiveCamera,
  size: { width: number; height: number },
  out: Placement,
  depth = VIEW_DEPTH,
  margin = 0.4
) {
  const el = anchorElement(id);
  if (!el) {
    out.visible = false;
    return false;
  }
  const rect = el.getBoundingClientRect();
  out.left = rect.left;
  out.top = rect.top;
  out.pxWidth = rect.width;
  out.pxHeight = rect.height;
  out.visible = rect.bottom > -size.height * margin && rect.top < size.height * (1 + margin);
  if (!out.visible) return false;

  const u = unitsPerPixel(camera, size.height, depth);
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  out.unitsPerPx = u;
  out.x = (cx - size.width / 2) * u;
  out.y = -(cy - size.height / 2) * u;
  out.width = rect.width * u;
  out.height = rect.height * u;
  out.offset = (cy - size.height / 2) / size.height;
  return true;
}

/* ---------- Shared textures ---------- */

let glow: THREE.Texture | null = null;

/** Soft round glow used for star nodes, the comet and other light points. */
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
  // Fade to nothing before the edge so the square never shows.
  ctx.globalCompositeOperation = "destination-in";
  const mask = ctx.createRadialGradient(size / 2, size / 2, size * 0.1, size / 2, size / 2, size / 2);
  mask.addColorStop(0, "rgba(0,0,0,1)");
  mask.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = mask;
  ctx.fillRect(0, 0, size, size);
  cloud = new THREE.CanvasTexture(canvas);
  return cloud;
}
