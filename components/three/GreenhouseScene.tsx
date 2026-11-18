"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  mulberry32, canvasTexture, sporeSprite, disposeObject, hasWebGL, addEnvironment, bentPlane, leafTexture, lettuceGeometry,
} from "@/lib/three-kit";

export type GreenhouseState = {
  vents: boolean;
  shade: boolean;
  irrigation: boolean;
  fans: boolean;
  night: boolean;
};

/* Greenhouse dimensions: two gable spans side by side */
const SPAN = 4.2; // width of one span (x)
const LEN = 11; // length (z)
const EAVE = 2.7;
const RIDGE = 4.0;
const X0 = -SPAN; // left wall
const X1 = SPAN; // right wall

/* ------------------------------------------------------------------ */

function quad(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3, mat: THREE.Material) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute([...a.toArray(), ...b.toArray(), ...c.toArray(), ...d.toArray()], 3));
  g.setIndex([0, 1, 2, 0, 2, 3]);
  g.computeVertexNormals();
  return new THREE.Mesh(g, mat);
}

function tri(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, mat: THREE.Material) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute([...a.toArray(), ...b.toArray(), ...c.toArray()], 3));
  g.computeVertexNormals();
  return new THREE.Mesh(g, mat);
}

/** A beam (box) stretched between two points. */
function beam(a: THREE.Vector3, b: THREE.Vector3, t: number, mat: THREE.Material) {
  const len = a.distanceTo(b);
  const m = new THREE.Mesh(new THREE.BoxGeometry(t, len, t), mat);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  m.castShadow = true;
  return m;
}

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/* ------------------------------------------------------------------ */

