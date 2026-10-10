"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createPlacement, glowTexture, journey, mulberry32, placeAnchor, VIEW_DEPTH } from "./journey";

export interface SkillCategory {
  name: string;
  items: { name: string; icon: string }[];
}

interface Node {
  name: string;
  icon: string;
  position: THREE.Vector3;
  phase: number;
}

/** Where each category's cluster sits inside the square, in -1..1 coordinates. */
const CLUSTER_CENTERS: [number, number][] = [
  [-0.54, 0.52],
  [0.54, 0.44],
  [-0.5, -0.54],
  [0.56, -0.54],
];

function layout(categories: SkillCategory[]) {
  const rng = mulberry32(5);
  const nodes: Node[] = [];
  const clusters: number[][] = [];
  categories.forEach((category, c) => {
    const centre = CLUSTER_CENTERS[c] ?? [Math.cos(c) * 0.5, Math.sin(c) * 0.5];
    const count = category.items.length;
    const start = rng() * Math.PI * 2;
    const indices: number[] = [];
    category.items.forEach((item, j) => {
      const angle = start + (j / count) * Math.PI * 2;
      const radius = count === 1 ? 0 : 0.28 + rng() * 0.08;
      indices.push(nodes.length);
      nodes.push({
        name: item.name,
        icon: item.icon,
        position: new THREE.Vector3(centre[0] + Math.cos(angle) * radius, centre[1] + Math.sin(angle) * radius, (rng() - 0.5) * 0.7),
        phase: rng() * Math.PI * 2,
      });
    });
    clusters.push(indices);
  });

  // Lines inside a category form its shape; one faint link joins each neighbouring pair of categories.
  const inner: number[] = [];
  clusters.forEach((indices) => {
    for (let j = 0; j < indices.length; j++) {
      if (indices.length < 3 && j === indices.length - 1) break;
      const a = nodes[indices[j]].position;
      const b = nodes[indices[(j + 1) % indices.length]].position;
      inner.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  });
  const outer: number[] = [];
  const pairs = [[0, 1], [1, 3], [3, 2], [2, 0]].filter(([a, b]) => clusters[a] && clusters[b]);
  pairs.forEach(([a, b]) => {
    let best: [THREE.Vector3, THREE.Vector3] | null = null;
    let bestDistance = Infinity;
    clusters[a].forEach((i) =>
      clusters[b].forEach((k) => {
        const d = nodes[i].position.distanceTo(nodes[k].position);
        if (d < bestDistance) {
          bestDistance = d;
          best = [nodes[i].position, nodes[k].position];
        }
      })
    );
    if (best) {
      const [p, q] = best as [THREE.Vector3, THREE.Vector3];
      outer.push(p.x, p.y, p.z, q.x, q.y, q.z);
    }
  });

  const toGeometry = (values: number[]) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(values, 3));
    return g;
  };
  return { nodes, inner: toGeometry(inner), outer: toGeometry(outer) };
}

/**
 * Turns a logo SVG into a texture. The file is fetched as text first so it can be given an explicit
 * size; without one, browsers rasterise it tiny (or not at all) when it is drawn to a canvas.
 */
