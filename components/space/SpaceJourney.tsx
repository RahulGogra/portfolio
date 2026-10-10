"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import CareerPath from "./CareerPath";
import Constellation, { type SkillCategory } from "./Constellation";
import Environment from "./Environment";
import Horizon from "./Horizon";
import Planet from "./Planet";
import ProjectScreens from "./ProjectScreens";
import { journey, SECTION_IDS, STATION_SPACING } from "./journey";

interface SpaceJourneyProps {
  accentHex: string;
  accentToHex: string;
  skillCategories: SkillCategory[];
  projectImages: string[];
  experienceCount: number;
}

type SceneProps = SpaceJourneyProps & { lowPower: boolean };

function Scene({ accentHex, accentToHex, skillCategories, projectImages, experienceCount, lowPower }: SceneProps) {
  /** Everything in this group is positioned in the camera's own space, so it can be lined up with the HTML. */
  const view = useRef<THREE.Group>(null);
  const targetA = useMemo(() => new THREE.Color(accentHex), [accentHex]);
  const targetB = useMemo(() => new THREE.Color(accentToHex), [accentToHex]);

  // Runs before every other piece (negative priority) so they all see this frame's camera.
  useFrame((state, rawDelta) => {
    // Clamp so a long frame (background tab, slow device) cannot make anything jump.
    const delta = Math.min(rawDelta, 0.05);
    const calm = journey.reducedMotion;
    if (!calm) journey.time += delta;

    const ease = 1 - Math.exp(-6 * delta);
    journey.colorA.lerp(targetA, ease);
    journey.colorB.lerp(targetB, ease);

    const previous = journey.progress;
    journey.progress = calm ? journey.target : THREE.MathUtils.damp(previous, journey.target, 4.5, delta);
    const speed = (journey.progress - previous) / Math.max(delta, 0.0001);
    journey.velocity = THREE.MathUtils.damp(journey.velocity, speed, 6, delta);

    const p = journey.progress;
    const px = calm ? 0 : journey.pointerX;
    const py = calm ? 0 : journey.pointerY;
    const camera = state.camera as THREE.PerspectiveCamera;
    // Forward travel carries the story; the gentle weave and roll keep it from feeling like a rail.
    camera.position.set(Math.sin(p * 1.1) * 1.0 + px * 0.25, Math.sin(p * 0.8) * 0.5 + py * 0.15, -p * STATION_SPACING);
    camera.rotation.set(py * 0.02 + Math.sin(p * 0.6) * 0.02, -px * 0.03 + Math.sin(p * 0.9) * 0.05, Math.sin(p * 0.7) * 0.035);

    // Widen the lens slightly at speed.
    const fov = 45 + (calm ? 0 : Math.min(Math.abs(journey.velocity) * 4.5, 8));
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    camera.updateMatrixWorld();

    if (view.current) {
      view.current.position.copy(camera.position);
      view.current.quaternion.copy(camera.quaternion);
    }
  }, -2);

  return (
    <>
      {/* Same near-black as the page. The canvas must be opaque: on a see-through canvas the browser
          throws away faint additive glows wherever nothing solid has been drawn yet. */}
      <color attach="background" args={["#050505"]} />
      <Environment lowPower={lowPower} />
      <group ref={view}>
        <Horizon />
        <Planet />
        <Constellation categories={skillCategories} />
        <CareerPath count={experienceCount} />
        <ProjectScreens images={projectImages} />
      </group>
    </>
  );
}

/**
 * The single 3D scene behind the whole page. Scrolling flies the camera forward through it, and each
 * section's centrepiece is drawn over an HTML element tagged with a data-space-anchor attribute.
 */
export default function SpaceJourney(props: SpaceJourneyProps) {
  const [lowPower] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      journey.reducedMotion = query.matches;
    };
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // Translate the scroll position into "how far between which two sections are we".
  useEffect(() => {
    let stops: number[] = [];

    const update = () => {
      if (stops.length < 2) return;
      const y = window.scrollY;
      let i = 0;
      while (i < stops.length - 2 && y >= stops[i + 1]) i++;
      const span = stops[i + 1] - stops[i];
      journey.target = THREE.MathUtils.clamp(i + (y - stops[i]) / span, 0, stops.length - 1);
    };

    const measure = () => {
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      stops = [];
      SECTION_IDS.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const top = Math.min(el.getBoundingClientRect().top + window.scrollY, maxScroll);
        // Short final sections can never reach the top of the screen, so keep the stops strictly increasing.
        stops.push(stops.length ? Math.max(top, stops[stops.length - 1] + 1) : top);
      });
      update();
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", update);
    };
  }, []);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      journey.pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      journey.pointerY = -((event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none" aria-hidden>
      <Canvas
        flat
        dpr={lowPower ? [1, 1.5] : [1, 1.75]}
        camera={{ position: [0, 0, 0], fov: 45, near: 0.1, far: 400 }}
        gl={{ alpha: false, antialias: true, powerPreference: "high-performance" }}
        style={{ pointerEvents: "none" }}
      >
        <Scene {...props} lowPower={lowPower} />
      </Canvas>
    </div>
  );
}
