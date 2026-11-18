import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/*  Procedural helpers                                                 */
/* ------------------------------------------------------------------ */

// Deterministic PRNG so the scene looks identical on every load.
export function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function canvasTexture(
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function barkTexture(rand: () => number) {
  const tex = canvasTexture(512, 256, (ctx) => {
    ctx.fillStyle = "#5b3d29";
    ctx.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 260; i++) {
      const x = rand() * 512;
      const w = 2 + rand() * 7;
      const l = 30 + rand() * 50;
      ctx.fillStyle = `hsl(${22 + rand() * 10}, ${25 + rand() * 20}%, ${l * 0.45}%)`;
      ctx.globalAlpha = 0.55;
      ctx.fillRect(x, 0, w, 256);
    }
    ctx.globalAlpha = 0.35;
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = rand() > 0.5 ? "#2c1d13" : "#7c5a3e";
      ctx.fillRect(rand() * 512, rand() * 256, 1 + rand() * 3, 6 + rand() * 30);
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1);
  return tex;
}

export function ringsTexture() {
  return canvasTexture(256, 256, (ctx) => {
    const g = ctx.createRadialGradient(128, 128, 4, 128, 128, 128);
    g.addColorStop(0, "#d9b98c");
    g.addColorStop(1, "#b08455");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = "rgba(110,70,40,0.45)";
    for (let r = 8; r < 128; r += 7 + (r % 5)) {
      ctx.lineWidth = 1 + (r % 3) * 0.6;
      ctx.beginPath();
      ctx.arc(128, 128, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#4a3020";
    ctx.beginPath();
    ctx.arc(128, 128, 124, 0, Math.PI * 2);
    ctx.stroke();
  });
}

export function gillsTexture(base: string) {
  return canvasTexture(256, 256, (ctx) => {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = "rgba(90,60,40,0.35)";
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 120; i++) {
      const a = (i / 120) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(128 + Math.cos(a) * 30, 128 + Math.sin(a) * 30);
      ctx.lineTo(128 + Math.cos(a) * 128, 128 + Math.sin(a) * 128);
      ctx.stroke();
    }
  });
}

export function sporeSprite() {
  return canvasTexture(64, 64, (ctx) => {
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,248,225,1)");
    g.addColorStop(0.35, "rgba(255,236,190,0.55)");
    g.addColorStop(1, "rgba(255,236,190,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
  });
}

export type CapStyle = {
  cap: string;
  capTop: string;
  gills: string;
  stem: string;
  flat: number; // 0 = domed button, 1 = flat/open cap
  ring?: boolean; // veil ring on the stem
};

export const STYLES: Record<string, CapStyle> = {
  button: { cap: "#f3ece0", capTop: "#e2d6c2", gills: "#d9c3a5", stem: "#f4eee4", flat: 0.1, ring: true },
  chestnut: { cap: "#b98257", capTop: "#6e4329", gills: "#8a6a52", stem: "#efe5d6", flat: 0.45, ring: true },
  shiitake: { cap: "#8a5a3a", capTop: "#4f2f1c", gills: "#efe3cf", stem: "#e7dac6", flat: 0.6 },
  oyster: { cap: "#b9bcb4", capTop: "#7d847c", gills: "#efeee6", stem: "#ecebe3", flat: 0.9 },
};

export function buildMushroom(
  capRadius: number,
  stemHeight: number,
  style: CapStyle,
  gillTex: THREE.Texture,
  rand: () => number,
) {
  const group = new THREE.Group();
  const sr = capRadius * 0.28;

  // Stem — slightly flared base, organic taper
  const stemPts = [
    new THREE.Vector2(0.001, 0),
    new THREE.Vector2(sr * 1.35, 0),
    new THREE.Vector2(sr * 1.12, stemHeight * 0.12),
    new THREE.Vector2(sr * 1.0, stemHeight * 0.5),
    new THREE.Vector2(sr * 0.92, stemHeight * 0.92),
    new THREE.Vector2(sr * 0.98, stemHeight),
  ];
  const stemTex = stemTexture();
  const stem = new THREE.Mesh(
    new THREE.LatheGeometry(stemPts, 28),
    new THREE.MeshStandardMaterial({ color: style.stem, map: stemTex, bumpMap: stemTex, bumpScale: 0.6, roughness: 0.8 }),
  );
  stem.castShadow = true;
  stem.receiveShadow = true;
  group.add(stem);

  // Veil ring (annulus) on button-type mushrooms
  if (style.ring && stemHeight > capRadius * 0.6) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(sr * 1.02, sr * 0.16, 8, 24),
      new THREE.MeshStandardMaterial({ color: style.stem, roughness: 0.9 }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.scale.z = 0.6;
    ring.position.y = stemHeight * 0.72;
    group.add(ring);
  }

  // Cap — dome profile blended toward a flat, open cap
  const H = capRadius * (0.75 - style.flat * 0.45);
  const pts: THREE.Vector2[] = [new THREE.Vector2(capRadius * 0.84, -H * 0.12)];
  pts.push(new THREE.Vector2(capRadius * 0.97, H * 0.02));
  const steps = 14;
  for (let i = 0; i <= steps; i++) {
    const phi = (Math.PI / 2) * (1 - i / steps) * 0.92;
    const x = capRadius * Math.sin(phi);
    const y = H * 0.08 + H * 0.92 * Math.pow(Math.cos(phi), 0.9 - style.flat * 0.4);
    pts.push(new THREE.Vector2(Math.max(x, 0.001), y));
  }
  const capGeo = new THREE.LatheGeometry(pts, 48);

  // Organic wobble + vertex colour gradient (darker on top)
  const pos = capGeo.attributes.position;
  const colors: number[] = [];
  const cBase = new THREE.Color(style.cap);
  const cTop = new THREE.Color(style.capTop);
  const wobA = rand() * 10;
  const tmp = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const ang = Math.atan2(z, x);
    const r = Math.hypot(x, z);
    const wob = 1 + 0.045 * Math.sin(ang * 5 + wobA) + 0.025 * Math.sin(ang * 11 + wobA * 2);
    const k = r / capRadius; // stronger at the rim
    pos.setX(i, x * (1 + (wob - 1) * k));
    pos.setZ(i, z * (1 + (wob - 1) * k));
    const t = THREE.MathUtils.clamp(1 - r / capRadius, 0, 1);
    tmp.copy(cBase).lerp(cTop, Math.pow(t, 1.4));
    colors.push(tmp.r, tmp.g, tmp.b);
    void y;
  }
  capGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  capGeo.computeVertexNormals();

  const cap = new THREE.Mesh(
    capGeo,
    new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      map: capSkinTexture(),
      bumpMap: capSkinTexture(),
      bumpScale: 0.5,
      roughness: 0.5,
      clearcoat: 0.15,
      clearcoatRoughness: 0.6,
      sheen: 0.6,
      sheenRoughness: 0.6,
      sheenColor: new THREE.Color("#fff6e6"),
      side: THREE.DoubleSide,
    }),
  );
  cap.position.y = stemHeight * 0.96;
  cap.castShadow = true;
  cap.receiveShadow = true;

  // Gills underneath
  const gills = new THREE.Mesh(
    new THREE.CircleGeometry(capRadius * 0.86, 48),
    new THREE.MeshStandardMaterial({ map: gillTex, color: style.gills, roughness: 0.95 }),
  );
  gills.rotation.x = Math.PI / 2;
  gills.position.y = -H * 0.1;
  cap.add(gills);

  group.add(cap);
  return group;
}

