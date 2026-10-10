"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { createPlacement, journey, LIGHT_DIR, placeAnchor, VIEW_DEPTH } from "./journey";

const PLANET_RADIUS = 1.5;
const ATMOSPHERE_SCALE = 1.13;
const RING_INNER = 1.95;
const RING_OUTER = 2.9;
/** Width of the whole system in its own units. The HTML anchor is scaled to fit this. */
const SYSTEM_WIDTH = 8.04;

const NOISE_GLSL = /* glsl */ `
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
      f.z
    );
  }
  float fbm(vec3 p) {
    float amp = 0.5;
    float sum = 0.0;
    for (int i = 0; i < 5; i++) {
      sum += amp * noise(p);
      p *= 2.02;
      amp *= 0.5;
    }
    return sum;
  }
`;

const SURFACE_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying vec3 vObjPos;
  void main() {
    vObjPos = position;
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewPos = mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

// Banded gas giant: a soft day/night edge, accent-tinted bands, a rim light, and the rings' shadow.
const PLANET_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uLightDir;
  uniform vec3 uLightDirObj;
  uniform float uRingInner;
  uniform float uRingOuter;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying vec3 vObjPos;
  ${NOISE_GLSL}

  // Follow the ray from the surface towards the light and see whether it passes through the rings.
  float ringShadow(vec3 p) {
    float ly = uLightDirObj.y;
    if (abs(ly) < 0.0001) return 0.0;
    float s = -p.y / ly;
    if (s <= 0.0) return 0.0;
    vec3 hit = p + s * uLightDirObj;
    float t = (length(hit.xz) - uRingInner) / (uRingOuter - uRingInner);
    if (t < 0.0 || t > 1.0) return 0.0;
    float edge = smoothstep(0.0, 0.08, t) * smoothstep(1.0, 0.88, t);
    float gaps = 1.0 - 0.9 * smoothstep(0.05, 0.0, abs(t - 0.56));
    return edge * gaps * mix(0.55, 1.0, smoothstep(0.0, 0.45, t));
  }

  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(-vViewPos);
    vec3 p = normalize(vObjPos);

    float warp = fbm(p * vec3(1.6, 4.5, 1.6) + vec3(uTime * 0.015, 0.0, 0.0));
    float lat = p.y * 4.5 + warp * 1.7;
    float bands = sin(lat * 3.14159) * 0.5 + 0.5;
    float streaks = fbm(p * vec3(2.5, 22.0, 2.5) + warp * 2.5);
    float m = clamp(bands * 0.7 + streaks * 0.5, 0.0, 1.0);

    vec3 deep = mix(uColorA, vec3(0.01, 0.01, 0.035), 0.86);
    vec3 mid = mix(uColorA, uColorB, 0.3) * 0.62;
    vec3 bright = mix(uColorB, vec3(1.0), 0.35);
    vec3 albedo = mix(deep, mid, smoothstep(0.18, 0.62, m));
    albedo = mix(albedo, bright, smoothstep(0.74, 1.0, m) * 0.5);

    float ndl = dot(n, normalize(uLightDir));
    float ndv = clamp(dot(n, v), 0.0, 1.0);
    float diffuse = smoothstep(-0.12, 0.7, ndl);
    diffuse *= 1.0 - 0.62 * ringShadow(vObjPos);
    float limb = mix(0.5, 1.0, pow(ndv, 0.6));
    vec3 col = albedo * (0.025 + 1.35 * diffuse * limb);

    float fresnel = pow(1.0 - ndv, 3.2);
    col += mix(uColorA, uColorB, 0.4) * fresnel * (0.1 + 1.1 * diffuse);

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

// Soft halo drawn on the inside of a slightly larger sphere, fading to nothing at its edge.
const ATMOSPHERE_FRAG = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uLightDir;
  uniform float uMaxDot;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(-vViewPos);
    float depth = clamp(-dot(n, v), 0.0, 1.0);
    float glow = pow(smoothstep(0.0, uMaxDot, depth), 2.0);
    float lit = mix(0.06, 1.0, smoothstep(-0.25, 0.5, dot(n, normalize(uLightDir))));
    vec3 col = mix(uColorA, uColorB, 0.3);
    gl_FragColor = vec4(col, glow * lit * 0.75);
    #include <colorspace_fragment>
  }
`;

const MOON_FRAG = /* glsl */ `
  uniform vec3 uLightDir;
  varying vec3 vNormal;
  void main() {
    float diffuse = smoothstep(-0.1, 0.8, dot(normalize(vNormal), normalize(uLightDir)));
    gl_FragColor = vec4(vec3(0.81, 0.79, 0.92) * (0.03 + 1.2 * diffuse), 1.0);
    #include <colorspace_fragment>
  }
