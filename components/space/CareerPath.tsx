"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { anchorElement, glowTexture, journey, unitsPerPixel, VIEW_DEPTH } from "./journey";

const SAMPLES = 64;
/** Half the width of the glowing beam, in CSS pixels. */
const BEAM_HALF_WIDTH = 11;
const WHITE = new THREE.Color("#ffffff");

const BEAM_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Bright core with a soft falloff. The stretch the comet has already covered is lit; the rest is dim.
const BEAM_FRAG = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uHead;
  varying vec2 vUv;
  void main() {
    float across = abs(vUv.x - 0.5) * 2.0;
    float core = smoothstep(0.14, 0.0, across);
    float glow = pow(max(1.0 - across, 0.0), 2.5) * 0.4;
    float travelled = smoothstep(uHead + 0.012, uHead - 0.012, vUv.y);
    float ends = smoothstep(0.0, 0.07, vUv.y) * smoothstep(1.0, 0.93, vUv.y);
    vec3 col = mix(uColorA, uColorB, vUv.y);
    col = mix(col, vec3(1.0), core * 0.65 * travelled);
    gl_FragColor = vec4(col, (core + glow) * ends * mix(0.2, 1.0, travelled));
    #include <colorspace_fragment>
  }
`;

/**
 * The career timeline: a beam of light running past every experience card, a marker beside each card,
 * and a comet that rides the beam at the middle of the screen, so it moves down the timeline as you scroll.
 * Cards mark their position with data-space-anchor="exp-0", "exp-1", ...
 */
export default function CareerPath({ count }: { count: number }) {
  const root = useRef<THREE.Group>(null);
  const comet = useRef<THREE.Sprite>(null);
  const cometCore = useRef<THREE.Sprite>(null);
  const markers = useRef<(THREE.Sprite | null)[]>([]);
  const beamMaterial = useRef<THREE.ShaderMaterial>(null);
  const glow = useMemo(() => glowTexture(), []);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const uvs = new Float32Array(SAMPLES * 4);
    const indices: number[] = [];
    for (let i = 0; i < SAMPLES; i++) {
      const t = i / (SAMPLES - 1);
      uvs.set([0, t, 1, t], i * 4);
      if (i < SAMPLES - 1) {
        const a = i * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const positions = new THREE.BufferAttribute(new Float32Array(SAMPLES * 6), 3);
    positions.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute("position", positions);
    g.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    g.setIndex(indices);
    return g;
  }, []);

  const uniforms = useMemo(
    () => ({ uColorA: { value: journey.colorA }, uColorB: { value: journey.colorB }, uHead: { value: 0 } }),
    []
  );

  useFrame((state, rawDelta) => {
    const group = root.current;
    if (!group) return;
    const first = anchorElement("exp-0");
    const last = anchorElement(`exp-${count - 1}`);
    if (!first || !last) {
      group.visible = false;
      return;
    }
    const { width, height } = state.size;
    const firstRect = first.getBoundingClientRect();
    const lastRect = last.getBoundingClientRect();
    const top = firstRect.top - 70;
    const bottom = lastRect.top + 130;
    group.visible = bottom > -120 && top < height + 120;
    if (!group.visible) return;

    const delta = Math.min(rawDelta, 0.05);
    const u = unitsPerPixel(state.camera as THREE.PerspectiveCamera, height);
    const scrollY = window.scrollY;
    // A gentle wave that is fixed to the page, so the beam does not slide against the cards.
    const beamX = (y: number) => firstRect.left + Math.sin((y + scrollY) * 0.011) * 7;
    const toViewX = (x: number) => (x - width / 2) * u;
    const toViewY = (y: number) => -(y - height / 2) * u;

    const positions = geometry.getAttribute("position") as THREE.BufferAttribute;
    const half = BEAM_HALF_WIDTH * u;
    for (let i = 0; i < SAMPLES; i++) {
      const y = top + ((bottom - top) * i) / (SAMPLES - 1);
      const vx = toViewX(beamX(y));
      const vy = toViewY(y);
      positions.setXYZ(i * 2, vx - half, vy, 0);
      positions.setXYZ(i * 2 + 1, vx + half, vy, 0);
    }
    positions.needsUpdate = true;

    const headY = THREE.MathUtils.clamp(height * 0.5, firstRect.top, lastRect.top);
    // Go through the material: R3F copies the uniforms it is given, so plain numbers must be set there.
    if (beamMaterial.current) beamMaterial.current.uniforms.uHead.value = (headY - top) / (bottom - top);

    const pulse = 1 + Math.sin(journey.time * 3) * 0.08;
    if (comet.current && cometCore.current) {
      comet.current.position.set(toViewX(beamX(headY)), toViewY(headY), 0.01);
      comet.current.scale.setScalar(64 * u * pulse);
      (comet.current.material as THREE.SpriteMaterial).color.copy(journey.colorB).lerp(WHITE, 0.35);
      cometCore.current.position.copy(comet.current.position);
      cometCore.current.scale.setScalar(16 * u);
    }

    for (let i = 0; i < count; i++) {
      const sprite = markers.current[i];
      const el = anchorElement(`exp-${i}`);
      if (!sprite || !el) continue;
      const rect = i === 0 ? firstRect : i === count - 1 ? lastRect : el.getBoundingClientRect();
      const reached = rect.top <= headY + 4;
      const near = Math.abs(rect.top - headY) < 110;
      sprite.position.set(toViewX(beamX(rect.top)), toViewY(rect.top), 0.005);
      const target = (near ? 46 : reached ? 30 : 22) * u;
      sprite.scale.setScalar(THREE.MathUtils.damp(sprite.scale.x, target, 7, delta));
      const material = sprite.material as THREE.SpriteMaterial;
      material.color.copy(journey.colorA).lerp(journey.colorB, i / Math.max(count - 1, 1));
      material.opacity = THREE.MathUtils.damp(material.opacity, reached ? 1 : 0.45, 7, delta);
    }
  });

  return (
    <group ref={root} position={[0, 0, -VIEW_DEPTH]} visible={false}>
      <mesh geometry={geometry} frustumCulled={false}>
        <shaderMaterial
          ref={beamMaterial}
          vertexShader={BEAM_VERT}
          fragmentShader={BEAM_FRAG}
          uniforms={uniforms}
          side={THREE.DoubleSide}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {Array.from({ length: count }, (_, i) => (
        <sprite key={i} ref={(sprite) => { markers.current[i] = sprite; }} scale={0.2}>
          <spriteMaterial map={glow} transparent opacity={0.45} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      ))}

      <sprite ref={comet} scale={0.5}>
        <spriteMaterial map={glow} transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <sprite ref={cometCore} scale={0.15}>
        <spriteMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  );
}