/* ------------------------------------------------------------------ */
/*  Extra helpers shared by the facility + product renders             */
/* ------------------------------------------------------------------ */

export function woodTexture(rand: () => number, base = "#c49a6c") {
  const tex = canvasTexture(512, 256, (ctx) => {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 70; i++) {
      const y = rand() * 256;
      ctx.strokeStyle = `rgba(${90 + rand() * 40},${55 + rand() * 25},${30 + rand() * 15},${0.12 + rand() * 0.2})`;
      ctx.lineWidth = 1 + rand() * 3;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= 512; x += 32) ctx.lineTo(x, y + Math.sin(x * 0.02 + i) * (2 + rand() * 4));
      ctx.stroke();
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** Grow-bag texture: substrate speckles under translucent plastic. */
export function bagTexture(rand: () => number, base = "#efe9dc", speck = "#b89a6a") {
  const tex = canvasTexture(256, 256, (ctx) => {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = speck;
      ctx.globalAlpha = 0.15 + rand() * 0.35;
      ctx.fillRect(rand() * 256, rand() * 256, 1 + rand() * 3, 1 + rand() * 2);
    }
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(40, 0, 18, 256);
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** Oyster mushrooms grow as overlapping fans from one base. */
export function buildOysterCluster(
  rand: () => number,
  gillTex: THREE.Texture,
  size = 0.4,
  count = 7,
  style: CapStyle = STYLES.oyster,
) {
  const g = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const s = size * (0.55 + rand() * 0.55) * (i === 0 ? 1.2 : 1);
    const m = buildMushroom(s, s * 0.55, style, gillTex, rand);
    const a = (i / count) * Math.PI * 2 + rand() * 0.4;
    const lift = (i % 3) * size * 0.22;
    m.position.set(Math.cos(a) * size * 0.12, lift, Math.sin(a) * size * 0.12);
    m.rotation.set(Math.sin(a) * 0.75, 0, -Math.cos(a) * 0.75);
    g.add(m);
  }
  return g;
}

export function disposeObject(root: THREE.Object3D) {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    mesh.geometry?.dispose();
    const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
    mats.forEach((m) => {
      Object.values(m).forEach((v) => v instanceof THREE.Texture && v.dispose());
      m.dispose();
    });
  });
}

export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/*  Realism helpers                                                    */
/* ------------------------------------------------------------------ */

/** Soft studio reflections + image-based light. Returns the env texture to dispose. */
export function addEnvironment(renderer: THREE.WebGLRenderer, scene: THREE.Scene, intensity = 0.6) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const env = pmrem.fromScene(room, 0.04).texture;
  scene.environment = env;
  scene.environmentIntensity = intensity;
  pmrem.dispose();
  room.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
  return env;
}

