"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { glowTexture, journey, mulberry32, sunWorldPosition, ZOOM_DEPTH } from "./journey";
import { AIR_FRAG, DOTS_FRAG, DOTS_VERT, EARTH_TEX_FRAG, MOON_TEX_FRAG, SUN_FRAG, SURFACE_VERT, TEXTURED_VERT } from "./shaders";

/**
 * Everything near home, in real kilometres with Earth at the origin: Earth, the Moon, the Sun, the planets
 * on their real orbits, the Oort cloud and the stars around the Sun. Nothing here is invented or resized.
 *
 * The group is scaled every frame so that one kilometre covers the right angle on screen for the current
 * distance from Earth; scrolling only changes that distance. Past a few hundred light-years the camera's own
 * retreat through the galaxy takes over (see SpaceJourney).
 */

const EARTH_RADIUS = 6371;
const MOON_RADIUS = 1737;
const MOON_ORBIT = 384400;
const MOON_ANGLE = 2.7;
const SUN_RADIUS = 696000;
const AU = 1.496e8;
const OORT_RADIUS = 7e12;
const LOCAL_STARS_RADIUS = 4e16;

/**
 * Surface maps from the three.js examples. Earth day, night and cloud/ocean maps: Solar System Scope,
 * CC BY 4.0 (credited in the page footer). Served from jsDelivr.
 */
const TEXTURE_BASE = "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r178/examples/textures/planets/";

/**
 * Light for the opening view. The Sun is far off screen at that scale, so its direction can be chosen
 * for the picture: from the upper left, so most of the globe is in daylight with cities lit along the night edge.
 */
const HERO_LIGHT = new THREE.Vector3(-0.6, 0.42, 0.3).normalize();

/** Orbit radius in AU, a position on the orbit, and dot colour. */
const PLANETS = [
  { name: "Mercury", au: 0.387, angle: 0.8, color: "#b9b2a8", size: 0.1 },
  { name: "Venus", au: 0.723, angle: 2.6, color: "#e8cf9a", size: 0.12 },
  { name: "Mars", au: 1.524, angle: 4.9, color: "#e0683c", size: 0.11 },
  { name: "Jupiter", au: 5.203, angle: 1.9, color: "#e2b98a", size: 0.18 },
  { name: "Saturn", au: 9.537, angle: 3.7, color: "#ecd9a4", size: 0.16 },
  { name: "Uranus", au: 19.19, angle: 5.6, color: "#9fe3ea", size: 0.13 },
  { name: "Neptune", au: 30.07, angle: 0.9, color: "#5d8dff", size: 0.13 },
];

function buildCloud(count: number, seed: number, inner: number, outer: number, palette: string[], sizes: [number, number]) {
  const rng = mulberry32(seed);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const pointSizes = new Float32Array(count);
  const color = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const u = rng() * 2 - 1;
    const angle = rng() * Math.PI * 2;
    const ring = Math.sqrt(1 - u * u);
    // Cube root keeps the points evenly spread through the volume rather than bunched at the centre.
    const radius = inner + (outer - inner) * Math.cbrt(rng());
    positions.set([Math.cos(angle) * ring * radius, u * radius, Math.sin(angle) * ring * radius], i * 3);
    color.set(palette[Math.floor(rng() * palette.length)]);
    colors.set([color.r, color.g, color.b], i * 3);
    pointSizes[i] = sizes[0] + Math.pow(rng(), 3) * (sizes[1] - sizes[0]);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(pointSizes, 1));
  return geometry;
}

function circleGeometry(radius: number, segments = 256) {
  const points: number[] = [];
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  return geometry;
}

/** 1 while `x` (a size on screen) is comfortably in frame, fading as it grows past the edges or shrinks away. */
function inFrame(x: number, tooSmall: number, small: number, big = 7, tooBig = 14) {
  return THREE.MathUtils.smoothstep(x, tooSmall, small) * (1 - THREE.MathUtils.smoothstep(x, big, tooBig));
}

function setOpacity(object: THREE.Object3D | null, opacity: number) {
  if (!object) return;
  object.visible = opacity > 0.003;
  const material = (object as THREE.Mesh).material as THREE.Material | undefined;
  if (material) material.opacity = opacity;
}

