"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { cloudTexture, glowTexture, journey, mulberry32, SECTION_IDS, STATION_SPACING } from "./journey";

const JOURNEY_LENGTH = (SECTION_IDS.length - 1) * STATION_SPACING;

const STAR_VERT = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute float aTint;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uScale;
  uniform vec2 uFar;
  varying float vAlpha;
  varying float vTint;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float dist = -mv.z;
    float twinkle = 0.72 + 0.28 * sin(uTime * 1.4 + aPhase);
    gl_PointSize = clamp(aSize * uPixelRatio * uScale / dist, 1.0, 22.0 * uPixelRatio);
    // Fade out just before a star reaches the lens, and again in the far distance.
    vAlpha = twinkle * smoothstep(0.4, 3.5, dist) * smoothstep(uFar.x, uFar.y, dist);
    vTint = aTint;
    gl_Position = projectionMatrix * mv;
  }
`;

const STAR_FRAG = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vAlpha;
  varying float vTint;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float disc = smoothstep(0.5, 0.08, d);
    // Most stars are white; roughly a third pick up one of the theme colours.
    vec3 theme = mix(uColorA, uColorB, step(0.5, fract(vTint * 7.0)));
    vec3 col = mix(vec3(1.0), mix(theme, vec3(1.0), 0.35), step(0.66, vTint));
    gl_FragColor = vec4(col, disc * vAlpha);
    #include <colorspace_fragment>
  }
`;