let _capSkin: THREE.CanvasTexture | null = null;
/** Fine radial fibres + speckles. Lathe UVs run rim→crown along v. */
export function capSkinTexture() {
  if (_capSkin) return _capSkin;
  const rand = mulberry32(7);
  _capSkin = canvasTexture(256, 256, (ctx) => {
    ctx.fillStyle = "#f4f1ec";
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 520; i++) {
      const x = rand() * 256;
      ctx.strokeStyle = `rgba(110,85,60,${0.04 + rand() * 0.08})`;
      ctx.lineWidth = 0.6 + rand() * 1.2;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + (rand() - 0.5) * 6, 256);
      ctx.stroke();
    }
    for (let i = 0; i < 260; i++) {
      ctx.fillStyle = `rgba(${rand() > 0.5 ? "255,255,255" : "90,65,45"},${0.08 + rand() * 0.16})`;
      ctx.beginPath();
      ctx.arc(rand() * 256, rand() * 256, 0.6 + rand() * 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  _capSkin.wrapS = _capSkin.wrapT = THREE.RepeatWrapping;
  _capSkin.repeat.set(3, 1);
  return _capSkin;
}

let _stem: THREE.CanvasTexture | null = null;
export function stemTexture() {
  if (_stem) return _stem;
  const rand = mulberry32(11);
  _stem = canvasTexture(128, 256, (ctx) => {
    ctx.fillStyle = "#f7f4ee";
    ctx.fillRect(0, 0, 128, 256);
    for (let i = 0; i < 160; i++) {
      const x = rand() * 128;
      ctx.strokeStyle = `rgba(150,125,95,${0.05 + rand() * 0.1})`;
      ctx.lineWidth = 0.5 + rand();
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + (rand() - 0.5) * 4, 256);
      ctx.stroke();
    }
  });
  _stem.wrapS = _stem.wrapT = THREE.RepeatWrapping;
  _stem.repeat.set(2, 1);
  return _stem;
}

/** Alpha leaf textures: "compound" (tomato), "fern" (frond), "fallen" (single leaf). */
export function leafTexture(kind: "compound" | "fern" | "fallen", rand = mulberry32(3)) {
  const W = kind === "fern" ? 128 : 192, H = 256;
  return canvasTexture(W, H, (ctx) => {
    ctx.clearRect(0, 0, W, H);
    const leaflet = (x: number, y: number, rx: number, ry: number, a: number, fill: string) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(a);
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(rx, -ry * 0.5, 0, -ry);
      ctx.quadraticCurveTo(-rx, -ry * 0.5, 0, 0);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -ry * 0.9);
      ctx.stroke();
      ctx.restore();
    };
    const cx = W / 2;
    if (kind === "fallen") {
      leaflet(cx, H - 10, 70, 230, 0, "#ffffff");
      return;
    }
    // midrib
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = kind === "fern" ? 3 : 4;
    ctx.beginPath();
    ctx.moveTo(cx, H);
    ctx.lineTo(cx, 6);
    ctx.stroke();
    const n = kind === "fern" ? 16 : 4;
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const y = H - 20 - t * (H - 40);
      const size = kind === "fern" ? (1 - t * 0.75) * 46 : 60 - t * 10;
      const w = kind === "fern" ? size * 0.28 : size * 0.45;
      const shade = `hsl(0,0%,${88 + rand() * 12}%)`;
      leaflet(cx, y, w, size, -1.1 + (rand() - 0.5) * 0.2, shade);
      leaflet(cx, y, w, size, 1.1 + (rand() - 0.5) * 0.2, shade);
    }
    if (kind === "compound") leaflet(cx, 70, 32, 68, 0, "#ffffff");
    else leaflet(cx, 26, 6, 22, 0, "#ffffff");
  });
}