`;

const RING_VERT = /* glsl */ `
  varying vec2 vPos;
  varying vec3 vViewPos;
  varying vec3 vCenterView;
  void main() {
    vPos = position.xy;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewPos = mv.xyz;
    vCenterView = (modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

// Ring system: fine radial bands, two gaps, and the planet's shadow falling across the far side.
const RING_FRAG = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uLightDir;
  uniform float uInner;
  uniform float uOuter;
  uniform float uPlanetRadius;
  varying vec2 vPos;
  varying vec3 vViewPos;
  varying vec3 vCenterView;
  float hash1(float x) { return fract(sin(x * 127.1) * 43758.5453); }
  float noise1(float x) {
    float i = floor(x);
    float f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(hash1(i), hash1(i + 1.0), f);
  }
  void main() {
    float r = length(vPos);
    float t = (r - uInner) / (uOuter - uInner);
    float edge = smoothstep(0.0, 0.05, t) * smoothstep(1.0, 0.9, t);
    float bands = 0.5 * noise1(t * 38.0) + 0.3 * noise1(t * 120.0) + 0.2 * noise1(t * 9.0);
    float gaps = 1.0 - 0.92 * smoothstep(0.035, 0.0, abs(t - 0.56));
    gaps *= 1.0 - 0.7 * smoothstep(0.014, 0.0, abs(t - 0.83));
    float density = edge * gaps * (0.22 + 0.78 * bands) * mix(0.5, 1.0, smoothstep(0.0, 0.45, t));

    vec3 col = mix(uColorA, uColorB, smoothstep(0.05, 0.95, t));
    col = mix(col, vec3(1.0), 0.28 * bands);

    vec3 l = normalize(uLightDir);
    vec3 rel = vViewPos - vCenterView;
    float along = dot(rel, l);
    float away = length(rel - along * l);
    // Compare against the planet's on-screen radius, which changes with the system's scale.
    float planetRadius = uPlanetRadius * length(vCenterView - vViewPos) / max(r, 0.0001);
    float shadow = along < 0.0 ? smoothstep(planetRadius * 0.93, planetRadius * 1.05, away) : 1.0;
    col *= mix(0.04, 1.0, shadow);

    gl_FragColor = vec4(col, density * 0.82);
    #include <colorspace_fragment>
  }
`;

const AURA_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Wide, faint haze behind everything so the planet does not sit on flat black.
const AURA_FRAG = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying vec2 vUv;
  void main() {
    vec2 c = (vUv - 0.5) * 2.0;
    float r = length(c);
    float glow = exp(-r * r * 7.0);
    vec3 col = mix(uColorA, uColorB, smoothstep(-0.6, 0.6, c.x + c.y));
    gl_FragColor = vec4(col, glow * 0.2);
    #include <colorspace_fragment>
  }
`;

function circlePoints(radius: number, segments = 160): [number, number, number][] {
  return Array.from({ length: segments + 1 }, (_, i) => {
    const angle = (i / segments) * Math.PI * 2;
    return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
  });
}

function Moon({ radius, size, speed, phase, tilt, color }: {
  radius: number;
  size: number;
  speed: number;
  phase: number;
  tilt: [number, number, number];
  color: "a" | "b";
}) {
  const moon = useRef<THREE.Mesh>(null);
  const line = useRef<{ material: { color: THREE.Color } }>(null);
  const points = useMemo(() => circlePoints(radius), [radius]);
  const uniforms = useMemo(() => ({ uLightDir: { value: LIGHT_DIR } }), []);

  useFrame(() => {
    const angle = phase + journey.time * speed;
    moon.current?.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    line.current?.material.color.copy(color === "a" ? journey.colorA : journey.colorB);
  });

  return (
    <group rotation={tilt}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Line ref={line as any} points={points} lineWidth={1} transparent opacity={0.14} depthWrite={false} />
      <mesh ref={moon}>
        <sphereGeometry args={[size, 32, 32]} />
        <shaderMaterial vertexShader={SURFACE_VERT} fragmentShader={MOON_FRAG} uniforms={uniforms} />
      </mesh>
    </group>
  );
}

/** Ringed planet for the About section. It sits exactly over the HTML element marked "planet". */
export default function Planet() {
  const root = useRef<THREE.Group>(null);
  const rig = useRef<THREE.Group>(null);
  const planet = useRef<THREE.Mesh>(null);
  const planetMaterial = useRef<THREE.ShaderMaterial>(null);
  const placement = useMemo(() => createPlacement(), []);
  const inverseWorld = useMemo(() => new THREE.Matrix4(), []);
  const lightWorld = useMemo(() => new THREE.Vector3(), []);

  const uniforms = useMemo(
    () => ({
      planet: {
        uTime: { value: 0 },
        uColorA: { value: journey.colorA },
        uColorB: { value: journey.colorB },
        uLightDir: { value: LIGHT_DIR },
        uLightDirObj: { value: new THREE.Vector3(0, 1, 0) },
        uRingInner: { value: RING_INNER },
        uRingOuter: { value: RING_OUTER },
      },
      atmosphere: {
        uColorA: { value: journey.colorA },
        uColorB: { value: journey.colorB },
        uLightDir: { value: LIGHT_DIR },
        uMaxDot: { value: Math.sqrt(1 - 1 / (ATMOSPHERE_SCALE * ATMOSPHERE_SCALE)) },
      },
      ring: {
        uColorA: { value: journey.colorA },
        uColorB: { value: journey.colorB },
        uLightDir: { value: LIGHT_DIR },
        uInner: { value: RING_INNER },
        uOuter: { value: RING_OUTER },
        uPlanetRadius: { value: PLANET_RADIUS },
      },
      aura: {
        uColorA: { value: journey.colorA },
        uColorB: { value: journey.colorB },
      },
    }),
    []
  );

  useFrame((state, rawDelta) => {
    const group = root.current;
    if (!group) return;
    const camera = state.camera as THREE.PerspectiveCamera;
    group.visible = placeAnchor("planet", camera, state.size, placement);
    if (!group.visible) return;

    // Grows a little as it scrolls up the screen, as if the camera were closing in on it.
    const approach = THREE.MathUtils.clamp(1 - placement.offset * 0.25, 0.75, 1.3);
    group.position.set(placement.x, placement.y, -VIEW_DEPTH);
    group.scale.setScalar((placement.width / SYSTEM_WIDTH) * approach);

    const delta = Math.min(rawDelta, 0.05);
    // Go through the material: R3F copies the uniforms it is given, so plain numbers must be set there.
    if (planetMaterial.current) planetMaterial.current.uniforms.uTime.value = journey.time;
    if (planet.current) {
      if (!journey.reducedMotion) planet.current.rotation.y += delta * 0.045;
      // The ring-shadow maths runs in the planet's own space, so hand it the light direction there.
      planet.current.updateWorldMatrix(true, false);
      inverseWorld.copy(planet.current.matrixWorld).invert();
      lightWorld.copy(LIGHT_DIR).applyQuaternion(camera.quaternion);
      uniforms.planet.uLightDirObj.value.copy(lightWorld).transformDirection(inverseWorld);
    }
    if (rig.current) {
      rig.current.rotation.y = THREE.MathUtils.damp(rig.current.rotation.y, journey.pointerX * 0.16 + placement.offset * 0.5, 2.5, delta);
      rig.current.rotation.x = THREE.MathUtils.damp(rig.current.rotation.x, -journey.pointerY * 0.1, 2.5, delta);
      rig.current.position.y = Math.sin(journey.time * 0.45) * 0.07;
    }
  });

  return (
    <group ref={root} visible={false}>
      <mesh position={[-0.5, 0.1, -2.5]} renderOrder={0}>
        <planeGeometry args={[12, 12]} />
        <shaderMaterial
          vertexShader={AURA_VERT}
          fragmentShader={AURA_FRAG}
          uniforms={uniforms.aura}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <group ref={rig}>
        {/* Tilt the whole system so the rings read as an ellipse. */}
        <group rotation={[0.4, 0, 0.3]}>
          <mesh ref={planet}>
            <sphereGeometry args={[PLANET_RADIUS, 96, 96]} />
            <shaderMaterial ref={planetMaterial} vertexShader={SURFACE_VERT} fragmentShader={PLANET_FRAG} uniforms={uniforms.planet} />
          </mesh>

          <mesh scale={ATMOSPHERE_SCALE} renderOrder={1}>
            <sphereGeometry args={[PLANET_RADIUS, 64, 64]} />
            <shaderMaterial
              vertexShader={SURFACE_VERT}
              fragmentShader={ATMOSPHERE_FRAG}
              uniforms={uniforms.atmosphere}
              side={THREE.BackSide}
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>

          <mesh rotation={[Math.PI / 2, 0, 0]} renderOrder={2}>
            <ringGeometry args={[RING_INNER, RING_OUTER, 192, 1]} />
            <shaderMaterial
              vertexShader={RING_VERT}
              fragmentShader={RING_FRAG}
              uniforms={uniforms.ring}
              side={THREE.DoubleSide}
              transparent
              depthWrite={false}
            />
          </mesh>

          <Moon radius={3.25} size={0.095} speed={0.16} phase={0.6} tilt={[0.16, 0, -0.1]} color="a" />
          <Moon radius={3.6} size={0.06} speed={0.1} phase={3.6} tilt={[-0.12, 0, 0.14]} color="b" />
        </group>
      </group>
    </group>
  );
}
