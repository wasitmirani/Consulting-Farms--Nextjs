"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import {
  mulberry32, canvasTexture, bagTexture, gillsTexture, sporeSprite, buildOysterCluster,
  disposeObject, easeInOutCubic, hasWebGL, addEnvironment, growBagGeometry,
} from "@/lib/three-kit";

type ZoneInfo = { name: string; color: string };

// Zone centres along X (planting → incubation → grow → packing)
const ZX = [-6.75, -2.25, 2.25, 6.75];

type View = { pos: THREE.Vector3; target: THREE.Vector3 };
const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const VIEWS: View[] = [
  { pos: v3(-3.6, 4.8, 6.4), target: v3(-7.0, 0.7, -1.2) },
  { pos: v3(-1.9, 3.3, 5.6), target: v3(-2.3, 1.3, -2.0) },
  { pos: v3(2.6, 3.3, 5.6), target: v3(2.2, 1.3, -2.0) },
  { pos: v3(4.1, 4.5, 6.4), target: v3(7.0, 0.8, -1.0) },
];
const OVERVIEW: View = { pos: v3(4, 11.5, 19), target: v3(0.2, -0.3, -0.6) };
// Pull room close-ups back so each whole room stays in frame
VIEWS.forEach((v) => v.pos.sub(v.target).multiplyScalar(1.65).add(v.target));

/* ------------------------------------------------------------------ */

function concreteTexture(rand: () => number) {
  const tex = canvasTexture(512, 512, (ctx) => {
    ctx.fillStyle = "#d9d3c7";
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 2500; i++) {
      ctx.fillStyle = rand() > 0.5 ? "rgba(255,255,255,0.18)" : "rgba(90,80,65,0.08)";
      ctx.fillRect(rand() * 512, rand() * 512, 2, 2);
    }
    ctx.strokeStyle = "rgba(90,80,65,0.14)";
    ctx.lineWidth = 2;
    for (let p = 0; p <= 512; p += 128) {
      ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, 512); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(512, p); ctx.stroke();
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4.5, 2);
  return tex;
}

function signTexture(text: string, bg: string, fg: string) {
  return canvasTexture(512, 128, (ctx) => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = fg;
    ctx.font = "bold 54px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 256, 68);
  });
}

const box = (w: number, h: number, d: number, mat: THREE.Material) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
};

/* ------------------------------------------------------------------ */