export default function GreenhouseScene({ state, className }: { state: GreenhouseState; className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  const kickRef = useRef<() => void>(() => {});

  useEffect(() => {
    stateRef.current = state;
    kickRef.current();
  }, [state]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (!hasWebGL()) {
      mount.dataset.ready = "none";
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const rand = mulberry32(42);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, coarse ? 1.5 : 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.style.outline = "none";
    mount.prepend(renderer.domElement);

    const scene = new THREE.Scene();
    const dayFog = new THREE.Color("#e6f1ec"), nightFog = new THREE.Color("#1f2f55");
    scene.fog = new THREE.Fog(dayFog.clone(), 24, 62);
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 120);
    camera.position.set(11, 7.5, 13.5);

    /* Lights -------------------------------------------------------- */
    const envTex = addEnvironment(renderer, scene, 0.5);
    const hemi = new THREE.HemisphereLight("#fff8ec", "#7d8f6a", 0.95);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight("#fff0d6", 2.6);
    sun.position.set(-8, 14, 9);
    sun.castShadow = true;
    sun.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048);
    Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 50 });
    sun.shadow.bias = -0.0005;
    sun.shadow.radius = 3;
    scene.add(sun);
    const moon = new THREE.DirectionalLight("#9fb8ff", 0);
    moon.position.set(6, 10, -6);
    scene.add(moon);

    const world = new THREE.Group();
    scene.add(world);

    /* Ground -------------------------------------------------------- */
    const grassTex = canvasTexture(256, 256, (ctx) => {
      ctx.fillStyle = "#7e9a5c";
      ctx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 2200; i++) {
        ctx.fillStyle = rand() > 0.5 ? "rgba(60,90,40,0.35)" : "rgba(170,190,110,0.3)";
        ctx.fillRect(rand() * 256, rand() * 256, 1.5, 3);
      }
    });
    grassTex.wrapS = grassTex.wrapT = THREE.RepeatWrapping;
    grassTex.repeat.set(40, 40);
    const ground = new THREE.Mesh(new THREE.CircleGeometry(80, 64), new THREE.MeshStandardMaterial({ map: grassTex, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    world.add(ground);

    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(SPAN * 2 + 0.6, 0.12, LEN + 0.6),
      new THREE.MeshStandardMaterial({ color: "#d8d2c4", roughness: 0.9 }),
    );
    slab.position.y = 0.06;
    slab.receiveShadow = true;
    world.add(slab);

    // Gravel path to the door
    const path = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 6), new THREE.MeshStandardMaterial({ color: "#cfc6b2", roughness: 1 }));
    path.rotation.x = -Math.PI / 2;
    path.position.set(0, 0.01, LEN / 2 + 3);
    path.receiveShadow = true;
    world.add(path);

    /* Materials ----------------------------------------------------- */
    const alu = new THREE.MeshStandardMaterial({ color: "#e3e7e8", metalness: 0.6, roughness: 0.3 });
    const glass = new THREE.MeshPhysicalMaterial({
      color: "#e6f4f1", transparent: true, opacity: 0.16, roughness: 0.03, metalness: 0, ior: 1.5, specularIntensity: 1,
      side: THREE.DoubleSide, depthWrite: false,
    });
    const knee = new THREE.MeshStandardMaterial({ color: "#c9c1b1", roughness: 0.9 });

    /* Structure ----------------------------------------------------- */
    const gh = new THREE.Group();
    world.add(gh);
    const zs: number[] = [];
    for (let z = -LEN / 2; z <= LEN / 2 + 0.001; z += LEN / 6) zs.push(z);

    // Knee walls
    [
      [0, -LEN / 2, SPAN * 2, 0.12],
      [0, LEN / 2, SPAN * 2, 0.12],
    ].forEach(([x, z, w, d]) => {
      const k = new THREE.Mesh(new THREE.BoxGeometry(w, 0.45, d), knee);
      k.position.set(x, 0.33, z);
      k.castShadow = k.receiveShadow = true;
      gh.add(k);
    });
    [X0, X1].forEach((x) => {
      const k = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.45, LEN), knee);
      k.position.set(x, 0.33, 0);
      k.castShadow = k.receiveShadow = true;
      gh.add(k);
    });

    // Posts, gutters, rafters, ridges
    const ridgeXs = [X0 + SPAN / 2, X1 - SPAN / 2];
    zs.forEach((z) => {
      [X0, 0, X1].forEach((x) => gh.add(beam(V(x, 0.1, z), V(x, EAVE, z), 0.08, alu)));
      ridgeXs.forEach((rx) => {
        gh.add(beam(V(rx - SPAN / 2, EAVE, z), V(rx, RIDGE, z), 0.06, alu));
        gh.add(beam(V(rx + SPAN / 2, EAVE, z), V(rx, RIDGE, z), 0.06, alu));
      });
      // Truss tie
      gh.add(beam(V(X0, EAVE - 0.05, z), V(X1, EAVE - 0.05, z), 0.04, alu));
    });
    [X0, 0, X1].forEach((x) => gh.add(beam(V(x, EAVE, -LEN / 2), V(x, EAVE, LEN / 2), 0.1, alu)));
    ridgeXs.forEach((rx) => gh.add(beam(V(rx, RIDGE, -LEN / 2), V(rx, RIDGE, LEN / 2), 0.07, alu)));

    // Glass walls
    [X0, X1].forEach((x) => gh.add(quad(V(x, 0.55, -LEN / 2), V(x, 0.55, LEN / 2), V(x, EAVE, LEN / 2), V(x, EAVE, -LEN / 2), glass)));
    [-LEN / 2, LEN / 2].forEach((z) => {
      gh.add(quad(V(X0, 0.55, z), V(X1, 0.55, z), V(X1, EAVE, z), V(X0, EAVE, z), glass));
      ridgeXs.forEach((rx) => gh.add(tri(V(rx - SPAN / 2, EAVE, z), V(rx + SPAN / 2, EAVE, z), V(rx, RIDGE, z), glass)));
    });

    // Roof glass (fixed slopes) + hinged ridge vents on the right-hand slope of each span
    const VENT_FRAC = 0.42; // portion of slope that opens
    const vents: THREE.Group[] = [];
    ridgeXs.forEach((rx) => {
      // left slope — fixed
      gh.add(quad(V(rx - SPAN / 2, EAVE, -LEN / 2), V(rx - SPAN / 2, EAVE, LEN / 2), V(rx, RIDGE, LEN / 2), V(rx, RIDGE, -LEN / 2), glass));
      // right slope — fixed lower part
      const ex = rx + SPAN / 2;
      const midX = rx + (SPAN / 2) * VENT_FRAC;
      const midY = RIDGE - (RIDGE - EAVE) * VENT_FRAC;
      gh.add(quad(V(ex, EAVE, -LEN / 2), V(ex, EAVE, LEN / 2), V(midX, midY, LEN / 2), V(midX, midY, -LEN / 2), glass));
      // vents: pivot at ridge
      const segs = 3;
      for (let s = 0; s < segs; s++) {
        const z0 = -LEN / 2 + (s * LEN) / segs + 0.15;
        const z1 = -LEN / 2 + ((s + 1) * LEN) / segs - 0.15;
        const pivot = new THREE.Group();
        pivot.position.set(rx, RIDGE, 0);
        const local = (x: number, y: number, z: number) => V(x - rx, y - RIDGE, z);
        pivot.add(quad(local(rx, RIDGE, z0), local(rx, RIDGE, z1), local(midX, midY, z1), local(midX, midY, z0), glass));
        pivot.add(beam(local(midX, midY, z0), local(midX, midY, z1), 0.05, alu));
        pivot.add(beam(local(rx, RIDGE, z0), local(midX, midY, z0), 0.04, alu));
        pivot.add(beam(local(rx, RIDGE, z1), local(midX, midY, z1), 0.04, alu));
        gh.add(pivot);
        vents.push(pivot);
      }
    });

    // Door frame on the front gable
    gh.add(beam(V(-0.55, 0.1, LEN / 2 + 0.02), V(-0.55, 2.2, LEN / 2 + 0.02), 0.07, alu));
    gh.add(beam(V(0.55, 0.1, LEN / 2 + 0.02), V(0.55, 2.2, LEN / 2 + 0.02), 0.07, alu));
    gh.add(beam(V(-0.55, 2.2, LEN / 2 + 0.02), V(0.55, 2.2, LEN / 2 + 0.02), 0.07, alu));

    /* Shade screen (slides along the eaves) -------------------------- */
    const shadeMat = new THREE.MeshStandardMaterial({
      color: "#3f5a55", transparent: true, opacity: 0.62, side: THREE.DoubleSide, roughness: 1, depthWrite: false,
    });
    const shadeGeo = new THREE.PlaneGeometry(SPAN * 2 - 0.2, LEN - 0.2);
    shadeGeo.translate(0, -(LEN - 0.2) / 2, 0); // anchor at the back edge
    const shadeScreen = new THREE.Mesh(shadeGeo, shadeMat);
    shadeScreen.rotation.x = -Math.PI / 2;
    shadeScreen.position.set(0, EAVE - 0.12, -LEN / 2 + 0.1);
    shadeScreen.scale.y = 0.001;
    gh.add(shadeScreen);

    /* Crops --------------------------------------------------------- */
    const bedMat = new THREE.MeshStandardMaterial({ color: "#6b4a32", roughness: 1 });
    const dryBed = new THREE.Color("#7a5a3e");
    const wetBed = new THREE.Color("#3f2a1c");
    const pipeMat = new THREE.MeshStandardMaterial({ color: "#1b1f1f", roughness: 0.6 });
    const ROW_LEN = LEN - 1.6;
    const rowXs = [X0 + 0.9, X0 + 2.1, X0 + 3.3, 0.9, 2.1, 3.3];
    const drippers: THREE.Vector3[] = [];

    rowXs.forEach((x) => {
      const bed = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.18, ROW_LEN), bedMat);
      bed.position.set(x, 0.21, 0);
      bed.receiveShadow = true;
      bed.castShadow = true;
      gh.add(bed);
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, ROW_LEN, 6), pipeMat);
      pipe.rotation.x = Math.PI / 2;
      pipe.position.set(x, 0.33, 0);
      gh.add(pipe);
      for (let z = -ROW_LEN / 2 + 0.3; z < ROW_LEN / 2; z += 0.45) drippers.push(V(x, 0.33, z));
    });
    // Header pipe feeding the rows
    gh.add(beam(V(X0 + 0.6, 0.33, -ROW_LEN / 2 - 0.2), V(X1 - 0.6, 0.33, -ROW_LEN / 2 - 0.2), 0.05, pipeMat));

    // Left span: tall tomato vines on strings
    const leafGeo = bentPlane(0.6, 0.72, -0.25, 6);
    const tomatoRows = rowXs.slice(0, 3);
    const vineLeaves: THREE.Matrix4[] = [];
    const vineLeafColors: THREE.Color[] = [];
    const fruits: THREE.Matrix4[] = [];
    const stems: THREE.Matrix4[] = [];
    const d = new THREE.Object3D();
    tomatoRows.forEach((x) => {
      for (let z = -ROW_LEN / 2 + 0.35; z < ROW_LEN / 2; z += 0.55) {
        const h = 1.6 + rand() * 0.5;
        d.position.set(x, 0.3 + h / 2, z);
        d.rotation.set(0, 0, 0);
        d.scale.set(1, h, 1);
        d.updateMatrix();
        stems.push(d.matrix.clone());
        for (let k = 0; k < 14; k++) {
          const y = 0.45 + (k / 14) * h + rand() * 0.1;
          d.position.set(x + (rand() - 0.5) * 0.06, y, z + (rand() - 0.5) * 0.06);
          d.rotation.set(-0.7 - rand() * 0.6, rand() * Math.PI * 2, 0, "YXZ");
          const s = 0.8 + rand() * 0.4 - (k / 14) * 0.3;
          d.scale.setScalar(s);
          d.updateMatrix();
          vineLeaves.push(d.matrix.clone());
          vineLeafColors.push(new THREE.Color().setHSL(0.26 + rand() * 0.05, 0.5, 0.3 + rand() * 0.1));
        }
        for (let f = 0; f < 3; f++) {
          if (rand() > 0.7) continue;
          d.position.set(x + (rand() - 0.5) * 0.28, 0.6 + rand() * 0.9, z + (rand() - 0.5) * 0.28);
          d.rotation.set(0, 0, 0);
          d.scale.setScalar(0.07 + rand() * 0.03);
          d.updateMatrix();
          fruits.push(d.matrix.clone());
        }
      }
      // support wire + strings
      gh.add(beam(V(x, 2.45, -ROW_LEN / 2), V(x, 2.45, ROW_LEN / 2), 0.015, alu));
    });
    const stemInst = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.018, 0.025, 1, 5),
      new THREE.MeshStandardMaterial({ color: "#4f6e35" }),
      stems.length,
    );
    stems.forEach((m, i) => stemInst.setMatrixAt(i, m));
    gh.add(stemInst);
    const leafInst = new THREE.InstancedMesh(
      leafGeo,
      new THREE.MeshStandardMaterial({ map: leafTexture("compound", rand), alphaTest: 0.3, side: THREE.DoubleSide, roughness: 0.7 }),
      vineLeaves.length,
    );
    vineLeaves.forEach((m, i) => {
      leafInst.setMatrixAt(i, m);
      leafInst.setColorAt(i, vineLeafColors[i]);
    });
    leafInst.castShadow = true;
    gh.add(leafInst);
    const fruitInst = new THREE.InstancedMesh(
      new THREE.SphereGeometry(1, 12, 10),
      new THREE.MeshStandardMaterial({ color: "#d9452b", roughness: 0.35 }),
      fruits.length,
    );
    fruits.forEach((m, i) => {
      fruitInst.setMatrixAt(i, m);
      if (rand() > 0.6) fruitInst.setColorAt(i, new THREE.Color("#e8a23a"));
      else fruitInst.setColorAt(i, new THREE.Color("#d9452b"));
    });
    gh.add(fruitInst);

    // Right span: leafy greens (rosettes)
    const greensRows = rowXs.slice(3);
    const rosettes: THREE.Matrix4[] = [];
    const rosetteColors: THREE.Color[] = [];
    greensRows.forEach((x) => {
      for (let z = -ROW_LEN / 2 + 0.2; z < ROW_LEN / 2; z += 0.3)
        for (const dx of [-0.13, 0.13]) {
          d.position.set(x + dx, 0.36, z + (rand() - 0.5) * 0.05);
          d.rotation.set(0, rand() * 6, 0);
          const s = 0.55 + rand() * 0.25;
          d.scale.setScalar(s * 1.25);
          d.updateMatrix();
          rosettes.push(d.matrix.clone());
          rosetteColors.push(new THREE.Color().setHSL(0.23 + rand() * 0.06, 0.62, 0.3 + rand() * 0.1));
        }
    });
    const rosetteInst = new THREE.InstancedMesh(
      lettuceGeometry(rand),
      new THREE.MeshStandardMaterial({ roughness: 0.55, side: THREE.DoubleSide }),
      rosettes.length,
    );
    rosettes.forEach((m, i) => {
      rosetteInst.setMatrixAt(i, m);
      rosetteInst.setColorAt(i, rosetteColors[i]);
    });
    rosetteInst.castShadow = true;
    gh.add(rosetteInst);

    /* Yellow sticky traps (pest monitoring) over the tomato rows ---- */
    const trapMat = new THREE.MeshStandardMaterial({ color: "#f5d90a", emissive: "#4a4000", roughness: 0.5, side: THREE.DoubleSide });
    tomatoRows.forEach((x, ri) => {
      for (let z = -ROW_LEN / 2 + 1 + ri * 0.4; z < ROW_LEN / 2; z += 2.4) {
        const trap = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.24), trapMat);
        trap.position.set(x + 0.18, 2.05, z);
        trap.rotation.y = Math.PI / 2;
        gh.add(trap);
        gh.add(beam(V(x + 0.18, 2.17, z), V(x + 0.18, 2.45, z), 0.006, pipeMat));
      }
    });

    /* A grower harvesting in the aisle ------------------------------ */
    {
      const g = new THREE.Group();
      const shirt = new THREE.MeshStandardMaterial({ color: "#2f8f4e", roughness: 0.8 });
      const pants = new THREE.MeshStandardMaterial({ color: "#26302b", roughness: 0.8 });
      const skin = new THREE.MeshStandardMaterial({ color: "#b98663", roughness: 0.7 });
      [-0.08, 0.08].forEach((lx) => {
        const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.45, 4, 8), pants);
        leg.position.set(lx, 0.32, 0);
        g.add(leg);
      });
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.42, 4, 12), shirt);
      body.position.y = 0.98;
      g.add(body);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), skin);
      head.position.y = 1.5;
      g.add(head);
      const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 20), new THREE.MeshStandardMaterial({ color: "#e9dcc0" }));
      hat.position.y = 1.6;
      g.add(hat);
      const crown = new THREE.Mesh(new THREE.SphereGeometry(0.115, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), hat.material);
      crown.position.y = 1.6;
      g.add(crown);
      [-1, 1].forEach((side) => {
        const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.38, 4, 8), shirt);
        arm.position.set(side * 0.21, 1.05, 0.12);
        arm.rotation.x = -0.8;
        g.add(arm);
      });
      const crate = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.3), new THREE.MeshStandardMaterial({ color: "#e4572e", roughness: 0.6 }));
      crate.position.set(0, 0.85, 0.32);
      g.add(crate);
      for (let i = 0; i < 6; i++) {
        const t = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), fruitInst.material);
        t.position.set(-0.13 + (i % 3) * 0.13, 0.96, 0.26 + Math.floor(i / 3) * 0.1);
        g.add(t);
      }
      g.traverse((o) => ((o as THREE.Mesh).isMesh && (o.castShadow = true)));
      g.position.set((tomatoRows[0] + tomatoRows[1]) / 2, 0.12, 1.2);
      g.rotation.y = -Math.PI / 2 + 0.4;
      gh.add(g);
    }

    /* Grow lights (visible at night) -------------------------------- */
    const lampMat = new THREE.MeshStandardMaterial({ color: "#2b2b2b", emissive: "#ffb46b", emissiveIntensity: 0 });
    const lampLights: THREE.PointLight[] = [];
    ridgeXs.forEach((rx) => {
      for (let i = 0; i < 4; i++) {
        const z = -LEN / 2 + 1.4 + i * ((LEN - 2.8) / 3);
        const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.25), lampMat);
        lamp.position.set(rx, EAVE - 0.3, z);
        gh.add(lamp);
      }
      const pl = new THREE.PointLight("#ffbf80", 0, 9, 1.4);
      pl.position.set(rx, EAVE - 0.5, 0);
      gh.add(pl);
      lampLights.push(pl);
    });

    /* Circulation fans --------------------------------------------- */
    const fanBlades: THREE.Group[] = [];
    const fanMat = new THREE.MeshStandardMaterial({ color: "#4a5559", metalness: 0.4, roughness: 0.4 });
    ridgeXs.forEach((rx) =>
      [-LEN / 4, LEN / 4].forEach((z) => {
        const g = new THREE.Group();
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.035, 8, 28), fanMat);
        g.add(ring);
        const blades = new THREE.Group();
        for (let b = 0; b < 4; b++) {
          const bl = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.28, 0.015), fanMat);
          bl.position.y = 0.15;
          const holder = new THREE.Group();
          holder.rotation.z = (b * Math.PI) / 2;
          holder.add(bl);
          blades.add(holder);
        }
        g.add(blades);
        fanBlades.push(blades);
        g.position.set(rx, EAVE - 0.35, z);
        gh.add(g);
      }),
    );

    /* Particles: water drips + airflow ------------------------------ */
    const sprite = sporeSprite();
    const dripGeo = new THREE.BufferGeometry();
    const dp = new Float32Array(drippers.length * 3);
    const dPhase = drippers.map(() => rand());
    drippers.forEach((p, i) => dp.set([p.x, p.y, p.z], i * 3));
    dripGeo.setAttribute("position", new THREE.BufferAttribute(dp, 3));
    const dripMat = new THREE.PointsMaterial({ size: 0.09, map: sprite, color: "#7cc7ff", transparent: true, opacity: 0, depthWrite: false });
    const drips = new THREE.Points(dripGeo, dripMat);
    gh.add(drips);

    const AIR = coarse ? 120 : 220;
    const airGeo = new THREE.BufferGeometry();
    const ap = new Float32Array(AIR * 3);
    for (let i = 0; i < AIR; i++) {
      ap[i * 3] = X0 + 0.3 + rand() * (SPAN * 2 - 0.6);
      ap[i * 3 + 1] = 0.6 + rand() * 2.6;
      ap[i * 3 + 2] = (rand() - 0.5) * LEN;
    }
    airGeo.setAttribute("position", new THREE.BufferAttribute(ap, 3));
    const airMat = new THREE.PointsMaterial({ size: 0.07, map: sprite, color: "#ffffff", transparent: true, opacity: 0, depthWrite: false });
    const air = new THREE.Points(airGeo, airMat);
    gh.add(air);

    // Warm air escaping through open vents
    const HEAT = 70;
    const heatGeo = new THREE.BufferGeometry();
    const hp = new Float32Array(HEAT * 3);
    for (let i = 0; i < HEAT; i++) {
      const rx = ridgeXs[i % 2];
      hp[i * 3] = rx + 0.4 + rand() * 0.6;
      hp[i * 3 + 1] = RIDGE + rand() * 2;
      hp[i * 3 + 2] = (rand() - 0.5) * (LEN - 1);
    }
    heatGeo.setAttribute("position", new THREE.BufferAttribute(hp, 3));
    const heatMat = new THREE.PointsMaterial({ size: 0.16, map: sprite, color: "#ffd9a8", transparent: true, opacity: 0, depthWrite: false });
    const heat = new THREE.Points(heatGeo, heatMat);
    gh.add(heat);

    /* Outside: water tank, control box, trees ----------------------- */
    {
      const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 2.2, 32), new THREE.MeshStandardMaterial({ color: "#2f8f4e", roughness: 0.5 }));
      tank.position.set(X0 - 2.2, 1.1, -LEN / 2 + 1.5);
      tank.castShadow = true;
      world.add(tank);
      const lid = new THREE.Mesh(new THREE.ConeGeometry(0.95, 0.3, 32), new THREE.MeshStandardMaterial({ color: "#24713d" }));
      lid.position.set(X0 - 2.2, 2.35, -LEN / 2 + 1.5);
      world.add(lid);
      world.add(beam(V(X0 - 1.3, 0.25, -LEN / 2 + 1.5), V(X0, 0.25, -LEN / 2 + 1.5), 0.08, pipeMat));

      const panel = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.2), new THREE.MeshStandardMaterial({ color: "#eceeed", roughness: 0.4 }));
      panel.position.set(X1 + 0.25, 1.3, LEN / 2 - 0.8);
      panel.castShadow = true;
      world.add(panel);
      const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(0.32, 0.2),
        new THREE.MeshStandardMaterial({ color: "#0e2a1f", emissive: "#3fd1a8", emissiveIntensity: 0.6 }),
      );
      screen.rotation.y = Math.PI / 2;
      screen.position.set(X1 + 0.51, 1.4, LEN / 2 - 0.8);
      world.add(screen);

      const trunkMat = new THREE.MeshStandardMaterial({ color: "#6b4a33" });
      const leafMat = new THREE.MeshStandardMaterial({ color: "#4f7a43", flatShading: true, roughness: 0.9 });
      [
        [-11, -6, 1.2], [-12.5, 2, 1.0], [11.5, -7, 1.3], [12, 3.5, 0.9], [-9, 10, 0.8], [8, -12, 1.1],
      ].forEach(([x, z, s]) => {
        const t = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * s, 0.16 * s, 1.2 * s, 6), trunkMat);
        t.position.set(x, 0.6 * s, z);
        t.castShadow = true;
        world.add(t);
        const c = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1 * s, 0), leafMat);
        c.position.set(x, 1.9 * s, z);
        c.scale.y = 1.2;
        c.castShadow = true;
        world.add(c);
      });
    }

    /* Controls ------------------------------------------------------ */
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.rotateSpeed = 0.5;
    controls.minPolarAngle = Math.PI * 0.18;
    controls.maxPolarAngle = Math.PI * 0.44;
    controls.target.set(0, 0.7, 0);
    controls.autoRotate = !reduceMotion;
    controls.autoRotateSpeed = 0.35;
    controls.enabled = !coarse; // keep touch scrolling smooth on phones
    const stopAuto = () => (controls.autoRotate = false);
    controls.addEventListener("start", stopAuto);
    renderer.domElement.style.cursor = coarse ? "" : "grab";

    /* Sizing -------------------------------------------------------- */
    const resize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / h;
      camera.zoom = THREE.MathUtils.clamp((w / h) / 1.5, 0.5, 1.05);
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    /* Animated state ------------------------------------------------ */
    const cur = { vents: 0, shade: 0, water: 0, fans: 0, night: 0 };
    const target = () => {
      const s = stateRef.current;
      return { vents: +s.vents, shade: +s.shade, water: +s.irrigation, fans: +s.fans, night: +s.night };
    };
    const daySky = new THREE.Color("#fff8ec"), nightSky = new THREE.Color("#5b6fa8");
    const dayGround = new THREE.Color("#7d8f6a"), nightGround = new THREE.Color("#1e2433");

    let visible = false;
    let raf = 0;
    let running = false;
    const clock = new THREE.Timer();
    let fanAngle = 0;

    const tick = () => {
      if (!visible || document.hidden) {
        running = false;
        return;
      }
      clock.update();
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.getElapsed();
      const tg = target();
      const k = reduceMotion ? 1 : 1 - Math.pow(0.02, dt); // smooth approach
      (Object.keys(cur) as (keyof typeof cur)[]).forEach((key) => (cur[key] += (tg[key] - cur[key]) * k));

      vents.forEach((v) => (v.rotation.z = cur.vents * 0.55)); // lift the outer edge
      shadeScreen.scale.y = Math.max(0.001, cur.shade);
      bedMat.color.copy(dryBed).lerp(wetBed, cur.water);
      dripMat.opacity = cur.water * 0.9;
      airMat.opacity = cur.fans * 0.45;
      heatMat.opacity = cur.vents * (0.55 - cur.night * 0.3);

      // Day / night
      hemi.color.copy(daySky).lerp(nightSky, cur.night);
      hemi.groundColor.copy(dayGround).lerp(nightGround, cur.night);
      hemi.intensity = 0.95 - cur.night * 0.7;
      scene.environmentIntensity = 0.5 - cur.night * 0.42;
      (scene.fog as THREE.Fog).color.copy(dayFog).lerp(nightFog, cur.night);
      sun.intensity = 2.6 * (1 - cur.night) * (1 - cur.shade * 0.25);
      moon.intensity = cur.night * 0.5;
      lampMat.emissiveIntensity = cur.night * 3;
      lampLights.forEach((l) => (l.intensity = cur.night * 14));
      renderer.toneMappingExposure = 1 - cur.night * 0.15;

      if (!reduceMotion) {
        fanAngle += dt * cur.fans * 18;
        fanBlades.forEach((b) => (b.rotation.z = fanAngle));

        if (cur.water > 0.02) {
          const p = dripGeo.attributes.position as THREE.BufferAttribute;
          drippers.forEach((d0, i) => {
            const ph = (t * 0.9 + dPhase[i]) % 1;
            p.setY(i, d0.y - ph * 0.15);
          });
          p.needsUpdate = true;
        }
        if (cur.fans > 0.02) {
          const p = airGeo.attributes.position as THREE.BufferAttribute;
          for (let i = 0; i < AIR; i++) {
            let z = p.getZ(i) + dt * cur.fans * (1.4 + (i % 4) * 0.3);
            if (z > LEN / 2 - 0.2) z = -LEN / 2 + 0.2;
            p.setZ(i, z);
          }
          p.needsUpdate = true;
        }
        if (cur.vents > 0.02) {
          const p = heatGeo.attributes.position as THREE.BufferAttribute;
          for (let i = 0; i < HEAT; i++) {
            let y = p.getY(i) + dt * (0.5 + (i % 3) * 0.2);
            if (y > RIDGE + 2.4) y = RIDGE - 0.1;
            p.setY(i, y);
          }
          p.needsUpdate = true;
        }
      }

      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };

    function start() {
      if (running || !visible) return;
      running = true;
      raf = requestAnimationFrame(tick);
    }
    kickRef.current = start;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
    }, { threshold: 0.05 });
    io.observe(mount);
    const onVis = () => !document.hidden && start();
    document.addEventListener("visibilitychange", onVis);
    mount.dataset.ready = "true";

    return () => {
      cancelAnimationFrame(raf);
      kickRef.current = () => {};
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
      ro.disconnect();
      controls.removeEventListener("start", stopAuto);
      controls.dispose();
      disposeObject(scene);
      envTex.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mountRef} className={`scene-fade relative ${className ?? ""}`} />;
}