export default function CosmicZoom({ lowPower }: { lowPower: boolean }) {
  const rig = useRef<THREE.Group>(null);
  /** Slides everything so the centre of the view moves from Earth to the Sun as the solar system comes into frame. */
  const recentre = useRef<THREE.Group>(null);
  const earth = useRef<THREE.Mesh>(null);
  const earthMaterial = useRef<THREE.ShaderMaterial>(null);
  const air = useRef<THREE.Mesh>(null);
  const earthDot = useRef<THREE.Sprite>(null);
  const moon = useRef<THREE.Mesh>(null);
  const moonDot = useRef<THREE.Sprite>(null);
  const moonOrbit = useRef<THREE.LineLoop>(null);
  const sun = useRef<THREE.Mesh>(null);
  const sunGlow = useRef<THREE.Sprite>(null);
  const orbits = useRef<(THREE.LineLoop | null)[]>([]);
  const planetDots = useRef<(THREE.Sprite | null)[]>([]);
  const oort = useRef<THREE.Points>(null);
  const oortMaterial = useRef<THREE.ShaderMaterial>(null);
  const stars = useRef<THREE.Points>(null);
  const starsMaterial = useRef<THREE.ShaderMaterial>(null);
  const homeMarker = useRef<THREE.Sprite>(null);

  const glow = useMemo(() => glowTexture(), []);
  const lightView = useMemo(() => new THREE.Vector3(), []);
  const sunLight = useMemo(() => new THREE.Vector3(), []);
  const moonMaterial = useRef<THREE.ShaderMaterial>(null);
  const sunWorld = useMemo(() => new THREE.Vector3(), []);
  const inverse = useMemo(() => new THREE.Matrix4(), []);

  const geometry = useMemo(
    () => ({
      moonOrbit: circleGeometry(MOON_ORBIT),
      // Earth's own orbit first, then the other planets.
      orbits: [1, ...PLANETS.map((planet) => planet.au)].map((au) => circleGeometry(au * AU)),
      oort: buildCloud(lowPower ? 500 : 1100, 71, OORT_RADIUS * 0.35, OORT_RADIUS, ["#9fb6d9", "#c9d6ea"], [1.4, 2.6]),
      stars: buildCloud(lowPower ? 900 : 2000, 83, LOCAL_STARS_RADIUS * 0.01, LOCAL_STARS_RADIUS, ["#ffffff", "#ffffff", "#cfe0ff", "#ffe2b8", "#ffc59a"], [1.6, 5]),
    }),
    [lowPower]
  );

  const uniforms = useMemo(
    () => ({
      earth: {
        uDay: { value: null as THREE.Texture | null },
        uNight: { value: null as THREE.Texture | null },
        uMaps: { value: null as THREE.Texture | null },
        uLightDir: { value: lightView },
        uTime: { value: 0 },
        uReady: { value: 0 },
      },
      air: { uLightDir: { value: lightView } },
      moon: { uMap: { value: null as THREE.Texture | null }, uLightDir: { value: lightView }, uReady: { value: 0 } },
      oort: { uPixelRatio: { value: 1 }, uOpacity: { value: 0 } },
      stars: { uPixelRatio: { value: 1 }, uOpacity: { value: 0 } },
    }),
    [lightView]
  );

  // Load the surface maps once; the globe fades from a plain sphere to the real thing as they arrive.
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const loaded: THREE.Texture[] = [];
    let cancelled = false;
    const load = (file: string, colour: boolean) =>
      new Promise<THREE.Texture>((resolve, reject) =>
        loader.load(
          TEXTURE_BASE + file,
          (texture) => {
            texture.colorSpace = colour ? THREE.SRGBColorSpace : THREE.NoColorSpace;
            texture.anisotropy = 8;
            // Wrap round the globe: the clouds drift by sliding their map sideways, past its edge.
            texture.wrapS = THREE.RepeatWrapping;
            loaded.push(texture);
            resolve(texture);
          },
          undefined,
          reject
        )
      );
    Promise.all([load("earth_day_4096.jpg", true), load("earth_night_4096.jpg", true), load("earth_bump_roughness_clouds_4096.jpg", false)])
      .then(([day, night, maps]) => {
        const live = earthMaterial.current?.uniforms;
        if (cancelled || !live) return;
        live.uDay.value = day;
        live.uNight.value = night;
        live.uMaps.value = maps;
        live.uReady.value = 0.0001;
      })
      .catch(() => {
        /* Keep the plain globe if the maps cannot be loaded. */
      });
    load("moon_1024.jpg", true)
      .then((map) => {
        const live = moonMaterial.current?.uniforms;
        if (cancelled || !live) return;
        live.uMap.value = map;
        live.uReady.value = 1;
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      loaded.forEach((texture) => texture.dispose());
    };
  }, []);

  useFrame((state, rawDelta) => {
    const group = rig.current;
    if (!group) return;
    const km = journey.km;
    const logKm = Math.log10(km);
    const scale = ZOOM_DEPTH / km;
    group.visible = logKm < 17.3;
    group.scale.setScalar(scale);
    // A slow turn as the view widens, so orbits read as tilted discs rather than flat rings.
    group.rotation.set(0.62, 1.0 - journey.progress * 1.1, -0.16);
    // Sunlight comes from the Sun, one AU along the group's -x axis; the opening view uses its own angle.
    sunLight.set(-1, 0, 0).applyEuler(group.rotation);
    lightView.copy(HERO_LIGHT).lerp(sunLight, THREE.MathUtils.smoothstep(journey.progress, 0.03, 0.16)).normalize();
    const pixelRatio = state.gl.getPixelRatio();
    recentre.current?.position.set(AU * THREE.MathUtils.smoothstep(logKm, 7.6, 8.9), 0, 0);

    // --- Earth and the Moon, at true size ---
    const earthSize = EARTH_RADIUS * scale;
    if (earth.current && air.current) {
      earth.current.visible = air.current.visible = earthSize > 0.004;
      earth.current.rotation.y = 0.8 + journey.time * 0.02;
    }
    if (earthMaterial.current) {
      const live = earthMaterial.current.uniforms;
      live.uTime.value = journey.time;
      // Ease the real surface in once its maps have loaded.
      if (live.uReady.value > 0) live.uReady.value = Math.min(1, live.uReady.value + Math.min(rawDelta, 0.05) * 1.2);
    }
    if (earthDot.current) {
      // Once the globe is too small to see, a soft dot keeps marking it until the solar system is a dot itself.
      earthDot.current.scale.setScalar(0.18 / scale);
      setOpacity(earthDot.current, (1 - THREE.MathUtils.smoothstep(earthSize, 0.03, 0.12)) * THREE.MathUtils.smoothstep(AU * scale, 0.12, 0.45));
    }
    const moonTrack = inFrame(MOON_ORBIT * scale, 0.1, 0.4);
    if (moon.current) moon.current.visible = MOON_RADIUS * scale > 0.004 && moonTrack > 0;
    if (moonDot.current) {
      moonDot.current.scale.setScalar(0.12 / scale);
      setOpacity(moonDot.current, (1 - THREE.MathUtils.smoothstep(MOON_RADIUS * scale, 0.02, 0.08)) * moonTrack);
    }
    setOpacity(moonOrbit.current, 0.4 * moonTrack);

    // --- The Sun and the planets ---
    const sunInFrame = 1 - THREE.MathUtils.smoothstep(AU * scale, 9, 18);
    const fadeLate = 1 - THREE.MathUtils.smoothstep(logKm, 15.4, 16.4);
    if (sun.current) sun.current.visible = sunInFrame > 0 && SUN_RADIUS * scale > 0.003;
    if (sunGlow.current) {
      sunGlow.current.scale.setScalar(Math.max(SUN_RADIUS * 7, 0.8 / scale));
      setOpacity(sunGlow.current, sunInFrame * fadeLate);
    }
    orbits.current.forEach((orbit, i) => {
      const au = i === 0 ? 1 : PLANETS[i - 1].au;
      const amount = inFrame(au * AU * scale, 0.05, 0.22);
      setOpacity(orbit, 0.3 * amount);
      if (i > 0) {
        const dot = planetDots.current[i - 1];
        if (dot) {
          dot.scale.setScalar(PLANETS[i - 1].size / scale);
          setOpacity(dot, 0.9 * amount);
        }
      }
    });

    // --- The Oort cloud, then the stars around the Sun ---
    if (oort.current && oortMaterial.current) {
      const amount = 0.6 * inFrame(OORT_RADIUS * scale, 0.9, 2.2, 6, 14);
      oort.current.visible = amount > 0.003;
      oortMaterial.current.uniforms.uOpacity.value = amount;
      oortMaterial.current.uniforms.uPixelRatio.value = pixelRatio;
    }
    if (stars.current && starsMaterial.current) {
      // These hand over to the galaxy's own stars as the camera starts to pull away through the disc.
      const amount = THREE.MathUtils.smoothstep(logKm, 11.4, 12.8) * (1 - THREE.MathUtils.smoothstep(logKm, 16.3, 17.2));
      stars.current.visible = amount > 0.003;
      starsMaterial.current.uniforms.uOpacity.value = amount * 0.85;
      starsMaterial.current.uniforms.uPixelRatio.value = pixelRatio;
    }

    // --- A steady point at the Sun's place in the galaxy, once home is too small to see ---
    if (homeMarker.current?.parent) {
      const parent = homeMarker.current.parent;
      parent.updateWorldMatrix(true, false);
      homeMarker.current.position.copy(sunWorldPosition(sunWorld, journey.time)).applyMatrix4(inverse.copy(parent.matrixWorld).invert());
      setOpacity(homeMarker.current, 0.8 * THREE.MathUtils.smoothstep(logKm, 15.6, 16.6));
    }
  }, -1);

  return (
    <>
      <group ref={rig} position={[0, 0, -ZOOM_DEPTH]}>
        <group ref={recentre}>
        {/* Drawn back to front by hand (renderOrder), on top of the galaxy behind it. */}
        <group position={[-AU, 0, 0]}>
          <points ref={stars} geometry={geometry.stars} frustumCulled={false} renderOrder={900}>
            <shaderMaterial ref={starsMaterial} vertexShader={DOTS_VERT} fragmentShader={DOTS_FRAG} uniforms={uniforms.stars} transparent depthTest={false} depthWrite={false} blending={THREE.AdditiveBlending} />
          </points>
          <points ref={oort} geometry={geometry.oort} frustumCulled={false} renderOrder={901}>
            <shaderMaterial ref={oortMaterial} vertexShader={DOTS_VERT} fragmentShader={DOTS_FRAG} uniforms={uniforms.oort} transparent depthTest={false} depthWrite={false} blending={THREE.AdditiveBlending} />
          </points>
          {geometry.orbits.map((orbit, i) => (
            <lineLoop key={i} ref={(line) => { orbits.current[i] = line; }} geometry={orbit} frustumCulled={false} renderOrder={905}>
              <lineBasicMaterial color={i === 0 ? "#6fa8ff" : "#aab4c8"} transparent opacity={0} depthTest={false} depthWrite={false} />
            </lineLoop>
          ))}
          {PLANETS.map((planet, i) => (
            <sprite
              key={planet.name}
              ref={(sprite) => { planetDots.current[i] = sprite; }}
              position={[Math.cos(planet.angle) * planet.au * AU, 0, Math.sin(planet.angle) * planet.au * AU]}
              renderOrder={908}
            >
              <spriteMaterial map={glow} color={planet.color} transparent opacity={0} depthTest={false} depthWrite={false} />
            </sprite>
          ))}
          <sprite ref={sunGlow} renderOrder={909}>
            <spriteMaterial map={glow} color="#ffd9a0" transparent opacity={0} depthTest={false} depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
          <mesh ref={sun} renderOrder={910}>
            <sphereGeometry args={[SUN_RADIUS, 48, 48]} />
            <shaderMaterial vertexShader={SURFACE_VERT} fragmentShader={SUN_FRAG} transparent depthTest={false} depthWrite={false} />
          </mesh>
        </group>

        <lineLoop ref={moonOrbit} geometry={geometry.moonOrbit} frustumCulled={false} renderOrder={912}>
          <lineBasicMaterial color="#aab4c8" transparent opacity={0} depthTest={false} depthWrite={false} />
        </lineLoop>
        <group position={[Math.cos(MOON_ANGLE) * MOON_ORBIT, 0, Math.sin(MOON_ANGLE) * MOON_ORBIT]}>
          <sprite ref={moonDot} renderOrder={914}>
            <spriteMaterial map={glow} color="#d6d6dc" transparent opacity={0} depthTest={false} depthWrite={false} />
          </sprite>
          <mesh ref={moon} renderOrder={915}>
            <sphereGeometry args={[MOON_RADIUS, 48, 48]} />
            <shaderMaterial ref={moonMaterial} vertexShader={TEXTURED_VERT} fragmentShader={MOON_TEX_FRAG} uniforms={uniforms.moon} transparent depthTest={false} depthWrite={false} />
          </mesh>
        </group>

        {/* Earth writes depth so that its ring of atmosphere only shows outside the globe's edge. */}
        <sprite ref={earthDot} renderOrder={918}>
          <spriteMaterial map={glow} color="#6fa8ff" transparent opacity={0} depthTest={false} depthWrite={false} />
        </sprite>
        <mesh ref={earth} renderOrder={920}>
          <sphereGeometry args={[EARTH_RADIUS, 96, 96]} />
          <shaderMaterial ref={earthMaterial} vertexShader={TEXTURED_VERT} fragmentShader={EARTH_TEX_FRAG} uniforms={uniforms.earth} transparent />
        </mesh>
        <mesh ref={air} scale={1.045} renderOrder={921}>
          <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
          <shaderMaterial vertexShader={SURFACE_VERT} fragmentShader={AIR_FRAG} uniforms={uniforms.air} side={THREE.BackSide} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
        </group>
      </group>

      <sprite ref={homeMarker} scale={0.018} renderOrder={930} visible={false}>
        <spriteMaterial map={glow} color="#ffe6b0" transparent opacity={0} sizeAttenuation={false} depthTest={false} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </>
  );
}
