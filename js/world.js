/* ============================================================================
   world.js — brk.sys · el mundo 3D que se recorre con el scroll
   ----------------------------------------------------------------------------
   Una única escena WebGL fija detrás del contenido. La cámara vuela por una
   spline (CatmullRom) cuyos puntos de control son "keyframes" asociados a cada
   sección de la página. El scroll decide en qué punto de la ruta estamos.

   Zonas del mundo (eje -Z):
     z =    0  Núcleo de sistemas (hero)
     z ≈  -60  Ciudad de datos — infraestructura (perfil)
     z ≈ -130  Constelaciones: Infra · Seguridad · Software (stack)
     z ≈ -170…-240  Monolitos con capturas reales (proyectos)
     z ≈ -260…-335  Túnel de portales (experiencia)
     z ≈ -354  Colmena hexagonal (formación)
     vista aérea final (contacto)
   ========================================================================== */
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const LIME  = new THREE.Color("#C6F24E");
const BLUE  = new THREE.Color("#6FA8FF");
const STEEL = new THREE.Color("#2B3644");
const WHITE = new THREE.Color("#E6EDF5");
const BG    = new THREE.Color("#05070A");

/* ----------------------------------------------------------- GLSL helpers */
const FOG_V = /* glsl */`varying float vFogDepth;`;
const FOG_F = /* glsl */`
  uniform vec3 uFogColor; uniform float uFogNear; uniform float uFogFar;
  varying float vFogDepth;
  float fogF(){ return smoothstep(uFogNear, uFogFar, vFogDepth); }
`;

const rand = (a, b) => a + Math.random() * (b - a);
const glow = (c, k) => c.clone().multiplyScalar(k);   // >1 → lo recoge el bloom