function buildStars(count: number, seed: number, place: (rng: () => number, out: number[]) => void) {
  const rng = mulberry32(seed);
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  const tints = new Float32Array(count);
  const p = [0, 0, 0];
  for (let i = 0; i < count; i++) {
    place(rng, p);
    positions.set(p, i * 3);
    sizes[i] = 0.6 + Math.pow(rng(), 3) * 2.2;
    phases[i] = rng() * Math.PI * 2;
    tints[i] = rng();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute("aTint", new THREE.BufferAttribute(tints, 1));
  return geometry;
}

function StarPoints({ geometry, scale, farStart, farEnd, followCamera = false }: {
  geometry: THREE.BufferGeometry;
  scale: number;
  farStart: number;
  farEnd: number;
  followCamera?: boolean;
}) {
  const points = useRef<THREE.Points>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uScale: { value: scale },
      uFar: { value: new THREE.Vector2(farStart, farEnd) },
      uColorA: { value: journey.colorA },
      uColorB: { value: journey.colorB },
    }),
    [scale, farStart, farEnd]
  );

  useFrame((state) => {
    // Go through the material: R3F copies the uniforms it is given, so writing to the object above would do nothing.
    if (material.current) {
      material.current.uniforms.uTime.value = journey.time;
      material.current.uniforms.uPixelRatio.value = state.gl.getPixelRatio();
    }
    if (followCamera) points.current?.position.copy(state.camera.position);
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        vertexShader={STAR_VERT}
        fragmentShader={STAR_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/** Stars the camera actually flies through: a long tunnel wrapped around the whole route. */
function StarTunnel({ count }: { count: number }) {
  const geometry = useMemo(
    () =>
      buildStars(count, 11, (rng, out) => {
        const angle = rng() * Math.PI * 2;
        const radius = 4 + Math.pow(rng(), 0.8) * 70;
        out[0] = Math.cos(angle) * radius;
        out[1] = Math.sin(angle) * radius;
        out[2] = 40 - rng() * (JOURNEY_LENGTH + 130);
      }),
    [count]
  );
  return <StarPoints geometry={geometry} scale={70} farStart={170} farEnd={105} />;
}

/** Distant stars on a shell that moves with the camera, so the sky is never empty. */
function Sky({ count }: { count: number }) {
  const geometry = useMemo(
    () =>
      buildStars(count, 23, (rng, out) => {
        const u = rng() * 2 - 1;
        const angle = rng() * Math.PI * 2;
        const ring = Math.sqrt(1 - u * u);
        out[0] = Math.cos(angle) * ring * 160;
        out[1] = u * 160;
        out[2] = Math.sin(angle) * ring * 160;
      }),
    [count]
  );
  return <StarPoints geometry={geometry} scale={400} farStart={2000} farEnd={1000} followCamera />;
}

const NEBULAE: { position: [number, number, number]; size: number; mix: number; opacity: number }[] = [
  { position: [-15, 7, -24], size: 36, mix: 0, opacity: 0.2 },
  { position: [17, -8, -50], size: 42, mix: 1, opacity: 0.17 },
  { position: [-19, -6, -76], size: 46, mix: 0.5, opacity: 0.18 },
  { position: [16, 9, -102], size: 40, mix: 0, opacity: 0.17 },
  { position: [-13, 8, -128], size: 44, mix: 1, opacity: 0.18 },
  { position: [4, -9, -156], size: 50, mix: 0.3, opacity: 0.16 },
];

/** Coloured clouds parked along the route. They drift past as the camera travels. */
function Nebulae() {
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const texture = useMemo(() => cloudTexture(), []);

  useFrame((state) => {
    meshes.current.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.quaternion.copy(state.camera.quaternion);
      mesh.rotateZ(i * 1.3 + journey.time * 0.008 * (i % 2 ? 1 : -1));
      (mesh.material as THREE.MeshBasicMaterial).color.copy(journey.colorA).lerp(journey.colorB, NEBULAE[i].mix);
    });
  });

  return (
    <>
      {NEBULAE.map((nebula, i) => (
        <mesh key={i} ref={(mesh) => { meshes.current[i] = mesh; }} position={nebula.position} scale={nebula.size}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={texture}
            transparent
            opacity={nebula.opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </>
  );
}

const GALAXY_VERT = /* glsl */ `
  attribute float aSize;
  attribute float aMix;
  attribute float aPhase;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vAlpha;
  varying float vMix;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float dist = -mv.z;
    gl_PointSize = clamp(aSize * uPixelRatio * 34.0 / dist, 1.0 * uPixelRatio, 7.0 * uPixelRatio);
    vAlpha = (0.8 + 0.2 * sin(uTime * 1.1 + aPhase)) * smoothstep(0.3, 2.5, dist);
    vMix = aMix;
    gl_Position = projectionMatrix * mv;
  }
`;

const GALAXY_FRAG = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;
  varying float vAlpha;
  varying float vMix;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float disc = smoothstep(0.5, 0.05, d);
    vec3 core = mix(uColorB, vec3(1.0), 0.7);
    vec3 arm = mix(mix(uColorB, uColorA, smoothstep(0.15, 0.8, vMix)), vec3(1.0), 0.22);
    vec3 col = mix(core, arm, smoothstep(0.0, 0.45, vMix));
    gl_FragColor = vec4(col, disc * vAlpha * uOpacity);
    #include <colorspace_fragment>
  }
`;

/** Spiral galaxy that fills the hero. Scrolling on flies the camera straight through its disc. */
function Galaxy({ count }: { count: number }) {
  const group = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const coreMaterial = useRef<THREE.SpriteMaterial>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const glow = useMemo(() => glowTexture(), []);

  const geometry = useMemo(() => {
    const rng = mulberry32(42);
    const gauss = () => (rng() + rng() + rng() - 1.5) / 1.5;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const mixes = new Float32Array(count);
    const phases = new Float32Array(count);
    const ARMS = 3;
    const RADIUS = 8.5;
    for (let i = 0; i < count; i++) {
      let x: number, y: number, z: number, radius: number;
      if (rng() < 0.16) {
        // Central bulge
        radius = Math.pow(rng(), 1.8) * 2.4;
        const angle = rng() * Math.PI * 2;
        x = Math.cos(angle) * radius;
        z = Math.sin(angle) * radius;
        y = gauss() * 0.55 * (1 - radius / 3.2);
      } else {
        radius = 0.8 + Math.pow(rng(), 1.45) * (RADIUS - 0.8);
        const arm = ((i % ARMS) / ARMS) * Math.PI * 2;
        const angle = arm + radius * 0.52 + gauss() * (0.5 - radius * 0.02);
        const spread = 0.25 + radius * 0.06;
        x = Math.cos(angle) * radius + gauss() * spread;
        z = Math.sin(angle) * radius + gauss() * spread;
        y = gauss() * 0.22 * (1 - radius / (RADIUS * 1.4));
      }
      positions.set([x, y, z], i * 3);
      sizes[i] = 0.5 + Math.pow(rng(), 4) * 2.4;
      mixes[i] = Math.min(radius / RADIUS, 1);
      phases[i] = rng() * Math.PI * 2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    g.setAttribute("aMix", new THREE.BufferAttribute(mixes, 1));
    g.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    return g;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uOpacity: { value: 0.6 },
      uColorA: { value: journey.colorA },
      uColorB: { value: journey.colorB },
    }),
    []
  );

  useFrame((state) => {
    if (!group.current) return;
    // Nothing to draw once the camera is well past it.
    group.current.visible = journey.progress < 1.6;
    if (!group.current.visible) return;
    if (material.current) {
      material.current.uniforms.uTime.value = journey.time;
      material.current.uniforms.uPixelRatio.value = state.gl.getPixelRatio();
    }
    if (spin.current) spin.current.rotation.y = journey.time * 0.018;
    coreMaterial.current?.color.copy(journey.colorB).lerp(WHITE, 0.6);
  });

  return (
    <group ref={group} position={[0, 0.3, -17]} rotation={[0.46, 0, 0.14]}>
      <group ref={spin}>
        <points geometry={geometry} frustumCulled={false}>
          <shaderMaterial
            ref={material}
            vertexShader={GALAXY_VERT}
            fragmentShader={GALAXY_FRAG}
            uniforms={uniforms}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>
      <sprite scale={5}>
        <spriteMaterial
          ref={coreMaterial}
          map={glow}
          transparent
          opacity={0.3}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  );
}

const WHITE = new THREE.Color("#ffffff");

export default function Environment({ lowPower }: { lowPower: boolean }) {
  return (
    <>
      <Sky count={lowPower ? 1200 : 2400} />
      <StarTunnel count={lowPower ? 2400 : 5200} />
      <Nebulae />
      <Galaxy count={lowPower ? 6000 : 13000} />
    </>
  );
}