export default function FacilityScene({
  active,
  onSelect,
  zones,
  className,
}: {
  active: number | null;
  onSelect: (i: number) => void;
  zones: ZoneInfo[];
  className?: string;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const pinRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const apiRef = useRef<{ goTo: (i: number | null) => void } | null>(null);
  const onSelectRef = useRef(onSelect);
  const activeRef = useRef(active);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    activeRef.current = active;
    apiRef.current?.goTo(active);
  }, [active]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (!hasWebGL()) {
      mount.dataset.ready = "none";
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const rand = mulberry32(2024);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, coarse ? 1.5 : 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.92;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.style.outline = "none";
    mount.prepend(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.copy(OVERVIEW.pos);

    /* Lights -------------------------------------------------------- */
    const envTex = addEnvironment(renderer, scene, 0.22);
    scene.add(new THREE.HemisphereLight("#fff7e8", "#9c937f", 0.7));
    const sun = new THREE.DirectionalLight("#fff1dc", 2.2);
    sun.position.set(6, 12, 9);
    sun.castShadow = true;
    sun.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048);
    Object.assign(sun.shadow.camera, { left: -11, right: 11, top: 8, bottom: -8, near: 1, far: 40 });
    sun.shadow.bias = -0.0006;
    sun.shadow.radius = 3;
    scene.add(sun);
    const growLight = new THREE.PointLight("#ffe9c4", 7, 7);
    growLight.position.set(ZX[2], 2.7, -1.5);
    scene.add(growLight);
    const incLight = new THREE.PointLight("#b9cff5", 4, 6);
    incLight.position.set(ZX[1], 2.6, -1.6);
    scene.add(incLight);
    const coldLight = new THREE.PointLight("#bfe3ff", 3, 5);
    coldLight.position.set(7.4, 2.2, -0.6);
    scene.add(coldLight);

    const world = new THREE.Group();
    scene.add(world);

    /* Materials ----------------------------------------------------- */
    const metal = new THREE.MeshStandardMaterial({ color: "#a5adb0", metalness: 0.55, roughness: 0.35 });
    const shelfMat = new THREE.MeshStandardMaterial({ color: "#c3c9cb", metalness: 0.45, roughness: 0.4 });
    const wallMat = new THREE.MeshStandardMaterial({ color: "#f1ece2", roughness: 0.9 });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: "#dcecee", transparent: true, opacity: 0.16, roughness: 0.05, depthWrite: false, side: THREE.DoubleSide,
    });
    const frameMat = new THREE.MeshStandardMaterial({ color: "#e4e0d6", roughness: 0.5, metalness: 0.2 });
    const woodMat = new THREE.MeshStandardMaterial({ color: "#b48d5d", roughness: 0.9 });
    const crateMat = new THREE.MeshStandardMaterial({ color: "#2f8f4e", roughness: 0.6 });

    /* Building shell ------------------------------------------------ */
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(18.4, 0.25, 8),
      new THREE.MeshStandardMaterial({ map: concreteTexture(rand), roughness: 0.85 }),
    );
    floor.position.set(0, -0.125, -0.2);
    floor.receiveShadow = true;
    world.add(floor);

    const backWall = box(18.4, 3.4, 0.2, wallMat);
    backWall.position.set(0, 1.7, -4.1);
    world.add(backWall);
    const sideWall = box(0.2, 3.4, 8, wallMat);
    sideWall.position.set(-9.1, 1.7, -0.2);
    world.add(sideWall);
    const skirting = box(18.4, 0.18, 0.04, new THREE.MeshStandardMaterial({ color: "#2f8f4e" }));
    skirting.position.set(0, 0.09, -3.98);
    world.add(skirting);

    // Zone floor tints + clickable pick planes
    const zoneFloors: THREE.Mesh[] = [];
    zones.forEach((z, i) => {
      const tint = new THREE.Mesh(
        new THREE.PlaneGeometry(4.36, 7.6),
        new THREE.MeshBasicMaterial({ color: z.color, transparent: true, opacity: 0.1, depthWrite: false }),
      );
      tint.rotation.x = -Math.PI / 2;
      tint.position.set(ZX[i], 0.006, -0.2);
      tint.userData.zone = i;
      world.add(tint);
      zoneFloors.push(tint);
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 0.14), new THREE.MeshBasicMaterial({ color: z.color }));
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(ZX[i], 0.008, 3.5);
      world.add(stripe);
    });

    // Glass partitions between rooms (open doorway at the front)
    [-4.5, 0, 4.5].forEach((x) => {
      const lower = box(0.12, 0.9, 6, frameMat);
      lower.position.set(x, 0.45, -1);
      world.add(lower);
      const glass = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.3, 6), glassMat);
      glass.position.set(x, 2.05, -1);
      world.add(glass);
      const top = box(0.1, 0.08, 6, frameMat);
      top.position.set(x, 3.2, -1);
      world.add(top);
      for (let k = 0; k <= 4; k++) {
        const post = box(0.07, 3.2, 0.07, frameMat);
        post.position.set(x, 1.6, -4 + k * 1.5);
        world.add(post);
      }
    });

    /* Racks --------------------------------------------------------- */
    const RACK_LEN = 4.2, RACK_D = 0.7, TIERS = 5, TIER_GAP = 0.54, RACK_ZC = -1.75;
    const shelfY = (t: number) => 0.14 + t * TIER_GAP;
    const BAGS_PER_ROW = 14;

    function makeRack(x: number) {
      const g = new THREE.Group();
      [-RACK_LEN / 2, 0, RACK_LEN / 2].forEach((z) =>
        [-RACK_D / 2, RACK_D / 2].forEach((dx) => {
          const p = box(0.05, shelfY(TIERS - 1) + 0.35, 0.05, metal);
          p.position.set(dx, (shelfY(TIERS - 1) + 0.35) / 2, z);
          g.add(p);
        }),
      );
      for (let t = 0; t < TIERS; t++) {
        const s = box(RACK_D, 0.035, RACK_LEN, shelfMat);
        s.position.y = shelfY(t);
        g.add(s);
      }
      g.position.set(x, 0, RACK_ZC);
      world.add(g);
    }

    const bagGeo = growBagGeometry(0.12, 0.42);

    function fillRack(
      x: number,
      inst: THREE.InstancedMesh,
      start: number,
      colorFn: (tier: number) => THREE.Color,
      onBag?: (p: THREE.Vector3, row: number) => void,
    ) {
      const d = new THREE.Object3D();
      let n = start;
      for (let t = 0; t < TIERS; t++)
        for (let row = 0; row < 2; row++)
          for (let k = 0; k < BAGS_PER_ROW; k++) {
            const dx = (row ? 1 : -1) * RACK_D * 0.24;
            const z = RACK_ZC - RACK_LEN / 2 + 0.15 + k * ((RACK_LEN - 0.3) / (BAGS_PER_ROW - 1));
            d.position.set(x + dx, shelfY(t) + 0.018, z);
            d.rotation.set(0, rand() * Math.PI, 0);
            const s = 0.95 + rand() * 0.1;
            d.scale.set(s, s, s);
            d.updateMatrix();
            inst.setMatrixAt(n, d.matrix);
            inst.setColorAt(n, colorFn(t));
            onBag?.(d.position.clone(), row);
            n++;
          }
      return n;
    }
    const bagsPerRack = TIERS * 2 * BAGS_PER_ROW;

    /* Incubation room ---------------------------------------------- */
    const incX = [ZX[1] - 1.25, ZX[1] + 1.25];
    incX.forEach(makeRack);
    const incBags = new THREE.InstancedMesh(
      bagGeo,
      new THREE.MeshStandardMaterial({ map: bagTexture(rand, "#ffffff", "#9c7a4a"), roughness: 0.55 }),
      bagsPerRack * 2,
    );
    const substrate = new THREE.Color("#b9945f");
    const mycelium = new THREE.Color("#f6f3ec");
    let idx = 0;
    incX.forEach((x) => {
      idx = fillRack(x, incBags, idx, () => substrate.clone().lerp(mycelium, Math.min(1, 0.2 + rand() * 0.9)));
    });
    incBags.castShadow = true;
    incBags.receiveShadow = true;
    world.add(incBags);

    /* Grow rooms ---------------------------------------------------- */
    const growX = [ZX[2] - 1.25, ZX[2] + 1.25];
    growX.forEach(makeRack);
    const growBags = new THREE.InstancedMesh(
      bagGeo,
      new THREE.MeshStandardMaterial({ map: bagTexture(rand, "#ffffff", "#c9b48f"), roughness: 0.5 }),
      bagsPerRack * 2,
    );
    // Mushroom = flattened dome cap + short stem, merged; vertex colours keep the stem paler
    const capGeo = (() => {
      const dome = new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
      dome.scale(1.2, 0.5, 1.05);
      const stemG = new THREE.CylinderGeometry(0.3, 0.38, 0.9, 10);
      stemG.translate(0, -0.45, 0);
      const tint = (g: THREE.BufferGeometry, v: number) =>
        g.setAttribute("color", new THREE.Float32BufferAttribute(new Array(g.attributes.position.count * 3).fill(v), 3));
      tint(dome, 0.82);
      tint(stemG, 1);
      const m = mergeGeometries([dome, stemG])!;
      dome.dispose();
      stemG.dispose();
      return m;
    })();
    const capPositions: { p: THREE.Vector3; dir: THREE.Vector3; s: number }[] = [];
    idx = 0;
    growX.forEach((x, ri) => {
      const aisleSign = ri === 0 ? 1 : -1; // mushrooms face the aisle
      idx = fillRack(x, growBags, idx, () => new THREE.Color("#e9e1d1").lerp(new THREE.Color("#d2c3a6"), rand() * 0.6), (p, row) => {
        const facesAisle = (row === 1 && aisleSign === 1) || (row === 0 && aisleSign === -1);
        const clusters = facesAisle ? 1 : rand() > 0.6 ? 1 : 0;
        const sign = facesAisle ? aisleSign : -aisleSign;
        for (let c = 0; c < clusters; c++) {
          const n = 3 + Math.floor(rand() * 3);
          const baseY = p.y + 0.12 + rand() * 0.16;
          for (let i = 0; i < n; i++) {
            const dir = new THREE.Vector3(sign, 0.35 + rand() * 0.7, (rand() - 0.5) * 1.2).normalize();
            capPositions.push({
              p: new THREE.Vector3(p.x + sign * 0.12, baseY + (rand() - 0.5) * 0.1, p.z + (rand() - 0.5) * 0.12),
              dir,
              s: 0.08 + rand() * 0.06,
            });
          }
        }
      });
    });
    growBags.castShadow = true;
    growBags.receiveShadow = true;
    world.add(growBags);

    const caps = new THREE.InstancedMesh(
      capGeo,
      new THREE.MeshStandardMaterial({ roughness: 0.55, vertexColors: true }),
      capPositions.length,
    );
    {
      const d = new THREE.Object3D();
      const up = new THREE.Vector3(0, 1, 0);
      const oyA = new THREE.Color("#7f7668"), oyB = new THREE.Color("#b8a587");
      capPositions.forEach((c, i) => {
        d.position.copy(c.p);
        d.quaternion.setFromUnitVectors(up, c.dir);
        d.scale.setScalar(c.s * 1.05);
        d.updateMatrix();
        caps.setMatrixAt(i, d.matrix);
        caps.setColorAt(i, oyA.clone().lerp(oyB, rand()));
      });
    }
    caps.castShadow = true;
    world.add(caps);
    // Mushrooms start hidden and "grow" in when the section is first seen
    const capMatrices = Array.from({ length: capPositions.length }, (_, i) => {
      const m = new THREE.Matrix4();
      caps.getMatrixAt(i, m);
      return m;
    });

    // LED strips under each shelf, along the aisle edge
    const ledMat = new THREE.MeshStandardMaterial({ color: "#fff6df", emissive: "#fff1cf", emissiveIntensity: 1.6 });
    growX.forEach((x, ri) => {
      const edge = x + (ri === 0 ? 1 : -1) * (RACK_D / 2 - 0.04);
      for (let t = 1; t < TIERS; t++) {
        const led = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, RACK_LEN - 0.2), ledMat);
        led.position.set(edge, shelfY(t) - 0.03, RACK_ZC);
        world.add(led);
      }
    });
    // Misting line above the aisle
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, RACK_LEN + 0.6, 8), metal);
    pipe.rotation.x = Math.PI / 2;
    pipe.position.set(ZX[2], 2.95, RACK_ZC);
    world.add(pipe);
    const humid = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.35), new THREE.MeshStandardMaterial({ color: "#e9eef0", roughness: 0.4 }));
    humid.position.set(ZX[2], 0.3, -3.65);
    humid.castShadow = true;
    world.add(humid);

    /* Ceiling services: LED tubes + fabric air-sock ducts ----------- */
    const tubeMat = new THREE.MeshStandardMaterial({ color: "#ffffff", emissive: "#fff4dc", emissiveIntensity: 1.5 });
    ZX.forEach((x) => {
      for (const dz of [-2.7, -0.7]) {
        const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.8, 8), tubeMat);
        tube.rotation.z = Math.PI / 2;
        tube.position.set(x, 3.28, dz);
        world.add(tube);
        [-0.7, 0.7].forEach((o) => {
          const h = box(0.012, 0.3, 0.012, metal);
          h.position.set(x + o, 3.45, dz);
          world.add(h);
        });
      }
    });
    const sockMat = new THREE.MeshStandardMaterial({ color: "#f4f2ec", roughness: 0.95 });
    [ZX[1], ZX[2]].forEach((x) => {
      const sock = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 4.1, 24, 6), sockMat);
      sock.rotation.z = Math.PI / 2;
      sock.position.set(x, 3.0, -3.62);
      sock.castShadow = true;
      world.add(sock);
      // small vent holes along the sock
      for (let k = 0; k < 9; k++) {
        const hole = new THREE.Mesh(new THREE.CircleGeometry(0.025, 8), new THREE.MeshBasicMaterial({ color: "#9aa3a0" }));
        hole.position.set(x - 1.8 + k * 0.45, 2.86, -3.45);
        hole.rotation.x = 0.6;
        world.add(hole);
      }
    });

    /* Windows (planting warehouse + packing) ------------------------ */
    const winMat = new THREE.MeshStandardMaterial({ color: "#cfe8f2", emissive: "#bfe2f0", emissiveIntensity: 0.55, roughness: 0.15, metalness: 0.1 });
    [[ZX[0], 2.4], [5.25, 1.1]].forEach(([x, w]) => {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.9), winMat);
      win.position.set(x, 2.3, -3.99);
      world.add(win);
      const fr = box(w + 0.1, 0.06, 0.06, frameMat);
      fr.position.set(x, 1.83, -3.97);
      world.add(fr);
      const fr2 = fr.clone();
      fr2.position.y = 2.77;
      world.add(fr2);
      for (let k = 0; k <= Math.round(w / 0.6); k++) {
        const m = box(0.04, 0.9, 0.05, frameMat);
        m.position.set(x - w / 2 + (k * w) / Math.round(w / 0.6), 2.3, -3.97);
        world.add(m);
      }
    });

    /* Planting warehouse ------------------------------------------- */
    const pile = (r: number, color: string, x: number, z: number, sy = 0.55) => {
      const geo = new THREE.IcosahedronGeometry(r, 4);
      const p = geo.attributes.position;
      const cols: number[] = [];
      const base = new THREE.Color(color);
      const tmp = new THREE.Color();
      for (let i = 0; i < p.count; i++) {
        const vx = p.getX(i), vy = p.getY(i), vz = p.getZ(i);
        const n = 1 + 0.06 * Math.sin(vx * 7 + vz * 3) + 0.05 * Math.sin(vy * 11 + vx * 5) + (rand() - 0.5) * 0.05;
        p.setXYZ(i, vx * n, vy * n, vz * n);
        tmp.copy(base).offsetHSL(0, 0, (rand() - 0.5) * 0.12);
        cols.push(tmp.r, tmp.g, tmp.b);
      }
      geo.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
      geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true }));
      m.scale.set(1, sy, 0.9);
      m.position.set(x, 0, z);
      m.castShadow = true;
      m.receiveShadow = true;
      world.add(m);
    };
    pile(1.3, "#cfae6e", -7.8, -2.7);
    pile(0.85, "#9c7b4a", -6.0, -3.1, 0.5);

    // Bag-filling hopper
    {
      const g = new THREE.Group();
      const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.12, 0.9, 24, 1, true), new THREE.MeshStandardMaterial({ color: "#b3bbbe", metalness: 0.6, roughness: 0.3, side: THREE.DoubleSide }));
      cone.position.y = 1.65;
      cone.castShadow = true;
      g.add(cone);
      const chute = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.4, 12), metal);
      chute.position.y = 1.0;
      g.add(chute);
      [[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]].forEach(([x, z]) => {
        const l = box(0.06, 2.1, 0.06, metal);
        l.position.set(x, 1.05, z);
        g.add(l);
      });
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.035, 8, 32), metal);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 2.1;
      g.add(ring);
      g.position.set(-5.4, 0, -1.3);
      world.add(g);
    }

    // Work table with bags being filled
    const table = (x: number, z: number, w: number, d: number, topColor: string) => {
      const g = new THREE.Group();
      const top = box(w, 0.07, d, new THREE.MeshStandardMaterial({ color: topColor, roughness: 0.4, metalness: 0.3 }));
      top.position.y = 0.9;
      g.add(top);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
        const l = box(0.05, 0.9, 0.05, metal);
        l.position.set(sx * (w / 2 - 0.08), 0.45, sz * (d / 2 - 0.08));
        g.add(l);
      });
      g.position.set(x, 0, z);
      world.add(g);
      return g;
    };
    const plantBagMat = new THREE.MeshStandardMaterial({ map: bagTexture(rand, "#f3eadb", "#9c7a4a"), roughness: 0.55 });
    const wt = table(-6.7, 0.7, 2.2, 0.9, "#c9cfd1");
    for (let i = 0; i < 5; i++) {
      const b = new THREE.Mesh(bagGeo, plantBagMat);
      b.rotation.z = Math.PI / 2;
      b.position.set(-0.8 + i * 0.32, 1.06, -0.15 + (i % 2) * 0.25);
      b.castShadow = true;
      wt.add(b);
    }

    // Pallets of filled bags + spawn sacks
    const pallet = (x: number, z: number) => {
      const p = box(1.2, 0.14, 1.0, woodMat);
      p.position.set(x, 0.07, z);
      world.add(p);
      return p;
    };
    const palletBags = new THREE.InstancedMesh(bagGeo, plantBagMat, 36);
    {
      const d = new THREE.Object3D();
      let n = 0;
      [[-8.1, 1.0], [-8.1, -0.4]].forEach(([px, pz]) => {
        pallet(px, pz);
        for (let layer = 0; layer < 2; layer++)
          for (let a = 0; a < 3; a++)
            for (let b = 0; b < 3; b++) {
              d.position.set(px - 0.38 + a * 0.38, 0.14 + layer * 0.41, pz - 0.3 + b * 0.3);
              d.rotation.set(0, rand() * 3, 0);
              d.scale.setScalar(1);
              d.updateMatrix();
              palletBags.setMatrixAt(n++, d.matrix);
            }
      });
    }
    palletBags.castShadow = true;
    world.add(palletBags);
    const sackMat = new THREE.MeshStandardMaterial({ color: "#ece2cc", roughness: 0.95 });
    for (let i = 0; i < 3; i++) {
      const s = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.5, 4, 12), sackMat);
      s.rotation.z = Math.PI / 2;
      s.scale.set(1, 1, 0.75);
      s.position.set(-5.3 + (i === 2 ? 0.25 : i * 0.48), 0.17 + (i === 2 ? 0.3 : 0), 1.7);
      s.castShadow = true;
      world.add(s);
    }

    /* Packing & cold store ----------------------------------------- */
    {
      const cold = box(2.9, 2.8, 2.4, new THREE.MeshStandardMaterial({ color: "#e4edf0", roughness: 0.5 }));
      cold.position.set(7.45, 1.4, -2.8);
      world.add(cold);
      const door = box(0.95, 2.1, 0.05, new THREE.MeshStandardMaterial({ color: "#c4d5da", roughness: 0.4, metalness: 0.2 }));
      door.position.set(7.0, 1.05, -1.58);
      world.add(door);
      const handle = box(0.05, 0.4, 0.06, metal);
      handle.position.set(7.35, 1.1, -1.53);
      world.add(handle);
      const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(1.2, 0.3),
        new THREE.MeshBasicMaterial({ map: signTexture("COLD STORE", "#0e2a1f", "#f2f6ee") }),
      );
      sign.position.set(8.2, 2.35, -1.59);
      world.add(sign);
    }

    const pt = table(6.4, 0.4, 2.6, 1.0, "#f1f1ec");
    // Open crates filled with mushrooms
    const packCapPos: THREE.Matrix4[] = [];
    const crate = (parent: THREE.Object3D, x: number, y: number, z: number, filled: boolean) => {
      const g = new THREE.Group();
      const W = 0.5, D = 0.36, H = 0.18, T = 0.02;
      const base = box(W, T, D, crateMat);
      base.position.y = T / 2;
      g.add(base);
      [[0, D / 2], [0, -D / 2]].forEach(([, z2]) => {
        const s = box(W, H, T, crateMat);
        s.position.set(0, H / 2, z2);
        g.add(s);
      });
      [W / 2, -W / 2].forEach((x2) => {
        const s = box(T, H, D, crateMat);
        s.position.set(x2, H / 2, 0);
        g.add(s);
      });
      g.position.set(x, y, z);
      parent.add(g);
      if (filled) {
        g.updateWorldMatrix(true, false);
        const d = new THREE.Object3D();
        for (let i = 0; i < 14; i++) {
          d.position.set((rand() - 0.5) * (W - 0.1), H - 0.03 + rand() * 0.03, (rand() - 0.5) * (D - 0.08));
          d.rotation.set((rand() - 0.5) * 0.5, 0, (rand() - 0.5) * 0.5);
          const s = 0.05 + rand() * 0.03;
          d.scale.set(s, s * 0.7, s);
          d.updateMatrix();
          packCapPos.push(new THREE.Matrix4().multiplyMatrices(g.matrixWorld, d.matrix));
        }
      }
    };
    world.updateMatrixWorld(true);
    [-0.85, -0.25, 0.35].forEach((x) => crate(pt, x, 0.935, -0.15, true));
    const scale = box(0.32, 0.08, 0.3, new THREE.MeshStandardMaterial({ color: "#d8dcde", metalness: 0.4, roughness: 0.3 }));
    scale.position.set(0.95, 0.975, -0.1);
    pt.add(scale);

    // Stacked crates ready for dispatch
    pallet(8.2, 1.5);
    const stackG = new THREE.Group();
    world.add(stackG);
    for (let layer = 0; layer < 4; layer++)
      for (let a = 0; a < 2; a++)
        for (let b = 0; b < 2; b++)
          crate(stackG, 7.95 + a * 0.52, 0.14 + layer * 0.19, 1.3 + b * 0.38, layer === 3);
    world.updateMatrixWorld(true);

    // Harvest trolley in the grow-room aisle
    {
      const tr = new THREE.Group();
      [0.28, 0.78].forEach((y) => {
        const shelf = box(0.55, 0.03, 0.85, shelfMat);
        shelf.position.y = y;
        tr.add(shelf);
      });
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
        const p = box(0.03, 0.95, 0.03, metal);
        p.position.set(sx * 0.26, 0.5, sz * 0.4);
        tr.add(p);
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 12), new THREE.MeshStandardMaterial({ color: "#2b2f2f" }));
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(sx * 0.24, 0.05, sz * 0.38);
        tr.add(wheel);
      });
      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.015, 6, 16, Math.PI), metal);
      handle.position.set(0, 0.95, 0.42);
      tr.add(handle);
      tr.position.set(ZX[2] + 0.15, 0, 0.35);
      tr.rotation.y = 0.15;
      world.add(tr);
      world.updateMatrixWorld(true);
      crate(tr, 0, 0.295, -0.18, true);
      crate(tr, 0, 0.295, 0.2, true);
      crate(tr, 0, 0.795, 0, true);
    }
    world.updateMatrixWorld(true);

    const packCaps = new THREE.InstancedMesh(capGeo, new THREE.MeshStandardMaterial({ roughness: 0.5, vertexColors: true }), packCapPos.length);
    {
      const cA = new THREE.Color("#ffffff"), cB = new THREE.Color("#f0e2c6");
      packCapPos.forEach((m, i) => {
        packCaps.setMatrixAt(i, m);
        packCaps.setColorAt(i, cA.clone().lerp(cB, rand()));
      });
    }
    packCaps.castShadow = true;
    world.add(packCaps);

    // Hero oyster cluster on the packing table for detail up close
    const showcase = buildOysterCluster(rand, gillsTexture("#efe3cf"), 0.16, 6);
    showcase.position.set(0.9, 1.02, 0.25);
    pt.add(showcase);

    /* People -------------------------------------------------------- */
    const worker = (x: number, z: number, rotY: number, armsForward = true) => {
      const g = new THREE.Group();
      const coat = new THREE.MeshStandardMaterial({ color: "#f4f4f0", roughness: 0.8 });
      const trousers = new THREE.MeshStandardMaterial({ color: "#2d3b33", roughness: 0.8 });
      const skin = new THREE.MeshStandardMaterial({ color: "#c89a76", roughness: 0.7 });
      [-0.08, 0.08].forEach((lx) => {
        const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.45, 4, 8), trousers);
        leg.position.set(lx, 0.29, 0);
        leg.castShadow = true;
        g.add(leg);
      });
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.45, 4, 12), coat);
      body.position.y = 0.95;
      body.castShadow = true;
      g.add(body);
      const apron = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.5, 0.02), new THREE.MeshStandardMaterial({ color: "#2f8f4e" }));
      apron.position.set(0, 0.9, 0.17);
      g.add(apron);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), skin);
      head.position.y = 1.5;
      head.castShadow = true;
      g.add(head);
      const net = new THREE.Mesh(new THREE.SphereGeometry(0.128, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), coat);
      net.position.y = 1.52;
      g.add(net);
      [-1, 1].forEach((side) => {
        const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.4, 4, 8), coat);
        arm.position.set(side * 0.2, 1.08, armsForward ? 0.14 : 0);
        arm.rotation.x = armsForward ? -0.9 : 0;
        arm.castShadow = true;
        g.add(arm);
      });
      g.position.set(x, 0, z);
      g.rotation.y = rotY;
      world.add(g);
      return g;
    };
    worker(-6.7, 1.55, Math.PI);
    const harvester = worker(ZX[2] - 0.2, -0.6, Math.PI / 2 + 0.3);
    worker(6.2, 1.3, Math.PI);

    /* Mist in the grow room ---------------------------------------- */
    const MIST = coarse ? 90 : 160;
    const mistGeo = new THREE.BufferGeometry();
    const mp = new Float32Array(MIST * 3);
    for (let i = 0; i < MIST; i++) {
      mp[i * 3] = ZX[2] + (rand() - 0.5) * 1.6;
      mp[i * 3 + 1] = 0.3 + rand() * 2.6;
      mp[i * 3 + 2] = RACK_ZC + (rand() - 0.5) * RACK_LEN;
    }
    mistGeo.setAttribute("position", new THREE.BufferAttribute(mp, 3));
    const mist = new THREE.Points(
      mistGeo,
      new THREE.PointsMaterial({ size: 0.12, map: sporeSprite(), transparent: true, depthWrite: false, opacity: 0.55, color: "#ffffff" }),
    );
    world.add(mist);

    /* Controls ------------------------------------------------------ */
    let controls: OrbitControls | null = null;
    if (!coarse) {
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.rotateSpeed = 0.45;
      controls.minPolarAngle = Math.PI * 0.22;
      controls.maxPolarAngle = Math.PI * 0.45;
      controls.minAzimuthAngle = -0.75;
      controls.maxAzimuthAngle = 0.75;
      controls.target.copy(OVERVIEW.target);
      renderer.domElement.style.cursor = "grab";
    }
    camera.lookAt(OVERVIEW.target);

    /* Camera tween -------------------------------------------------- */
    const curTarget = OVERVIEW.target.clone();
    let tween: { from: View; to: View; t0: number; dur: number } | null = null;
    const clock = new THREE.Timer();
    const goTo = (i: number | null) => {
      const to = i === null ? OVERVIEW : VIEWS[i];
      zoneFloors.forEach((f, k) => ((f.material as THREE.MeshBasicMaterial).opacity = k === i ? 0.28 : 0.1));
      if (reduceMotion) {
        camera.position.copy(to.pos);
        curTarget.copy(to.target);
        controls?.target.copy(to.target);
        camera.lookAt(curTarget);
        start();
        return;
      }
      tween = { from: { pos: camera.position.clone(), target: (controls?.target ?? curTarget).clone() }, to, t0: clock.update().getElapsed(), dur: 1.5 };
      if (controls) controls.enabled = false;
      start();
    };
    apiRef.current = { goTo };

    /* Click a room on the floor to select it ------------------------ */
    const ray = new THREE.Raycaster();
    let down: { x: number; y: number } | null = null;
    const onDown = (e: PointerEvent) => {
      down = { x: e.clientX, y: e.clientY };
      renderer.domElement.style.cursor = controls ? "grabbing" : "";
    };
    const onUp = (e: PointerEvent) => {
      if (controls) renderer.domElement.style.cursor = "grab";
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) return;
      const r = renderer.domElement.getBoundingClientRect();
      ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
      const hit = ray.intersectObjects(zoneFloors, false)[0];
      if (hit) onSelectRef.current(hit.object.userData.zone);
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointerup", onUp);

    /* Sizing -------------------------------------------------------- */
    const resize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / h;
      camera.zoom = THREE.MathUtils.clamp((w / h) / 1.75, 0.42, 1);
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    /* Loop ---------------------------------------------------------- */
    let visible = false;
    let grown = reduceMotion ? 1 : 0;
    let growStart = -1;
    const hiddenM = new THREE.Matrix4().makeScale(0, 0, 0);
    if (!reduceMotion) for (let i = 0; i < capMatrices.length; i++) caps.setMatrixAt(i, hiddenM);

    const anchors = ZX.map((x, i) => new THREE.Vector3(x, i === 3 ? 3.4 : 3.5, -1.2));
    const proj = new THREE.Vector3();
    let raf = 0;
    let running = false;
    const tmpM = new THREE.Matrix4();
    const tmpS = new THREE.Matrix4();

    const tick = () => {
      if (!visible || document.hidden) {
        running = false;
        return;
      }
      clock.update();
      const t = clock.getElapsed();

      if (tween) {
        const k = easeInOutCubic(Math.min(1, (t - tween.t0) / tween.dur));
        camera.position.lerpVectors(tween.from.pos, tween.to.pos, k);
        curTarget.lerpVectors(tween.from.target, tween.to.target, k);
        camera.lookAt(curTarget);
        if (k >= 1) {
          controls?.target.copy(tween.to.target);
          if (controls) controls.enabled = true;
          tween = null;
        }
      } else {
        controls?.update();
      }

      if (!reduceMotion) {
        // Grow-in for grow-room mushrooms
        if (grown < 1) {
          if (growStart < 0) growStart = t;
          grown = Math.min(1, (t - growStart) / 2.2);
          for (let i = 0; i < capMatrices.length; i++) {
            const local = THREE.MathUtils.clamp(grown * 1.6 - (i / capMatrices.length) * 0.6, 0, 1);
            const e = 1 - Math.pow(1 - local, 3);
            const pos = new THREE.Vector3().setFromMatrixPosition(capMatrices[i]);
            tmpM.copy(capMatrices[i]).setPosition(0, 0, 0);
            tmpS.makeScale(e, e, e);
            tmpM.premultiply(tmpS).setPosition(pos);
            caps.setMatrixAt(i, e === 0 ? hiddenM : tmpM);
          }
          caps.instanceMatrix.needsUpdate = true;
        }
        const p = mistGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < MIST; i++) {
          let y = p.getY(i) - 0.004 - (i % 5) * 0.0008;
          if (y < 0.2) y = 2.9;
          p.setY(i, y);
          p.setX(i, p.getX(i) + Math.sin(t + i) * 0.0012);
        }
        p.needsUpdate = true;
        harvester.rotation.y = Math.PI / 2 + 0.3 + Math.sin(t * 0.8) * 0.25;
      }

      renderer.render(scene, camera);

      // Project HTML pins onto the rooms
      const w = mount.clientWidth, h = mount.clientHeight;
      anchors.forEach((a, i) => {
        const el = pinRefs.current[i];
        if (!el) return;
        proj.copy(a).project(camera);
        const off = proj.z > 1 || proj.x < -1.05 || proj.x > 1.05 || proj.y < -1.05 || proj.y > 1.05;
        el.style.transform = `translate(-50%, -100%) translate(${((proj.x + 1) / 2) * w}px, ${((1 - proj.y) / 2) * h}px)`;
        el.style.opacity = off ? "0" : "1";
        el.style.pointerEvents = off ? "none" : "auto";
      });

      raf = requestAnimationFrame(tick);
    };

    function start() {
      if (running || !visible) return;
      running = true;
      raf = requestAnimationFrame(tick);
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
    }, { threshold: 0.05 });
    io.observe(mount);
    const onVis = () => !document.hidden && start();
    document.addEventListener("visibilitychange", onVis);
    mount.dataset.ready = "true";
    if (activeRef.current !== null) goTo(activeRef.current);

    return () => {
      cancelAnimationFrame(raf);
      apiRef.current = null;
      document.removeEventListener("visibilitychange", onVis);
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointerup", onUp);
      io.disconnect();
      ro.disconnect();
      controls?.dispose();
      disposeObject(scene);
      envTex.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
    // zones are static content; scene is built once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={mountRef} className={`scene-fade relative overflow-hidden ${className ?? ""}`}>
      {zones.map((z, i) => (
        <button
          key={z.name}
          ref={(el) => {
            pinRefs.current[i] = el;
          }}
          type="button"
          tabIndex={-1}
          aria-hidden
          onClick={() => onSelect(i)}
          className={`absolute top-0 left-0 flex items-center gap-2 rounded-full p-1.5 sm:pr-3.5 text-xs font-bold whitespace-nowrap shadow-lg opacity-0 transition-[background-color,color] duration-300 ${
            active === i ? "bg-cream text-primary" : "bg-primary-deep/80 text-cream backdrop-blur hover:bg-primary-deep"
          }`}
        >
          <span className="grid size-6 place-items-center rounded-full text-[11px] text-primary-deep" style={{ background: z.color }}>
            {i + 1}
          </span>
          <span className="hidden sm:inline">{z.name}</span>
        </button>
      ))}
    </div>
  );
}