/* ======================================================================== */
export function createWorld(canvas, { mobile = false, images = [] } = {}) {
  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: !mobile, alpha: false, powerPreference: "high-performance"
  });
  renderer.setClearColor(BG, 1);
  renderer.toneMapping = THREE.NoToneMapping;
  const PR = Math.min(window.devicePixelRatio || 1, mobile ? 1.75 : 1.5);
  renderer.setPixelRatio(PR);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(BG, 20, 90);

  const camera = new THREE.PerspectiveCamera(mobile ? 62 : 50, 1, 0.1, 900);

  /* Uniforms compartidos (mismas referencias en todos los shaders) */
  const U = {
    uTime:     { value: 0 },
    uFogColor: { value: BG },
    uFogNear:  { value: 20 },
    uFogFar:   { value: 90 },
    uPR:       { value: PR },
    uLime:     { value: LIME },
    uSteel:    { value: STEEL }
  };

  /* Animaciones por frame que registra cada zona */
  const tickers = [];

  scene.add(new THREE.AmbientLight(0xffffff, 0.25));

  buildStars();
  buildFloor();
  const core = buildCore();
  buildCity();
  buildClusters();
  const monoliths = buildMonoliths();
  const gates = buildTunnel();
  buildHive();

  /* ------------------------------------------------------ Postproceso */
  let composer = null, bloom = null;
  if (!mobile) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    // Radio bajo: el brillo se queda pegado a las fuentes de luz. Con radios
    // altos los mips más difusos convierten todas las aristas en una neblina gris.
    bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.8, 0.08, 0.9);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    // En la ruta con render target el color de limpieza acaba codificado a sRGB
    // dos veces (#05070A se vería como #262E38). Negro puro evita la neblina gris.
    renderer.setClearColor(0x000000, 1);
  }

  /* ------------------------------------------------------ Ruta de cámara */
  const K = keyframes(mobile);
  const posCurve = new THREE.CatmullRomCurve3(K.map(k => k.p), false, "catmullrom", 0.5);
  const tgtCurve = new THREE.CatmullRomCurve3(K.map(k => k.t), false, "catmullrom", 0.5);
  const FOG_FAR = [75, 80, 85, 70, 70, 70, 62, 62, 300];
  const SEG = K.length - 1;

  const state = {
    target: 0, current: 0,                     // progreso en [0, SEG]
    pointer: new THREE.Vector2(), pointerS: new THREE.Vector2(),
    intro: 0, introStart: -1, running: false
  };
  const introFrom = new THREE.Vector3(0, 34, 110);
  const tmpP = new THREE.Vector3(), tmpT = new THREE.Vector3();

  function placeCamera(dt) {
    state.current += (state.target - state.current) * (1 - Math.exp(-dt * 4.2));
    const u = THREE.MathUtils.clamp(state.current / SEG, 0, 1);
    posCurve.getPoint(u, tmpP);
    tgtCurve.getPoint(u, tmpT);

    // Entrada: caída desde el espacio hasta el núcleo
    if (state.intro < 1) {
      const e = 1 - Math.pow(1 - state.intro, 4);
      tmpP.lerpVectors(introFrom, tmpP, e);
    }

    // Parallax del puntero (suavizado)
    state.pointerS.lerp(state.pointer, 1 - Math.exp(-dt * 3));
    const amp = mobile ? 0 : 0.9;
    tmpP.x += state.pointerS.x * amp;
    tmpP.y += -state.pointerS.y * amp * 0.55;

    camera.position.copy(tmpP);
    camera.lookAt(tmpT);

    // Niebla: se abre en la vista aérea final
    const i = Math.min(Math.floor(state.current), SEG - 1);
    const f = THREE.MathUtils.smoothstep(state.current - i, 0, 1);
    const far = THREE.MathUtils.lerp(FOG_FAR[i], FOG_FAR[i + 1], f);
    scene.fog.far = U.uFogFar.value = far;
    scene.fog.near = U.uFogNear.value = far * 0.22;
  }

  /* ------------------------------------------------------ Bucle */
  const clock = new THREE.Clock();
  let raf = 0;
  function frame() {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    U.uTime.value = t;

    if (state.intro < 1 && state.introStart >= 0) {
      state.intro = Math.min(1, (t - state.introStart) / 3.4);
    }
    placeCamera(dt);
    for (const fn of tickers) fn(t, dt);

    if (composer) composer.render(); else renderer.render(scene, camera);
  }

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (composer) { composer.setSize(w, h); bloom.setSize(w, h); }
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  // Pausa con la pestaña oculta; al volver se descarta el hueco de tiempo
  // (sin reiniciar el reloj, para no romper la intro ni los shaders)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { cancelAnimationFrame(raf); state.running = false; }
    else if (!state.running) { state.running = true; clock.getDelta(); frame(); }
  });

  /* Primer frame para que el boot sepa que todo compila */
  placeCamera(1);
  if (composer) composer.render(); else renderer.render(scene, camera);

  return {
    sceneCount: K.length,
    start() { if (!state.running) { state.running = true; clock.getDelta(); frame(); } },
    intro() { state.introStart = clock.elapsedTime; },
    skipIntro() { state.intro = 1; },
    setProgress(v) { state.target = THREE.MathUtils.clamp(v, 0, SEG); },
    setPointer(x, y) { state.pointer.set(x, y); },
    getCamera() { return camera.position; }
  };

  /* ===================================================================== */
  /*  ZONAS                                                                 */
  /* ===================================================================== */

  /* ---------------------------------------------------------- Estrellas */
  function buildStars() {
    const N = mobile ? 1400 : 3000;
    const pos = new Float32Array(N * 3), size = new Float32Array(N), seed = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      pos[i * 3]     = rand(-320, 320);
      pos[i * 3 + 1] = rand(-40, 240);
      pos[i * 3 + 2] = rand(140, -620);
      size[i] = Math.random() < 0.06 ? rand(2.4, 3.6) : rand(0.6, 1.8);
      seed[i] = Math.random() * 10;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    const m = new THREE.ShaderMaterial({
      uniforms: { uTime: U.uTime, uPR: U.uPR, uLime: U.uLime },
      vertexShader: /* glsl */`
        attribute float aSize; attribute float aSeed;
        uniform float uPR; uniform float uTime;
        varying float vSeed; varying float vTw;
        void main(){
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vSeed = aSeed;
          vTw = 0.55 + 0.45 * sin(uTime * (0.6 + fract(aSeed) * 1.8) + aSeed * 6.0);
          gl_PointSize = clamp(aSize * uPR * (260.0 / -mv.z), 1.0, 9.0);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */`
        uniform vec3 uLime; varying float vSeed; varying float vTw;
        void main(){
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d);
          vec3 c = mix(vec3(0.85, 0.9, 1.0), uLime, step(8.8, vSeed));
          gl_FragColor = vec4(c * a * vTw * 1.05, 1.0);
        }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });
    const stars = new THREE.Points(g, m);
    stars.frustumCulled = false;
    scene.add(stars);
    tickers.push((t) => { stars.rotation.z = Math.sin(t * 0.02) * 0.02; });
  }

  /* ---------------------------------------------------------- Suelo / rejilla */
  function buildFloor() {
    const g = new THREE.PlaneGeometry(900, 1100).rotateX(-Math.PI / 2);
    const m = new THREE.ShaderMaterial({
      uniforms: { ...pick("uTime", "uLime", "uSteel", "uFogColor", "uFogNear", "uFogFar") },
      vertexShader: /* glsl */`
        varying vec3 vWorld; ${FOG_V}
        void main(){
          vec4 w = modelMatrix * vec4(position, 1.0);
          vWorld = w.xyz;
          vec4 mv = viewMatrix * w;
          vFogDepth = -mv.z;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */`
        uniform float uTime; uniform vec3 uLime; uniform vec3 uSteel;
        varying vec3 vWorld; ${FOG_F}
        float gridLine(vec2 p, float s){
          vec2 c = p / s;
          vec2 fw = fwidth(c);
          vec2 g = abs(fract(c - 0.5) - 0.5) / fw;
          float line = 1.0 - min(min(g.x, g.y), 1.0);
          // En la distancia las líneas se juntan (moiré): se desvanecen
          return line * (1.0 - smoothstep(0.15, 0.6, max(fw.x, fw.y)));
        }
        void main(){
          vec2 p = vWorld.xz;
          float minor = gridLine(p, 4.0);
          float major = gridLine(p, 20.0);
          // Pulso que emana del núcleo, como un ping de red
          float r = length(p);
          float pulse = exp(-pow(r - mod(uTime * 16.0, 260.0), 2.0) * 0.02);
          vec3 col = uSteel * 1.2 * minor * 0.45
                   + uLime * major * 0.12
                   + uLime * pulse * (minor * 0.9 + major * 0.6 + 0.02);
          gl_FragColor = vec4(col * (1.0 - fogF()), 1.0);
        }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });
    const floor = new THREE.Mesh(g, m);
    floor.position.set(0, -6, -260);
    scene.add(floor);
  }

  /* ---------------------------------------------------------- Núcleo */
  function buildCore() {
    const group = new THREE.Group();
    scene.add(group);

    // Placas blindadas: icosaedro "explotado" con huecos que dejan ver la energía
    const plates = new THREE.Mesh(platedGeometry(1.4, 1), new THREE.MeshStandardMaterial({
      color: "#121821", metalness: 0.88, roughness: 0.3, flatShading: true,
      emissive: LIME, emissiveIntensity: 0.025
    }));
    group.add(plates);

    // Energía interior
    const energy = new THREE.Mesh(new THREE.IcosahedronGeometry(1.0, 3),
      new THREE.MeshBasicMaterial({ color: glow(LIME, 1.25) }));
    group.add(energy);

    // Atmósfera fresnel
    const halo = new THREE.Mesh(new THREE.SphereGeometry(1.85, 48, 48), fresnelMaterial(LIME, 3.2, 0.85));
    group.add(halo);

    // Coraza alámbrica
    const shell = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2.35, 1)),
      new THREE.LineBasicMaterial({ color: glow(LIME, 0.9), transparent: true, opacity: 0.32 }));
    group.add(shell);

    // Anillos orbitales con satélites
    const rings = [
      { r: 3.25, c: glow(LIME, 1.6),  tilt: [1.2, 0.2, 0],   s: 0.22 },
      { r: 3.95, c: glow(BLUE, 1.25), tilt: [0.4, 0.9, 0.3], s: -0.15 },
      { r: 4.75, c: glow(WHITE, 0.55), tilt: [1.9, -0.5, 0.6], s: 0.1 }
    ].map(({ r, c, tilt, s }) => {
      const pivot = new THREE.Group();
      pivot.rotation.set(...tilt);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.014, 8, 220),
        new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.85 }));
      pivot.add(ring);
      const sat = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), new THREE.MeshBasicMaterial({ color: glow(c, 1.6) }));
      sat.position.x = r;
      ring.add(sat);
      group.add(pivot);
      return { ring, s };
    });

    // Red de nodos alrededor del núcleo
    const NODES = mobile ? 26 : 40, R = 6.6;
    const nodes = fibonacciSphere(NODES, R);
    const net = connectNeighbours(nodes, 2);
    const netLines = new THREE.LineSegments(net, new THREE.LineBasicMaterial({
      color: glow(STEEL, 2.2), transparent: true, opacity: 0.55 }));
    group.add(netLines);
    const nodePts = spritePoints(nodes, (i) => (i % 5 === 0 ? 2.6 : 1.4), (i) => (i % 5 === 0 ? LIME : BLUE));
    group.add(nodePts);

    // Luces cinematográficas
    const key = new THREE.PointLight(LIME, 40, 40); key.position.set(4, 3, 5); scene.add(key);
    const rim = new THREE.PointLight(BLUE, 30, 40); rim.position.set(-6, -2, 3); scene.add(rim);

    tickers.push((t, dt) => {
      plates.rotation.y += dt * 0.12;
      plates.rotation.x += dt * 0.05;
      energy.scale.setScalar(1 + Math.sin(t * 2.2) * 0.035);
      shell.rotation.y -= dt * 0.08;
      shell.rotation.z += dt * 0.03;
      rings.forEach(({ ring, s }) => { ring.rotation.z += dt * s * 2; });
      netLines.rotation.y = nodePts.rotation.y = t * 0.03;
      group.position.y = Math.sin(t * 0.7) * 0.12;
    });
    return group;
  }

  /* ---------------------------------------------------------- Ciudad de datos */
  function buildCity() {
    const cells = [];
    const step = mobile ? 5 : 4;
    for (let x = -46; x <= 46; x += step) {
      if (Math.abs(x) < 7) continue;                         // avenida central libre
      for (let z = -34; z >= -96; z -= step) {
        if (Math.random() < 0.16) continue;
        cells.push([x + rand(-0.4, 0.4), z + rand(-0.4, 0.4)]);
      }
    }
    const N = cells.length;
    const geo = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
    const accent = new Float32Array(N), seed = new Float32Array(N);
    const mat = new THREE.ShaderMaterial({
      uniforms: { ...pick("uTime", "uLime", "uSteel", "uFogColor", "uFogNear", "uFogFar") },
      vertexShader: /* glsl */`
        attribute float aAccent; attribute float aSeed;
        varying vec3 vLocal; varying vec3 vScale; varying vec3 vN;
        varying float vAccent; varying float vSeed; ${FOG_V}
        void main(){
          vec3 s = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
          vScale = s; vLocal = position * s; vN = normal;
          vAccent = aAccent; vSeed = aSeed;
          vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
          vFogDepth = -mv.z;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */`
        uniform float uTime; uniform vec3 uLime; uniform vec3 uSteel;
        varying vec3 vLocal; varying vec3 vScale; varying vec3 vN;
        varying float vAccent; varying float vSeed; ${FOG_F}
        float hash(float n){ return fract(sin(n) * 43758.5453); }
        void main(){
          vec3 hs = vScale * 0.5;
          float w = 0.055;
          float ex = 1.0 - smoothstep(0.0, w, hs.x - abs(vLocal.x));
          float ez = 1.0 - smoothstep(0.0, w, hs.z - abs(vLocal.z));
          float ey = 1.0 - smoothstep(0.0, w, min(vLocal.y, vScale.y - vLocal.y));
          float edge = max(max(ex * ez, ex * ey), ez * ey);

          // Colores en espacio lineal (el OutputPass convierte a sRGB)
          float h = vLocal.y / max(vScale.y, 1.0);
          vec3 col = mix(vec3(0.0016, 0.0021, 0.003), vec3(0.0045, 0.0058, 0.0078), h);

          // "Ventanas": filas de luz tenue en las caras laterales
          float side = 1.0 - abs(vN.y);
          float rowId = floor(vLocal.y * 1.25);
          float row = step(0.55, fract(vLocal.y * 1.25)) * step(0.45, fract((vLocal.x + vLocal.z) * 1.6));
          float lit = step(0.8, hash(rowId * 12.9898 + vSeed * 78.233));
          col += side * row * lit * 0.05 * mix(vec3(0.2, 0.36, 0.7), uLime, vAccent);

          // Banda de escaneo que sube por las torres de acento
          float y = mod(uTime * 4.5 + vSeed * 40.0, vScale.y + 8.0) - 4.0;
          float band = vAccent * exp(-pow(vLocal.y - y, 2.0) * 1.4);

          vec3 edgeCol = mix(uSteel * 1.9, uLime * 1.5, vAccent);
          col += edgeCol * edge + uLime * band * 0.9;

          col = mix(col, uFogColor, fogF());
          gl_FragColor = vec4(col, 1.0);
        }`
    });
    const city = new THREE.InstancedMesh(geo, mat, N);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), p = new THREE.Vector3();
    const tops = [];
    cells.forEach(([x, z], i) => {
      const near = 1 - Math.min(Math.abs(x) / 46, 1);          // más altas cerca de la avenida
      const h = 1.5 + Math.pow(Math.random(), 2.1) * (10 + near * 16);
      const w = rand(2.0, step - 0.7), d = rand(2.0, step - 0.7);
      p.set(x, -6, z); sc.set(w, h, d);
      m4.compose(p, q, sc);
      city.setMatrixAt(i, m4);
      accent[i] = Math.random() < 0.14 ? 1 : 0;
      seed[i] = Math.random();
      if (accent[i] && h > 8) tops.push([x, -6 + h, z]);
    });
    geo.setAttribute("aAccent", new THREE.InstancedBufferAttribute(accent, 1));
    geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seed, 1));
    city.frustumCulled = false;
    scene.add(city);

    // Haces verticales desde las torres de acento
    const beamGeo = new THREE.CylinderGeometry(0.045, 0.045, 90, 6, 1, true).translate(0, 45, 0);
    const beams = tops.slice(0, mobile ? 5 : 11).map(([x, y, z]) => {
      const b = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({
        color: glow(LIME, 1.4), transparent: true, opacity: 0.4,
        blending: THREE.AdditiveBlending, depthWrite: false }));
      b.position.set(x, y, z);
      scene.add(b);
      return b;
    });

    // Paquetes de datos circulando por las calles
    const P = mobile ? 90 : 220;
    const start = new Float32Array(P * 3), dir = new Float32Array(P * 3), meta = new Float32Array(P * 3);
    for (let i = 0; i < P; i++) {
      const alongZ = Math.random() < 0.6;
      if (alongZ) {
        const lane = (Math.random() < 0.5 ? -1 : 1) * rand(1.5, 5.5);
        start.set([lane, -5.7, -100], i * 3); dir.set([0, 0, 1], i * 3);
        meta.set([70, rand(6, 16), rand(0, 70)], i * 3);
      } else {
        const zLane = -36 - Math.floor(Math.random() * 15) * 4 - 2;
        start.set([-48, -5.7, zLane], i * 3); dir.set([1, 0, 0], i * 3);
        meta.set([96, rand(5, 12), rand(0, 96)], i * 3);
      }
    }
    const pg = new THREE.BufferGeometry();
    pg.setAttribute("position", new THREE.BufferAttribute(start, 3));
    pg.setAttribute("aDir", new THREE.BufferAttribute(dir, 3));
    pg.setAttribute("aMeta", new THREE.BufferAttribute(meta, 3));
    const packets = new THREE.Points(pg, new THREE.ShaderMaterial({
      uniforms: { ...pick("uTime", "uPR", "uLime", "uFogColor", "uFogNear", "uFogFar") },
      vertexShader: /* glsl */`
        attribute vec3 aDir; attribute vec3 aMeta;
        uniform float uTime; uniform float uPR;
        varying float vFade; ${FOG_V}
        void main(){
          float d = mod(uTime * aMeta.y + aMeta.z, aMeta.x);
          vec3 p = position + aDir * d;
          vFade = smoothstep(0.0, 6.0, d) * smoothstep(aMeta.x, aMeta.x - 6.0, d);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vFogDepth = -mv.z;
          gl_PointSize = clamp(3.2 * uPR * (60.0 / -mv.z), 1.0, 8.0);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */`
        uniform vec3 uLime; varying float vFade; ${FOG_F}
        void main(){
          float a = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5));
          gl_FragColor = vec4(uLime * 1.8 * a * vFade * (1.0 - fogF()), 1.0);
        }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    }));
    packets.frustumCulled = false;
    scene.add(packets);

    tickers.push((t) => {
      beams.forEach((b, i) => { b.material.opacity = 0.18 + 0.28 * (0.5 + 0.5 * Math.sin(t * 1.7 + i * 1.3)); });
    });
  }

  /* ---------------------------------------------------------- Constelaciones del stack */
  function buildClusters() {
    const S = new THREE.Vector3(0, 2, -130);
    const defs = [
      { at: new THREE.Vector3(-11.5, -0.5, 4),  color: BLUE,  shape: "box" },     // Infraestructura
      { at: new THREE.Vector3(0, 7.5, -10),     color: LIME,  shape: "octa" },    // Seguridad
      { at: new THREE.Vector3(11.5, -0.5, 4),   color: WHITE, shape: "knot" }     // Software
    ];
    const centers = [];
    const orbiters = [];
    defs.forEach((d, idx) => {
      const g = new THREE.Group();
      g.position.copy(S).add(d.at);
      scene.add(g);
      centers.push(g.position.clone());

      let shape;
      if (d.shape === "box") {
        shape = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.6, 2.6, 2.6, 2, 2, 2)),
          new THREE.LineBasicMaterial({ color: glow(d.color, 1.6) }));
      } else if (d.shape === "octa") {
        shape = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.OctahedronGeometry(2.1, 0)),
          new THREE.LineBasicMaterial({ color: glow(d.color, 1.7) }));
      } else {
        shape = new THREE.Mesh(new THREE.TorusKnotGeometry(1.15, 0.3, 120, 12),
          new THREE.MeshBasicMaterial({ color: glow(d.color, 0.9), wireframe: true, transparent: true, opacity: 0.45 }));
      }
      g.add(shape);
      g.add(new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 24), new THREE.MeshBasicMaterial({ color: glow(d.color, 2) })));
      g.add(new THREE.Mesh(new THREE.SphereGeometry(1.35, 32, 32), fresnelMaterial(d.color, 2.2, 1.1)));

      const halo = new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.01, 6, 160),
        new THREE.MeshBasicMaterial({ color: glow(d.color, 0.8), transparent: true, opacity: 0.6 }));
      halo.rotation.x = Math.PI / 2 + 0.3;
      g.add(halo);

      // Satélites (módulos) en órbita
      const C = mobile ? 18 : 34;
      const inst = new THREE.InstancedMesh(new THREE.BoxGeometry(0.13, 0.13, 0.13),
        new THREE.MeshBasicMaterial({ color: glow(d.color, 1.5) }), C);
      const orb = Array.from({ length: C }, () => ({
        r: rand(2.6, 4.4), a: rand(0, Math.PI * 2), s: rand(0.25, 0.7) * (Math.random() < 0.5 ? -1 : 1),
        tilt: rand(-0.6, 0.6), y: rand(-0.5, 0.5)
      }));
      g.add(inst);
      orbiters.push({ inst, orb, shape, idx });
    });

    // Enlaces de energía entre las tres disciplinas
    const pairs = [[0, 1], [1, 2], [2, 0]];
    pairs.forEach(([a, b], k) => {
      const A = centers[a], B = centers[b];
      const mid = A.clone().lerp(B, 0.5).add(new THREE.Vector3(0, 3.5, 0));
      const pts = new THREE.QuadraticBezierCurve3(A, mid, B).getPoints(120);
      const g = new THREE.BufferGeometry().setFromPoints(pts);
      g.setAttribute("aT", new THREE.BufferAttribute(new Float32Array(pts.map((_, i) => i / (pts.length - 1))), 1));
      scene.add(new THREE.Line(g, new THREE.ShaderMaterial({
        uniforms: { ...pick("uTime", "uLime"), uK: { value: k } },
        vertexShader: `attribute float aT; varying float vT; void main(){ vT = aT; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: /* glsl */`
          uniform float uTime; uniform vec3 uLime; uniform float uK; varying float vT;
          void main(){
            float p = smoothstep(0.86, 1.0, fract(vT * 2.0 - uTime * 0.45 - uK * 0.33));
            gl_FragColor = vec4(uLime * (0.12 + p * 2.2), 1.0);
          }`,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
      })));
    });

    const m4 = new THREE.Matrix4(), v = new THREE.Vector3(), q = new THREE.Quaternion(), one = new THREE.Vector3(1, 1, 1);
    tickers.push((t, dt) => {
      orbiters.forEach(({ inst, orb, shape, idx }) => {
        shape.rotation.y += dt * (0.25 + idx * 0.05);
        shape.rotation.x += dt * 0.11;
        orb.forEach((o, i) => {
          const a = o.a + t * o.s;
          v.set(Math.cos(a) * o.r, Math.sin(a) * o.r * o.tilt + o.y, Math.sin(a) * o.r);
          q.setFromAxisAngle(one, t * o.s * 2);
          m4.compose(v, q, one);
          inst.setMatrixAt(i, m4);
        });
        inst.instanceMatrix.needsUpdate = true;
      });
    });
  }

  /* ---------------------------------------------------------- Monolitos de proyectos */
  function buildMonoliths() {
    const spots = [
      new THREE.Vector3(-6.5, 1.6, -170),
      new THREE.Vector3(6.5, 1.6, -206),
      new THREE.Vector3(-6.5, 1.6, -242)
    ];
    const loader = new THREE.TextureLoader();
    const BOX_W = 9.6, BOX_H = 6;
    return spots.map((P, i) => {
      const g = new THREE.Group();
      g.position.copy(P);
      g.rotation.y = mobile ? 0 : (P.x < 0 ? 0.38 : -0.38);
      scene.add(g);

      const frameBack = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: "#0A0E13" }));
      frameBack.position.z = -0.03;
      g.add(frameBack);

      const imgMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.86, 0.86, 0.86), transparent: true, opacity: 0 });
      const img = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), imgMat);
      g.add(img);

      const scan = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({
        uniforms: { ...pick("uTime", "uLime"), uSeed: { value: i * 0.37 } },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: /* glsl */`
          uniform float uTime; uniform vec3 uLime; uniform float uSeed; varying vec2 vUv;
          void main(){
            float y = fract(-uTime * 0.11 + uSeed);
            float band = exp(-pow((vUv.y - y) * 26.0, 2.0));
            float lines = step(0.5, fract(vUv.y * 220.0)) * 0.018;
            gl_FragColor = vec4(uLime * (band * 0.16 + lines), 1.0);
          }`,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
      }));
      scan.position.z = 0.01;
      g.add(scan);

      const frameLines = new THREE.Group();
      g.add(frameLines);

      // Pilar de luz hasta el suelo
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1, 6, 1, true),
        new THREE.MeshBasicMaterial({ color: glow(LIME, 1.2), transparent: true, opacity: 0.45 }));
      g.add(pillar);

      function layout(aspect) {
        let w = BOX_W, h = BOX_W / aspect;
        if (h > BOX_H) { h = BOX_H; w = h * aspect; }
        img.scale.set(w, h, 1); scan.scale.set(w, h, 1);
        frameBack.scale.set(w + 0.5, h + 0.5, 1);
        frameLines.clear();
        frameLines.add(rectLines(w + 0.5, h + 0.5, glow(STEEL, 2.4), 0.9));
        frameLines.add(cornerBrackets(w + 0.9, h + 0.9, 0.9, glow(LIME, 1.9)));
        // Pilar desde el borde inferior del marco hasta el suelo (y = -6 en el mundo)
        const bottom = -(h / 2 + 0.25), floorY = -6 - P.y;
        const len = Math.max(0.1, bottom - floorY);
        pillar.scale.y = len;
        pillar.position.y = bottom - len / 2;
      }
      layout(16 / 9);

      if (images[i]) {
        loader.load(images[i], (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
          imgMat.map = tex; imgMat.needsUpdate = true;
          layout(tex.image.width / tex.image.height);
          const t0 = performance.now();
          const fade = () => {
            imgMat.opacity = Math.min(1, (performance.now() - t0) / 900);
            if (imgMat.opacity < 1) requestAnimationFrame(fade);
          };
          fade();
        });
      }

      const baseY = P.y;
      tickers.push((t) => { g.position.y = baseY + Math.sin(t * 0.8 + i * 2) * 0.18; });
      return g;
    });
  }

  /* ---------------------------------------------------------- Túnel de portales */
  function buildTunnel() {
    const GATES = 8, Z0 = -262, GAP = 10;
    const gates = [];
    for (let i = 0; i < GATES; i++) {
      const z = Z0 - i * GAP;
      const g = new THREE.Group();
      g.position.set(0, 0, z);
      scene.add(g);
      const mat = new THREE.MeshBasicMaterial({ color: glow(STEEL, 2.4) });
      g.add(new THREE.Mesh(new THREE.TorusGeometry(2.7, 0.04, 8, 120), mat));
      // Arcos segmentados exteriores
      const arcMat = new THREE.MeshBasicMaterial({ color: glow(STEEL, 1.8), transparent: true, opacity: 0.8 });
      for (let k = 0; k < 4; k++) {
        const arc = new THREE.Mesh(new THREE.TorusGeometry(3.15, 0.022, 6, 40, Math.PI / 3), arcMat);
        arc.rotation.z = k * Math.PI / 2 + i * 0.4;
        g.add(arc);
      }
      gates.push({ g, mat, arcMat, z });
    }

    // Partículas de velocidad dentro del túnel
    const N = mobile ? 160 : 380;
    const pos = new Float32Array(N * 3), sp = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2, r = rand(0.5, 2.4);
      pos.set([Math.cos(a) * r, Math.sin(a) * r, rand(0, 90)], i * 3);
      sp[i] = rand(6, 18);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSpeed", new THREE.BufferAttribute(sp, 1));
    const streaks = new THREE.Points(g, new THREE.ShaderMaterial({
      uniforms: { ...pick("uTime", "uPR", "uLime", "uFogColor", "uFogNear", "uFogFar") },
      vertexShader: /* glsl */`
        attribute float aSpeed; uniform float uTime; uniform float uPR; ${FOG_V}
        void main(){
          vec3 p = position;
          p.z = -345.0 + mod(p.z + uTime * aSpeed, 90.0);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vFogDepth = -mv.z;
          gl_PointSize = clamp(2.2 * uPR * (40.0 / -mv.z), 1.0, 6.0);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */`
        uniform vec3 uLime; ${FOG_F}
        void main(){
          float a = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5));
          gl_FragColor = vec4(mix(vec3(0.7, 0.8, 1.0), uLime, 0.6) * a * 1.3 * (1.0 - fogF()), 1.0);
        }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    }));
    streaks.frustumCulled = false;
    scene.add(streaks);

    // Raíl de luz bajo el túnel
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 90),
      new THREE.MeshBasicMaterial({ color: glow(LIME, 1.3) }));
    rail.position.set(0, -2.9, -300);
    scene.add(rail);

    const steel = glow(STEEL, 2.4), lime = glow(LIME, 1.45), c = new THREE.Color();
    tickers.push((t, dt) => {
      const cz = camera.position.z;
      gates.forEach(({ g, mat, arcMat, z }, i) => {
        // El portal se enciende cuando la cámara se acerca y lo cruza
        const lit = THREE.MathUtils.smoothstep(z + 22, z + 3, cz);
        c.copy(steel).lerp(lime, lit);
        mat.color.copy(c);
        arcMat.color.copy(c).multiplyScalar(0.8);
        g.rotation.z += dt * (i % 2 ? 0.12 : -0.12);
      });
    });
    return gates;
  }

  /* ---------------------------------------------------------- Colmena de formación */
  function buildHive() {
    const H = new THREE.Vector3(0, 1.4, -356);
    const group = new THREE.Group();
    group.position.copy(H);
    scene.add(group);
    // Estados reales: 3 formaciones académicas · 2 cursos completados · 2 en curso · 1 objetivo
    const tiles = [
      [0, 0, "done"], [1, 0, "done"], [-1, 0, "academic"], [0, 1, "academic"],
      [0, -1, "academic"], [1, -1, "progress"], [-1, 1, "progress"], [2, -1, "planned"]
    ];
    const geo = new THREE.CylinderGeometry(0.93, 0.93, 0.16, 6).rotateX(Math.PI / 2);
    const edges = new THREE.EdgesGeometry(geo);
    const style = {
      done:     { fill: glow(LIME, 0.32), edge: glow(LIME, 2.0) },
      academic: { fill: new THREE.Color("#101722"), edge: glow(BLUE, 1.3) },
      progress: { fill: new THREE.Color("#0B1016"), edge: glow(LIME, 1.3) },
      planned:  { fill: new THREE.Color("#0B1016"), edge: glow(STEEL, 2.0) }
    };
    const progress = [];
    tiles.forEach(([q, r, kind], i) => {
      const x = Math.sqrt(3) * (q + r / 2), y = 1.5 * r;
      const tg = new THREE.Group();
      tg.position.set(x, y, 0);
      tg.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: style[kind].fill })));
      const lines = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: style[kind].edge }));
      tg.add(lines);
      if (kind === "progress") progress.push(lines.material);
      tg.userData.phase = i;
      group.add(tg);
    });
    const halo = new THREE.Mesh(new THREE.TorusGeometry(5.2, 0.012, 6, 160),
      new THREE.MeshBasicMaterial({ color: glow(LIME, 0.9), transparent: true, opacity: 0.5 }));
    group.add(halo);

    tickers.push((t) => {
      group.rotation.z = Math.sin(t * 0.25) * 0.08;
      group.rotation.y = Math.sin(t * 0.18) * 0.12;
      group.children.forEach((c) => { if (c.userData.phase !== undefined) c.position.z = Math.sin(t * 1.1 + c.userData.phase) * 0.18; });
      progress.forEach((m) => m.color.copy(LIME).multiplyScalar(0.8 + 0.8 * (0.5 + 0.5 * Math.sin(t * 2.4))));
      halo.rotation.z = t * 0.1;
    });
  }

  /* ===================================================================== */
  /*  UTILIDADES                                                            */
  /* ===================================================================== */
  function pick(...keys) { const o = {}; keys.forEach(k => { o[k] = U[k]; }); return o; }

  function fresnelMaterial(color, power, intensity) {
    return new THREE.ShaderMaterial({
      uniforms: { uColor: { value: color.clone() }, uPow: { value: power }, uInt: { value: intensity } },
      vertexShader: /* glsl */`
        varying vec3 vN; varying vec3 vV;
        void main(){
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */`
        uniform vec3 uColor; uniform float uPow; uniform float uInt;
        varying vec3 vN; varying vec3 vV;
        void main(){
          float f = pow(1.0 - abs(dot(vN, vV)), uPow);
          gl_FragColor = vec4(uColor * f * uInt, 1.0);
        }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });
  }

  function spritePoints(vectors, sizeFn, colorFn) {
    const pos = new Float32Array(vectors.length * 3), size = new Float32Array(vectors.length), col = new Float32Array(vectors.length * 3);
    vectors.forEach((v, i) => { v.toArray(pos, i * 3); size[i] = sizeFn(i); colorFn(i).toArray(col, i * 3); });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    g.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    return new THREE.Points(g, new THREE.ShaderMaterial({
      uniforms: { uPR: U.uPR, uTime: U.uTime },
      vertexShader: /* glsl */`
        attribute float aSize; attribute vec3 aColor; uniform float uPR; uniform float uTime;
        varying vec3 vColor;
        void main(){
          vColor = aColor;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = clamp(aSize * uPR * (34.0 / -mv.z) * (0.85 + 0.15 * sin(uTime * 2.0 + position.x)), 1.0, 14.0);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */`
        varying vec3 vColor;
        void main(){
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.15, d);
          gl_FragColor = vec4(vColor * 2.0 * a, 1.0);
        }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    }));
  }
}

