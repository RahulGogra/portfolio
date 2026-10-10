"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createPlacement, journey, placeAnchor, VIEW_DEPTH } from "./journey";

const SCREEN_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ROUNDED_BOX = /* glsl */ `
  float roundedBox(vec2 p, vec2 halfSize, float radius) {
    vec2 q = abs(p) - halfSize + radius;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
  }
`;

// The project image, cropped to fill a rounded panel, with a thin theme-coloured edge.
const SCREEN_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uHasMap;
  uniform float uPlaneAspect;
  uniform float uImageAspect;
  uniform float uActive;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying vec2 vUv;
  ${ROUNDED_BOX}
  void main() {
    // Work in units of the panel's height so the corner radius is round, not stretched.
    vec2 p = (vUv - 0.5) * vec2(uPlaneAspect, 1.0);
    float d = roundedBox(p, vec2(uPlaneAspect, 1.0) * 0.5, 0.07);
    float aa = fwidth(d);
    float mask = 1.0 - smoothstep(-aa, aa, d);

    // "Cover" fit: fill the panel and crop whichever side overflows.
    vec2 uv = vUv - 0.5;
    if (uPlaneAspect > uImageAspect) uv.y *= uImageAspect / uPlaneAspect;
    else uv.x *= uPlaneAspect / uImageAspect;
    vec3 image = texture2D(uMap, uv + 0.5).rgb;
    vec3 placeholder = mix(uColorA, uColorB, vUv.x) * 0.12;
    vec3 col = mix(placeholder, image, uHasMap) * (0.8 + 0.2 * uActive);

    float vignette = smoothstep(0.35, 0.8, length((vUv - 0.5) * 1.6));
    col *= 1.0 - 0.3 * vignette;

    float edge = 1.0 - smoothstep(0.0, 0.014, -d);
    col = mix(col, mix(uColorA, uColorB, vUv.x), edge * (0.55 + 0.45 * uActive));

    gl_FragColor = vec4(col, mask);
    #include <colorspace_fragment>
  }
`;

// Light spilling from the panel onto the space behind it.
const HALO_FRAG = /* glsl */ `
  uniform float uPlaneAspect;
  uniform float uActive;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying vec2 vUv;
  ${ROUNDED_BOX}
  void main() {
    // This plane is 1.5x the panel, so scale back to the panel's own coordinates.
    vec2 p = (vUv - 0.5) * vec2(uPlaneAspect, 1.0) * 1.5;
    float d = roundedBox(p, vec2(uPlaneAspect, 1.0) * 0.5, 0.07);
    float glow = exp(-max(d, 0.0) * 9.0) * (0.22 + 0.3 * uActive);
    // Fade out completely before the edge of the plane.
    glow *= smoothstep(0.25, 0.05, max(d, 0.0));
    gl_FragColor = vec4(mix(uColorA, uColorB, vUv.x), glow);
    #include <colorspace_fragment>
  }
`;

const EMPTY = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
EMPTY.needsUpdate = true;

function Screen({ index, image }: { index: number; image: string }) {
  const root = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const screenMaterial = useRef<THREE.ShaderMaterial>(null);
  const haloMaterial = useRef<THREE.ShaderMaterial>(null);
  const active = useRef(0);
  const placement = useMemo(() => createPlacement(), []);
  // Starting values only. R3F copies these into each material, so later changes go through the material refs.
  const uniforms = useMemo(
    () => ({
      uMap: { value: EMPTY as THREE.Texture },
      uHasMap: { value: 0 },
      uPlaneAspect: { value: 1.6 },
      uImageAspect: { value: 1.6 },
      uActive: { value: 0 },
      uColorA: { value: journey.colorA },
      uColorB: { value: journey.colorB },
    }),
    []
  );

  useEffect(() => {
    let cancelled = false;
    let loaded: THREE.Texture | null = null;
    new THREE.TextureLoader().load(
      image,
      (texture) => {
        if (cancelled) return texture.dispose();
        loaded = texture;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 4;
        const live = screenMaterial.current?.uniforms;
        if (!live) return;
        live.uMap.value = texture;
        live.uImageAspect.value = texture.image.width / texture.image.height;
        live.uHasMap.value = 1;
      },
      undefined,
      () => {
        /* Keep the tinted placeholder if the image cannot be loaded. */
      }
    );
    const material = screenMaterial.current;
    return () => {
      cancelled = true;
      if (material) {
        material.uniforms.uMap.value = EMPTY;
        material.uniforms.uHasMap.value = 0;
      }
      loaded?.dispose();
    };
  }, [image]);

  useFrame((state, rawDelta) => {
    const group = root.current;
    if (!group || !tilt.current) return;
    const camera = state.camera as THREE.PerspectiveCamera;
    group.visible = placeAnchor(`project-${index}`, camera, state.size, placement, VIEW_DEPTH, 0.3);
    if (!group.visible) return;

    const delta = Math.min(rawDelta, 0.05);
    active.current = THREE.MathUtils.damp(active.current, journey.activeProject === index ? 1 : 0, 6, delta);
    const aspect = placement.width / Math.max(placement.height, 0.0001);
    for (const material of [screenMaterial.current, haloMaterial.current]) {
      if (!material) continue;
      material.uniforms.uActive.value = active.current;
      material.uniforms.uPlaneAspect.value = aspect;
    }

    group.position.set(placement.x, placement.y, -VIEW_DEPTH);
    group.scale.set(placement.width, placement.height, 1);

    // Alternate panels lean opposite ways; all of them swing a little as they scroll past.
    const side = index % 2 === 0 ? 1 : -1;
    const bob = Math.sin(journey.time * 0.7 + index * 1.7);
    tilt.current.rotation.y = THREE.MathUtils.damp(
      tilt.current.rotation.y,
      side * 0.16 * (1 - active.current) + journey.pointerX * 0.1,
      5,
      delta
    );
    tilt.current.rotation.x = -placement.offset * 0.35 - journey.pointerY * 0.06 + bob * 0.012;
    tilt.current.position.y = bob * 0.012;
    tilt.current.scale.setScalar(1 + 0.03 * active.current);
  });

  return (
    <group ref={root} visible={false}>
      <group ref={tilt}>
        <mesh scale={1.5} position={[0, 0, -0.01]} renderOrder={0}>
          <planeGeometry args={[1, 1]} />
          <shaderMaterial
            ref={haloMaterial}
            vertexShader={SCREEN_VERT}
            fragmentShader={HALO_FRAG}
            uniforms={uniforms}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <mesh renderOrder={1}>
          <planeGeometry args={[1, 1]} />
          <shaderMaterial ref={screenMaterial} vertexShader={SCREEN_VERT} fragmentShader={SCREEN_FRAG} uniforms={uniforms} transparent depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}

/** One floating panel per project, each drawn over the HTML element marked "project-N". */
export default function ProjectScreens({ images }: { images: string[] }) {
  return (
    <>
      {images.map((image, index) => (
        <Screen key={index} index={index} image={image} />
      ))}
    </>
  );
}
