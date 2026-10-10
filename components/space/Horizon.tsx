"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createPlacement, journey, placeAnchor, VIEW_DEPTH } from "./journey";

/** The plane is this many times taller than the anchor, leaving room for the glow above the horizon. */
const HEIGHT_FACTOR = 4;

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// The curved edge of a world rising at the end of the journey: dark body, bright rim, soft atmosphere.
// Everything is computed in pixels so the curve keeps its shape on any screen.
const FRAG = /* glsl */ `
  uniform vec2 uSize;
  uniform float uCap;
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying vec2 vUv;
  void main() {
    vec2 pos = vec2((vUv.x - 0.5) * uSize.x, vUv.y * uSize.y);
    // Circle whose top pokes uCap pixels above the bottom edge and spans a little more than the screen.
    float chord = uSize.x * 1.25;
    float radius = (chord * chord * 0.25 + uCap * uCap) / (2.0 * uCap);
    float d = length(pos - vec2(0.0, uCap - radius)) - radius;

    float inside = smoothstep(1.5, -1.5, d);
    // Squared by hand: pow() with a negative base is undefined in GLSL and broke the left half of the glow.
    float fx = pos.x / (uSize.x * 0.3);
    float flare = exp(-fx * fx);
    float breathe = 0.92 + 0.08 * sin(uTime * 0.6);
    float rim = exp(-abs(d) / (uCap * 0.03));
    float atmosphere = exp(-max(d, 0.0) / (uCap * 0.6));
    float limb = exp(min(d, 0.0) / (uCap * 0.45));

    vec3 accent = mix(uColorA, uColorB, smoothstep(-0.35, 0.35, pos.x / uSize.x));
    float lit = (0.3 + 0.7 * flare) * breathe;
    vec3 sky = accent * atmosphere * 0.5 * lit + vec3(1.0) * rim * 0.85 * lit;
    vec3 body = vec3(0.012, 0.012, 0.03) + accent * limb * 0.4 * lit + vec3(1.0) * rim * 0.6 * lit;

    // Premultiplied output: zero alpha above the horizon means the glow adds to the stars behind it.
    gl_FragColor = vec4(mix(sky, body, inside), inside);
    #include <colorspace_fragment>
  }
`;

/** Glowing horizon behind the contact section. Its base sits on the HTML element marked "horizon". */
export default function Horizon() {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const placement = useMemo(() => createPlacement(), []);
  const uniforms = useMemo(
    () => ({
      uSize: { value: new THREE.Vector2(1, 1) },
      uCap: { value: 100 },
      uTime: { value: 0 },
      uColorA: { value: journey.colorA },
      uColorB: { value: journey.colorB },
    }),
    []
  );

  useFrame((state) => {
    if (!mesh.current || !material.current) return;
    const camera = state.camera as THREE.PerspectiveCamera;
    mesh.current.visible = placeAnchor("horizon", camera, state.size, placement, VIEW_DEPTH, 0.6);
    if (!mesh.current.visible) return;

    const u = placement.unitsPerPx;
    const pxHeight = placement.pxHeight * HEIGHT_FACTOR;
    const bottom = placement.top + placement.pxHeight;
    // Go through the material: R3F copies the uniforms it is given, so plain numbers must be set there.
    const live = material.current.uniforms;
    live.uSize.value.set(state.size.width, pxHeight);
    live.uCap.value = placement.pxHeight;
    live.uTime.value = journey.time;
    mesh.current.scale.set(state.size.width * u, pxHeight * u, 1);
    mesh.current.position.set(0, -(bottom - pxHeight / 2 - state.size.height / 2) * u, -VIEW_DEPTH);
  });

  return (
    <mesh ref={mesh} visible={false} frustumCulled={false} renderOrder={-1}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial ref={material} vertexShader={VERT} fragmentShader={FRAG} uniforms={uniforms} transparent premultipliedAlpha depthWrite={false} />
    </mesh>
  );
}