/* ------------------------------------------------------------- Keyframes */
function keyframes(mobile) {
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  if (mobile) {
    return [
      { p: V(0, 1.6, 17),     t: V(0, -5.2, 0) },        // 0 núcleo (arriba en pantalla)
      { p: V(2.5, 7, -22),    t: V(0, -2, -60) },        // 1 ciudad
      { p: V(0, 5, -100),     t: V(0, 3, -130) },        // 2 constelaciones
      { p: V(-2.4, 1.5, -154),t: V(-6.5, -1.2, -170) },  // 3 LivingLinked
      { p: V(2.4, 1.5, -190), t: V(6.5, -1.2, -206) },   // 4 Homelab
      { p: V(-2.4, 1.5, -226),t: V(-6.5, -1.2, -242) },  // 5 Ciberseguridad
      { p: V(0, 0.2, -250),   t: V(0, 0, -300) },        // 6 túnel
      { p: V(0, 0.6, -337),   t: V(0, -2.2, -356) },     // 7 colmena (arriba en pantalla)
      { p: V(30, 70, -150),   t: V(0, -4, -200) }        // 8 vista aérea
    ];
  }
  return [
    { p: V(-3.6, 0.3, 15.5),  t: V(-3.6, -1.3, 0) },     // 0 núcleo arriba a la derecha del titular
    { p: V(4, 7, -24),        t: V(-2, -2, -62) },       // 1 avenida de la ciudad
    { p: V(0, 6, -102),       t: V(0, 2.5, -130) },      // 2 constelaciones
    { p: V(2.6, 2.2, -158),   t: V(-4.3, 1.6, -170) },   // 3 LivingLinked (izq.)
    { p: V(-2.6, 2.2, -194),  t: V(4.3, 1.6, -206) },    // 4 Homelab (dcha.)
    { p: V(2.6, 2.2, -230),   t: V(-4.3, 1.6, -242) },   // 5 Ciberseguridad (izq.)
    { p: V(0, 0.2, -250),     t: V(0, 0, -300) },        // 6 entrada del túnel
    { p: V(-6.8, 0.9, -338),  t: V(-6.8, -1.2, -356) },  // 7 colmena (arriba a la dcha. del texto)
    { p: V(36, 68, -150),     t: V(0, -4, -195) }        // 8 vista aérea del mundo
  ];
}

