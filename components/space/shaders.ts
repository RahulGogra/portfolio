/* Shader snippets shared by the cosmic objects. */

export const NOISE_GLSL = /* glsl */ `
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

export const SURFACE_VERT = /* glsl */ `
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

// Earth: oceans, continents, ice caps, drifting cloud, a glint of sunlight on the water, and a thin blue limb.
export const EARTH_FRAG = /* glsl */ `
  uniform vec3 uLightDir;
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying vec3 vObjPos;
  ${NOISE_GLSL}
  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(-vViewPos);
    vec3 l = normalize(uLightDir);
    vec3 p = normalize(vObjPos);

    float land = smoothstep(0.5, 0.57, fbm(p * 2.1 + 3.0));
    vec3 ocean = mix(vec3(0.004, 0.025, 0.14), vec3(0.01, 0.09, 0.3), fbm(p * 6.0));
    vec3 ground = mix(vec3(0.02, 0.11, 0.03), vec3(0.22, 0.17, 0.08), fbm(p * 5.0 + 7.0));
    vec3 surface = mix(ocean, ground, land);
    surface = mix(surface, vec3(0.85), smoothstep(0.9, 0.96, abs(p.y) + fbm(p * 4.0) * 0.1));

    float ndl = dot(n, l);
    float ndv = clamp(dot(n, v), 0.0, 1.0);
    float day = smoothstep(-0.15, 0.55, ndl);
    vec3 col = surface * (0.02 + 1.25 * day);

    float glint = pow(max(dot(reflect(-l, n), v), 0.0), 50.0) * (1.0 - land);
    col += vec3(1.0, 0.95, 0.85) * glint * 0.6;

    float cloud = smoothstep(0.5, 0.72, fbm(p * 3.6 + vec3(uTime * 0.012, 0.0, 5.0)));
    col = mix(col, vec3(0.03 + 1.05 * day), cloud * 0.82);

    col += vec3(0.2, 0.5, 1.0) * pow(1.0 - ndv, 2.6) * (0.12 + 0.88 * day);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

// The blue haze just outside Earth's edge.
export const AIR_FRAG = /* glsl */ `
  uniform vec3 uLightDir;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  void main() {
    vec3 n = normalize(vNormal);
    float depth = clamp(-dot(n, normalize(-vViewPos)), 0.0, 1.0);
    float glow = pow(smoothstep(0.0, 0.3, depth), 2.2);
    float lit = mix(0.08, 1.0, smoothstep(-0.3, 0.5, dot(n, normalize(uLightDir))));
    gl_FragColor = vec4(vec3(0.25, 0.55, 1.0), glow * lit * 0.55);
    #include <colorspace_fragment>
  }
`;

export const MOON_FRAG = /* glsl */ `
  uniform vec3 uLightDir;
  varying vec3 vNormal;
  varying vec3 vObjPos;
  ${NOISE_GLSL}
  void main() {
    vec3 p = normalize(vObjPos);
    float maria = smoothstep(0.42, 0.62, fbm(p * 2.4 + 1.0));
    vec3 albedo = mix(vec3(0.42), vec3(0.14), maria) * (0.85 + 0.3 * fbm(p * 14.0));
    float day = smoothstep(-0.1, 0.6, dot(normalize(vNormal), normalize(uLightDir)));
    gl_FragColor = vec4(albedo * (0.02 + 1.2 * day), 1.0);
    #include <colorspace_fragment>
  }
`;

export const SUN_FRAG = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPos;
  void main() {
    float ndv = clamp(dot(normalize(vNormal), normalize(-vViewPos)), 0.0, 1.0);
    gl_FragColor = vec4(mix(vec3(1.0, 0.55, 0.12), vec3(1.0, 0.97, 0.86), pow(ndv, 0.7)), 1.0);
    #include <colorspace_fragment>
  }
`;

export const DOTS_VERT = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  uniform float uPixelRatio;
  varying vec3 vColor;
  void main() {
    vColor = aColor;
    gl_PointSize = aSize * uPixelRatio;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const DOTS_FRAG = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  void main() {
    float disc = smoothstep(0.5, 0.08, length(gl_PointCoord - 0.5));
    gl_FragColor = vec4(vColor, disc * uOpacity);
    #include <colorspace_fragment>
  }
`;

/* ---------- Textured Earth and Moon ---------- */

export const TEXTURED_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewPos = mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

// Earth from real satellite maps: sunlit continents, city lights on the night side, sunlight glinting
// off the oceans, drifting cloud, and a blue rim of atmosphere.
export const EARTH_TEX_FRAG = /* glsl */ `
  uniform sampler2D uDay;
  uniform sampler2D uNight;
  uniform sampler2D uMaps; // r: height, g: roughness (low over water), b: cloud cover
  uniform vec3 uLightDir;
  uniform float uTime;
  uniform float uReady;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(-vViewPos);
    vec3 l = normalize(uLightDir);
    float ndl = dot(n, l);
    float ndv = clamp(dot(n, v), 0.0, 1.0);
    float day = smoothstep(-0.12, 0.22, ndl);

    vec3 surface = texture2D(uDay, vUv).rgb;
    vec3 lights = texture2D(uNight, vUv).rgb;
    float roughness = texture2D(uMaps, vUv).g;
    float cloud = smoothstep(0.15, 0.85, texture2D(uMaps, vUv + vec2(uTime * 0.0006, 0.0)).b);

    vec3 col = surface * (0.05 + 1.15 * max(ndl, 0.0)) * day;
    col += lights * vec3(1.0, 0.8, 0.52) * 2.0 * (1.0 - day) * (1.0 - cloud);

    vec3 h = normalize(l + v);
    float glint = pow(max(dot(n, h), 0.0), 70.0) * (1.0 - roughness) * day * (1.0 - cloud);
    col += vec3(1.0, 0.93, 0.8) * glint * 0.8;

    col = mix(col, vec3(0.02 + 1.05 * max(ndl, 0.0)), cloud * 0.85 * mix(0.15, 1.0, day));
    col += vec3(0.3, 0.6, 1.0) * pow(1.0 - ndv, 3.0) * smoothstep(-0.25, 0.5, ndl) * 0.9;

    // A plain dark globe until the maps arrive, so nothing pops.
    col = mix(vec3(0.01, 0.02, 0.05) + vec3(0.3, 0.6, 1.0) * pow(1.0 - ndv, 3.0) * 0.4, col, uReady);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

export const MOON_TEX_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uLightDir;
  uniform float uReady;
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vec3 albedo = mix(vec3(0.3), texture2D(uMap, vUv).rgb, uReady);
    float day = smoothstep(-0.05, 0.5, dot(normalize(vNormal), normalize(uLightDir)));
    gl_FragColor = vec4(albedo * (0.015 + 1.15 * day), 1.0);
    #include <colorspace_fragment>
  }
`;