/** A plane bent along its length (for fronds, leaves). */
export function bentPlane(w: number, h: number, bend: number, segs = 8) {
  const g = new THREE.PlaneGeometry(w, h, 2, segs);
  g.translate(0, h / 2, 0);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i) / h;
    p.setZ(i, p.getZ(i) + bend * y * y * h);
    p.setX(i, p.getX(i) * (1 - y * 0.15));
  }
  g.computeVertexNormals();
  return g;
}

/** Lettuce rosette built from ruffled leaves, merged into one geometry. */
export function lettuceGeometry(rand: () => number, leaves = 9) {
  const parts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < leaves; i++) {
    const inner = i >= leaves - 3;
    const g = new THREE.PlaneGeometry(0.16, 0.2, 4, 5);
    g.translate(0, 0.1, 0);
    const p = g.attributes.position;
    for (let k = 0; k < p.count; k++) {
      const x = p.getX(k), y = p.getY(k);
      const t = y / 0.2;
      // cup the leaf and ruffle its edge
      p.setZ(k, -x * x * 6 + Math.sin(x * 60 + y * 30) * 0.012 * t + t * t * 0.05);
      p.setX(k, x * (0.55 + t * 0.6));
    }
    g.rotateX(inner ? -0.25 : -0.9 - rand() * 0.3);
    g.rotateY((i / leaves) * Math.PI * 2 * (inner ? 1.7 : 1) + rand() * 0.3);
    const s = inner ? 0.7 : 1;
    g.scale(s, s, s);
    parts.push(g);
  }
  const merged = mergeGeometries(parts)!;
  parts.forEach((g) => g.dispose());
  merged.computeVertexNormals();
  return merged;
}

/** Mushroom grow bag: rounded base, tied neck. Origin at the bottom. */
export function growBagGeometry(r = 0.12, h = 0.42) {
  const pts = [
    new THREE.Vector2(0.001, 0),
    new THREE.Vector2(r * 0.85, 0),
    new THREE.Vector2(r, h * 0.08),
    new THREE.Vector2(r * 1.02, h * 0.55),
    new THREE.Vector2(r * 0.9, h * 0.8),
    new THREE.Vector2(r * 0.45, h * 0.92),
    new THREE.Vector2(r * 0.18, h * 0.96),
    new THREE.Vector2(r * 0.22, h),
    new THREE.Vector2(0.001, h * 1.02),
  ];
  return new THREE.LatheGeometry(pts, 14);
}