/* ------------------------------------------------------------- Geometría */
function platedGeometry(radius, detail) {
  const src = new THREE.IcosahedronGeometry(radius, detail);
  const pos = src.attributes.position.array;
  const out = new Float32Array(pos.length);
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), cen = new THREE.Vector3(), push = new THREE.Vector3();
  for (let i = 0; i < pos.length; i += 9) {
    a.fromArray(pos, i); b.fromArray(pos, i + 3); c.fromArray(pos, i + 6);
    cen.copy(a).add(b).add(c).multiplyScalar(1 / 3);
    push.copy(cen).normalize().multiplyScalar(0.07);
    [a, b, c].forEach((v, k) => { v.sub(cen).multiplyScalar(0.83).add(cen).add(push).toArray(out, i + k * 3); });
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(out, 3));
  g.computeVertexNormals();
  return g;
}

function fibonacciSphere(n, r) {
  const out = [], golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2, rr = Math.sqrt(1 - y * y), th = golden * i;
    out.push(new THREE.Vector3(Math.cos(th) * rr * r, y * r, Math.sin(th) * rr * r));
  }
  return out;
}

function connectNeighbours(pts, k) {
  const arr = [];
  pts.forEach((p, i) => {
    pts.map((q, j) => [j, p.distanceTo(q)]).filter(([j]) => j !== i)
      .sort((x, y) => x[1] - y[1]).slice(0, k)
      .forEach(([j]) => { if (j > i) arr.push(p.x, p.y, p.z, pts[j].x, pts[j].y, pts[j].z); });
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
  return g;
}

function rectLines(w, h, color, opacity = 1) {
  const x = w / 2, y = h / 2;
  const g = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-x, -y, 0), new THREE.Vector3(x, -y, 0), new THREE.Vector3(x, -y, 0), new THREE.Vector3(x, y, 0),
    new THREE.Vector3(x, y, 0), new THREE.Vector3(-x, y, 0), new THREE.Vector3(-x, y, 0), new THREE.Vector3(-x, -y, 0)
  ]);
  return new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
}

function cornerBrackets(w, h, L, color) {
  const x = w / 2, y = h / 2, P = [];
  [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy]) => {
    P.push(sx * x, sy * y, 0, sx * (x - L), sy * y, 0);
    P.push(sx * x, sy * y, 0, sx * x, sy * (y - L), 0);
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
  return new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color }));
}
