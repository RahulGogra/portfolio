"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import CosmicZoom from "./CosmicZoom";
import Environment from "./Environment";
import { distanceKm, framing, JOURNEY_END_KM, journey, sunWorldPosition } from "./journey";

interface SpaceJourneyProps {
  accentHex: string;
  accentToHex: string;
}

function Scene({ accentHex, accentToHex, lowPower }: SpaceJourneyProps & { lowPower: boolean }) {
  /** Everything in this group is positioned in the camera's own space. */
  const view = useRef<THREE.Group>(null);
  const targetA = useMemo(() => new THREE.Color(accentHex), [accentHex]);
  const targetB = useMemo(() => new THREE.Color(accentToHex), [accentToHex]);
  const scratch = useMemo(
    () => ({
      sun: new THREE.Vector3(),
      endPosition: new THREE.Vector3(),
      endQuaternion: new THREE.Quaternion(),
      euler: new THREE.Euler(),
      lookMatrix: new THREE.Matrix4(),
      lookQuaternion: new THREE.Quaternion(),
      sway: new THREE.Quaternion(),
      up: new THREE.Vector3(0, 1, 0),
    }),
    []
  );

  // Runs before every other piece (negative priority) so they all see this frame's camera.
  useFrame((state, rawDelta) => {
    // Clamp so a long frame (background tab, slow device) cannot make anything jump.
    const delta = Math.min(rawDelta, 0.05);
    const calm = journey.reducedMotion;
    if (!calm) journey.time += delta;

    const ease = 1 - Math.exp(-6 * delta);
    journey.colorA.lerp(targetA, ease);
    journey.colorB.lerp(targetB, ease);

    // A gentle follow, so even a fast flick of the wheel turns into a smooth glide.
    journey.progress = calm ? journey.target : THREE.MathUtils.damp(journey.progress, journey.target, 3, delta);
    journey.km = distanceKm(journey.progress);
    journey.flip = calm ? journey.flipTarget : THREE.MathUtils.damp(journey.flip, journey.flipTarget, 2.5, delta);

    // One straight pull-back: the camera starts on top of the Sun's place in the galaxy and retreats
    // towards a point from which the whole galaxy is in view. Its distance along that line follows the
    // distance from Earth, so it only visibly moves near the end of the page.
    const camera = state.camera as THREE.PerspectiveCamera;
    const { sun, endPosition, endQuaternion, euler, lookMatrix, lookQuaternion, sway, up } = scratch;
    const px = calm ? 0 : journey.pointerX;
    const py = calm ? 0 : journey.pointerY;
    sunWorldPosition(sun, journey.time);
    endPosition.set(px * 0.2, py * 0.12, 0);
    endQuaternion.setFromEuler(euler.set(py * 0.015, -px * 0.02, 0));
    camera.position.copy(sun).lerp(endPosition, journey.km / JOURNEY_END_KM);
    lookQuaternion.setFromRotationMatrix(lookMatrix.lookAt(endPosition, sun, up));
    lookQuaternion.multiply(sway.setFromEuler(euler.set(py * 0.02, -px * 0.03, 0)));
    camera.quaternion.copy(lookQuaternion).slerp(endQuaternion, THREE.MathUtils.smoothstep(journey.progress, 0.85, 1));
    camera.updateMatrixWorld();

    // Shift the picture so the subject sits beside the reading column rather than under it.
    const { width, height } = state.size;
    const [ox, oy] = framing(journey.progress, width / height < 0.9, journey.flip);
    camera.setViewOffset(width, height, (-ox * width) / 2, (oy * height) / 2, width, height);

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
        <CosmicZoom lowPower={lowPower} />
      </group>
    </>
  );
}

/**
 * The 3D backdrop behind the whole page: one continuous zoom out from Earth to the whole Milky Way,
 * driven by how far down the page the visitor has scrolled.
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

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      journey.target = max > 0 ? THREE.MathUtils.clamp(window.scrollY / max, 0, 1) : 0;
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(document.body);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
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
        camera={{ position: [0, 0, 0], fov: 45, near: 0.001, far: 400 }}
        gl={{ alpha: false, antialias: true, powerPreference: "high-performance" }}
        style={{ pointerEvents: "none" }}
      >
        <Scene {...props} lowPower={lowPower} />
      </Canvas>
    </div>
  );
}