async function loadIcon(url: string): Promise<THREE.Texture> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Icon request failed: ${response.status}`);
  let svg = await response.text();
  if (!/<svg[^>]*\swidth=/.test(svg)) svg = svg.replace("<svg", '<svg width="128" height="128"');
  const blobUrl = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Icon could not be decoded"));
      image.src = blobUrl;
    });
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    canvas.getContext("2d")!.drawImage(image, 0, 0, 128, 128);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

/** The skills, drawn as one constellation of logo stars. Sits over the HTML element marked "constellation". */
export default function Constellation({ categories }: { categories: SkillCategory[] }) {
  const root = useRef<THREE.Group>(null);
  const icons = useRef<(THREE.Sprite | null)[]>([]);
  const glows = useRef<(THREE.Sprite | null)[]>([]);
  const innerMaterial = useRef<THREE.LineBasicMaterial>(null);
  const outerMaterial = useRef<THREE.LineBasicMaterial>(null);
  const placement = useMemo(() => createPlacement(), []);
  const glow = useMemo(() => glowTexture(), []);
  const [textures, setTextures] = useState<Record<string, THREE.Texture>>({});

  // The parent re-creates the array on every render, so key the layout on its contents instead.
  const key = categories.map((c) => `${c.name}:${c.items.map((i) => i.name).join(",")}`).join("|");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { nodes, inner, outer } = useMemo(() => layout(categories), [key]);

  useEffect(() => {
    let cancelled = false;
    const created: THREE.Texture[] = [];
    nodes.forEach((node) => {
      loadIcon(node.icon)
        .then((texture) => {
          if (cancelled) return texture.dispose();
          created.push(texture);
          setTextures((current) => ({ ...current, [node.name]: texture }));
        })
        .catch(() => {
          /* The node still shows as a plain star. */
        });
    });
    return () => {
      cancelled = true;
      created.forEach((texture) => texture.dispose());
    };
  }, [nodes]);

  useFrame((state, rawDelta) => {
    const group = root.current;
    if (!group) return;
    const camera = state.camera as THREE.PerspectiveCamera;
    group.visible = placeAnchor("constellation", camera, state.size, placement);
    if (!group.visible) return;

    const delta = Math.min(rawDelta, 0.05);
    const approach = THREE.MathUtils.clamp(1 - placement.offset * 0.2, 0.8, 1.25);
    group.position.set(placement.x, placement.y, -VIEW_DEPTH);
    group.scale.setScalar((Math.min(placement.width, placement.height) / 2) * 0.9 * approach);
    // Turns as it passes, which is what gives the flat-looking pattern its depth.
    group.rotation.y = placement.offset * 0.9 + journey.pointerX * 0.18 + Math.sin(journey.time * 0.2) * 0.06;
    group.rotation.x = -journey.pointerY * 0.12 + placement.offset * 0.15;

    innerMaterial.current?.color.copy(journey.colorA).lerp(journey.colorB, 0.35);
    outerMaterial.current?.color.copy(journey.colorB);

    nodes.forEach((node, i) => {
      const active = journey.activeSkill === node.name;
      const pulse = 1 + Math.sin(journey.time * 1.3 + node.phase) * 0.08;
      const icon = icons.current[i];
      const halo = glows.current[i];
      if (icon) {
        const target = active ? 0.28 : 0.17;
        icon.scale.setScalar(THREE.MathUtils.damp(icon.scale.x, target, 8, delta));
      }
      if (halo) {
        const target = (active ? 0.95 : 0.5) * pulse;
        halo.scale.setScalar(THREE.MathUtils.damp(halo.scale.x, target, 8, delta));
        const material = halo.material as THREE.SpriteMaterial;
        material.color.copy(i % 2 ? journey.colorB : journey.colorA);
        material.opacity = THREE.MathUtils.damp(material.opacity, active ? 0.95 : 0.5, 8, delta);
      }
    });
  });

  return (
    <group ref={root} visible={false}>
      <lineSegments geometry={inner}>
        <lineBasicMaterial ref={innerMaterial} transparent opacity={0.5} depthWrite={false} />
      </lineSegments>
      <lineSegments geometry={outer}>
        <lineBasicMaterial ref={outerMaterial} transparent opacity={0.16} depthWrite={false} />
      </lineSegments>

      {nodes.map((node, i) => (
        <group key={node.name} position={node.position}>
          <sprite ref={(sprite) => { glows.current[i] = sprite; }} scale={0.5} renderOrder={1}>
            <spriteMaterial map={glow} transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
          {textures[node.name] && (
            <sprite ref={(sprite) => { icons.current[i] = sprite; }} scale={0.17} renderOrder={2}>
              <spriteMaterial map={textures[node.name]} transparent depthWrite={false} />
            </sprite>
          )}
        </group>
      ))}
    </group>
  );
}
