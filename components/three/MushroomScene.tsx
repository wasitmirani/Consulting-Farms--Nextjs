"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  mulberry32, barkTexture, ringsTexture, gillsTexture, sporeSprite, STYLES, buildMushroom,
  addEnvironment, bentPlane, leafTexture, canvasTexture,
} from "@/lib/three-kit";


/* ------------------------------------------------------------------ */
/*  Scene                                                              */
/* ------------------------------------------------------------------ */

export default function MushroomScene({ className }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Bail out gracefully if WebGL is unavailable
    const probe = document.createElement("canvas");
    if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) {
      mount.dataset.ready = "none";
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const rand = mulberry32(786);

    /* Renderer ------------------------------------------------------ */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.style.outline = "none";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0.4, 3.0, 10.5);

    /* Lights -------------------------------------------------------- */
    const envTex = addEnvironment(renderer, scene, 0.45);
    scene.add(new THREE.HemisphereLight("#fff4dc", "#3d5a35", 0.7));
    const sun = new THREE.DirectionalLight("#ffe2b8", 2.6);
    sun.position.set(4, 8, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048);
    sun.shadow.camera.left = -5;
    sun.shadow.camera.right = 5;
    sun.shadow.camera.top = 5;
    sun.shadow.camera.bottom = -5;
    sun.shadow.bias = -0.0005;
    sun.shadow.radius = 4;
    scene.add(sun);
    const rim = new THREE.PointLight("#c9f08a", 22, 20);
    rim.position.set(-4, 3, -4);
    scene.add(rim);

    const world = new THREE.Group();
    scene.add(world);

    /* Ground: soft shadow catcher + moss disc ----------------------- */
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(6, 64),
      new THREE.ShadowMaterial({ opacity: 0.18 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    world.add(ground);

    const mossGeo = new THREE.CircleGeometry(3.2, 64);
    {
      const p = mossGeo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i);
        const a = Math.atan2(y, x);
        const s = 1 + 0.08 * Math.sin(a * 6) + 0.05 * Math.sin(a * 13);
        p.setXY(i, x * s, y * s * 0.75);
      }
    }
    const moss = new THREE.Mesh(
      mossGeo,
      new THREE.MeshStandardMaterial({ color: "#58764a", roughness: 1 }),
    );
    moss.rotation.x = -Math.PI / 2;
    moss.position.y = 0.005;
    moss.receiveShadow = true;
    world.add(moss);

    /* The log ------------------------------------------------------- */
    const LOG_R = 0.95;
    const LOG_L = 4.4;
    const logGeo = new THREE.CylinderGeometry(LOG_R, LOG_R * 1.04, LOG_L, 64, 16);
    {
      const p = logGeo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
        const a = Math.atan2(z, x);
        const r = Math.hypot(x, z);
        if (r < 0.01) continue;
        const d = 1 + 0.035 * Math.sin(a * 9 + y * 2.1) + 0.02 * Math.sin(a * 23 - y * 4) + 0.03 * Math.sin(y * 1.7);
        p.setX(i, x * d);
        p.setZ(i, z * d);
      }
      logGeo.computeVertexNormals();
    }
    const ringsTex = ringsTexture();
    const logMesh = new THREE.Mesh(logGeo, [
      new THREE.MeshStandardMaterial({ map: barkTexture(rand), roughness: 0.95, bumpScale: 0.02 }),
      new THREE.MeshStandardMaterial({ map: ringsTex, roughness: 0.8 }),
      new THREE.MeshStandardMaterial({ map: ringsTex, roughness: 0.8 }),
    ]);
    logMesh.rotation.z = Math.PI / 2;
    logMesh.rotation.y = -0.18;
    logMesh.position.y = LOG_R * 0.92;
    logMesh.castShadow = true;
    logMesh.receiveShadow = true;
    world.add(logMesh);

    // Moss tufts on the log
    const tuftMat = new THREE.MeshStandardMaterial({ color: "#5d7a43", roughness: 1 });
    const tuftGeo = new THREE.IcosahedronGeometry(0.1, 2);
    for (let i = 0; i < 10; i++) {
      const t = new THREE.Mesh(tuftGeo, tuftMat);
      const along = (rand() - 0.5) * LOG_L * 0.9;
      const ang = 0.3 + rand() * 1.4; // from the top round toward the camera
      // log-local coords (log axis = local Y, local +X = world up)
      t.position.set(Math.cos(ang) * LOG_R * 0.98, along, Math.sin(ang) * LOG_R * 0.98);
      t.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(t.position.x, 0, t.position.z).normalize(),
      );
      t.scale.set(0.8 + rand() * 0.8, 0.35, 0.8 + rand() * 0.8);
      t.castShadow = true;
      logMesh.add(t);
    }

    /* Mushrooms on the log ----------------------------------------- */
    const gillTex = gillsTexture("#efe3cf");
    type Shroom = { obj: THREE.Object3D; delay: number; target: number; sway: number };
    const shrooms: Shroom[] = [];

    const clusters: { x: number; spread: number; style: keyof typeof STYLES; n: number; size: number }[] = [
      { x: -1.45, spread: 0.45, style: "oyster", n: 5, size: 0.42 },
      { x: -0.35, spread: 0.5, style: "button", n: 6, size: 0.36 },
      { x: 0.75, spread: 0.45, style: "chestnut", n: 4, size: 0.46 },
      { x: 1.6, spread: 0.35, style: "shiitake", n: 3, size: 0.55 },
    ];

    clusters.forEach((c, ci) => {
      for (let i = 0; i < c.n; i++) {
        const size = c.size * (0.6 + rand() * 0.6) * (i === 0 ? 1.25 : 1);
        const m = buildMushroom(size, size * (0.9 + rand() * 0.9), STYLES[c.style], gillTex, rand);
        // Position on the log's upper surface (log axis runs along local Y)
        const along = c.x + (rand() - 0.5) * c.spread * 2;
        const ang = (rand() - 0.5) * 1.2; // around the top
        const pivot = new THREE.Group();
        // Log is rotated 90° about Z: log-local +X points world-up, local Y runs along the log.
        pivot.position.set(Math.cos(ang) * LOG_R * 0.96, -along, Math.sin(ang) * LOG_R * 0.96);
        // Orient outward from the axis: in log-local space the outward normal is (x,0,z)
        const normal = new THREE.Vector3(pivot.position.x, 0, pivot.position.z).normalize();
        pivot.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
        // Lean slightly for natural variation
        m.rotation.z = (rand() - 0.5) * 0.5;
        m.rotation.x = (rand() - 0.5) * 0.5;
        m.rotation.y = rand() * Math.PI * 2;
        pivot.add(m);
        logMesh.add(pivot);
        m.scale.setScalar(reduceMotion ? 1 : 0.0001);
        shrooms.push({ obj: m, delay: 0.25 + ci * 0.22 + i * 0.09, target: 1, sway: rand() * 10 });
      }
    });

    // A few mushrooms growing from the ground, for depth
    [
      { x: 2.7, z: 1.0, s: 0.5, st: "chestnut" as const },
      { x: 2.35, z: 1.45, s: 0.32, st: "button" as const },
      { x: -2.6, z: 0.9, s: 0.38, st: "button" as const },
      { x: -2.25, z: 1.35, s: 0.26, st: "oyster" as const },
    ].forEach((g, i) => {
      const m = buildMushroom(g.s, g.s * 1.6, STYLES[g.st], gillTex, rand);
      m.position.set(g.x, 0, g.z);
      m.rotation.z = (g.x > 0 ? -1 : 1) * 0.12;
      m.scale.setScalar(reduceMotion ? 1 : 0.0001);
      world.add(m);
      shrooms.push({ obj: m, delay: 1.2 + i * 0.12, target: 1, sway: rand() * 10 });
    });

    // Grass — curved, tapered blades with colour variation
    const BLADES = coarse ? 220 : 380;
    const bladeGeo = bentPlane(0.05, 0.62, 0.35, 5);
    const bladeMat = new THREE.MeshStandardMaterial({ roughness: 0.85, side: THREE.DoubleSide });
    const blades = new THREE.InstancedMesh(bladeGeo, bladeMat, BLADES);
    {
      const d = new THREE.Object3D();
      const c = new THREE.Color();
      for (let i = 0; i < BLADES; i++) {
        const a = rand() * Math.PI * 2;
        const r = 1.35 + Math.pow(rand(), 0.7) * 1.8;
        d.position.set(Math.cos(a) * r * 1.1, 0, Math.sin(a) * r * 0.72);
        d.rotation.set((rand() - 0.5) * 0.4, rand() * Math.PI * 2, (rand() - 0.5) * 0.4);
        d.scale.set(1, 0.45 + rand() * 1.0, 1);
        d.updateMatrix();
        blades.setMatrixAt(i, d.matrix);
        blades.setColorAt(i, c.setHSL(0.24 + rand() * 0.07, 0.45 + rand() * 0.2, 0.3 + rand() * 0.14));
      }
    }
    blades.castShadow = true;
    world.add(blades);

    // Ferns — curved fronds fanning out behind the log
    const fernTex = leafTexture("fern", rand);
    const fernMat = new THREE.MeshStandardMaterial({ map: fernTex, alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.75 });
    const frondGeo = bentPlane(0.55, 1.5, 0.45, 10);
    [
      { x: -2.1, z: -1.3, n: 7, s: 1.0 },
      { x: 2.2, z: -1.2, n: 6, s: 0.9 },
      { x: -3.0, z: 0.4, n: 5, s: 0.7 },
      { x: 3.1, z: 0.5, n: 5, s: 0.75 },
    ].forEach((f) => {
      const fern = new THREE.InstancedMesh(frondGeo, fernMat, f.n);
      const d = new THREE.Object3D();
      const c = new THREE.Color();
      for (let i = 0; i < f.n; i++) {
        d.position.set(0, 0, 0);
        d.rotation.set(-0.35 - rand() * 0.45, (i / f.n) * Math.PI * 2 + rand() * 0.4, 0, "YXZ");
        d.scale.setScalar(f.s * (0.75 + rand() * 0.45));
        d.updateMatrix();
        fern.setMatrixAt(i, d.matrix);
        fern.setColorAt(i, c.setHSL(0.27 + rand() * 0.04, 0.5, 0.3 + rand() * 0.08));
      }
      fern.position.set(f.x, 0, f.z);
      fern.castShadow = true;
      world.add(fern);
    });

    // Fallen leaves + pebbles scattered on the moss
    const fallenMat = new THREE.MeshStandardMaterial({ map: leafTexture("fallen", rand), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.9 });
    const fallen = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.22, 0.3), fallenMat, 26);
    const pebbles = new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(0.09, 1),
      new THREE.MeshStandardMaterial({ roughness: 0.7, flatShading: true }),
      22,
    );
    {
      const d = new THREE.Object3D();
      const c = new THREE.Color();
      for (let i = 0; i < 26; i++) {
        const a = rand() * Math.PI * 2, r = 1.2 + rand() * 1.8;
        d.position.set(Math.cos(a) * r * 1.1, 0.012 + i * 0.0004, Math.sin(a) * r * 0.7);
        d.rotation.set(-Math.PI / 2 + (rand() - 0.5) * 0.3, 0, rand() * Math.PI * 2);
        d.scale.setScalar(0.7 + rand() * 0.6);
        d.updateMatrix();
        fallen.setMatrixAt(i, d.matrix);
        fallen.setColorAt(i, c.setHSL(0.06 + rand() * 0.07, 0.6, 0.35 + rand() * 0.15));
      }
      for (let i = 0; i < 22; i++) {
        const a = rand() * Math.PI * 2, r = 1.3 + rand() * 1.9;
        d.position.set(Math.cos(a) * r * 1.1, 0.02, Math.sin(a) * r * 0.72);
        d.rotation.set(rand() * 3, rand() * 3, rand() * 3);
        const s = 0.5 + rand() * 1.1;
        d.scale.set(s, s * 0.55, s * 0.8);
        d.updateMatrix();
        pebbles.setMatrixAt(i, d.matrix);
        pebbles.setColorAt(i, c.setHSL(0.1, 0.06, 0.55 + rand() * 0.2));
      }
    }
    fallen.receiveShadow = true;
    pebbles.castShadow = pebbles.receiveShadow = true;
    world.add(fallen, pebbles);

    // Soft light shafts through the greenhouse roof
    const shaftTex = canvasTexture(64, 256, (ctx) => {
      const g = ctx.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, "rgba(255,244,214,0.9)");
      g.addColorStop(1, "rgba(255,244,214,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 64, 256);
      const h = ctx.createLinearGradient(0, 0, 64, 0);
      h.addColorStop(0, "rgba(0,0,0,1)");
      h.addColorStop(0.5, "rgba(0,0,0,0)");
      h.addColorStop(1, "rgba(0,0,0,1)");
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = h;
      ctx.fillRect(0, 0, 64, 256);
    });
    const shaftMat = new THREE.MeshBasicMaterial({
      map: shaftTex, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    const shafts: THREE.Mesh[] = [];
    [[-1.2, 0.55], [0.4, 0.4], [1.7, 0.5]].forEach(([x, w]) => {
      const s = new THREE.Mesh(new THREE.PlaneGeometry(w, 4.2), shaftMat);
      s.position.set(x, 2.3, 0.2);
      s.rotation.z = -0.32;
      world.add(s);
      shafts.push(s);
    });

    /* Greenhouse frame (nod to greenhouse consulting) --------------- */
    const frame = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: "#e9e2d2", roughness: 0.4, metalness: 0.3 });
    const archCurve = new THREE.EllipseCurve(0, 0, 3.9, 3.6, 0, Math.PI, false, 0);
    const archPts = archCurve.getPoints(48).map((p) => new THREE.Vector3(p.x, p.y, 0));
    const arch = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(archPts), 64, 0.025, 6, false);
    for (let i = 0; i < 4; i++) {
      const a = new THREE.Mesh(arch, frameMat);
      a.position.z = -2.4 + i * 1.3;
      a.position.y = 0;
      frame.add(a);
    }
    const purlinGeo = new THREE.CylinderGeometry(0.018, 0.018, 3.9, 6);
    purlinGeo.rotateX(Math.PI / 2);
    for (let k = 1; k < 8; k++) {
      const t = (k / 8) * Math.PI;
      const p = new THREE.Mesh(purlinGeo, frameMat);
      p.position.set(Math.cos(t) * 3.9, Math.sin(t) * 3.6, -0.45);
      frame.add(p);
    }
    const glass = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, 3.9, 48, 1, true, -Math.PI / 2, Math.PI),
      new THREE.MeshPhysicalMaterial({
        color: "#dff0d8",
        transparent: true,
        opacity: 0.08,
        roughness: 0.1,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    glass.scale.set(3.9, 1, 3.6);
    glass.rotation.x = -Math.PI / 2; // keep the upper half-cylinder
    glass.position.z = -0.45;
    frame.add(glass);
    frame.position.z = -0.6;
    frame.scale.setScalar(0.86);
    world.add(frame);

    /* Spores -------------------------------------------------------- */
    const SPORES = coarse ? 140 : 260;
    const sporeGeo = new THREE.BufferGeometry();
    const sp = new Float32Array(SPORES * 3);
    const sv = new Float32Array(SPORES);
    for (let i = 0; i < SPORES; i++) {
      sp[i * 3] = (rand() - 0.5) * 7;
      sp[i * 3 + 1] = rand() * 4.5;
      sp[i * 3 + 2] = (rand() - 0.5) * 4;
      sv[i] = 0.08 + rand() * 0.22;
    }
    sporeGeo.setAttribute("position", new THREE.BufferAttribute(sp, 3));
    const spores = new THREE.Points(
      sporeGeo,
      new THREE.PointsMaterial({
        size: 0.09,
        map: sporeSprite(),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        color: "#ffe7b0",
        sizeAttenuation: true,
      }),
    );
    world.add(spores);

    world.position.y = -1.0;

    /* Controls ------------------------------------------------------ */
    let controls: OrbitControls | null = null;
    if (!coarse) {
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.rotateSpeed = 0.6;
      controls.minPolarAngle = Math.PI * 0.28;
      controls.maxPolarAngle = Math.PI * 0.47;
      controls.minAzimuthAngle = -Math.PI * 0.45;
      controls.maxAzimuthAngle = Math.PI * 0.45;
      controls.autoRotate = !reduceMotion;
      controls.autoRotateSpeed = 0.5;
      controls.target.set(0, 0.5, 0);
      renderer.domElement.style.cursor = "grab";
      renderer.domElement.addEventListener("pointerdown", () => (renderer.domElement.style.cursor = "grabbing"));
      renderer.domElement.addEventListener("pointerup", () => (renderer.domElement.style.cursor = "grab"));
    }
    camera.lookAt(0, 0.5, 0);

    /* Sizing -------------------------------------------------------- */
    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / h;
      // Pull back on narrow viewports so the whole log stays in frame
      camera.zoom = w / h < 0.9 ? 0.62 : w / h < 1.2 ? 0.72 : 0.82;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    /* Loop (paused when off-screen / tab hidden) -------------------- */
    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
    });
    io.observe(mount);

    const clock = new THREE.Timer();
    let raf = 0;
    let running = false;
    const easeOutBack = (t: number) => {
      const c1 = 1.5, c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    };

    const tick = () => {
      if (!visible || document.hidden) {
        running = false;
        return;
      }
      clock.update();
      const t = clock.getElapsed();

      if (!reduceMotion) {
        for (const s of shrooms) {
          const p = THREE.MathUtils.clamp((t - s.delay) / 0.9, 0, 1);
          const k = p <= 0 ? 0.0001 : easeOutBack(p);
          s.obj.scale.setScalar(Math.max(k, 0.0001));
          s.obj.rotation.x = Math.sin(t * 0.8 + s.sway) * 0.025;
        }
        const pos = sporeGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < SPORES; i++) {
          let y = pos.getY(i) + sv[i] * 0.012;
          if (y > 4.8) y = 0.4;
          pos.setY(i, y);
          pos.setX(i, pos.getX(i) + Math.sin(t * 0.6 + i) * 0.0015);
        }
        pos.needsUpdate = true;
      }

      if (!reduceMotion) shaftMat.opacity = 0.16 + Math.sin(t * 0.6) * 0.06;
      controls?.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };

    function start() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    }
    const onVis = () => !document.hidden && start();
    document.addEventListener("visibilitychange", onVis);
    start();
    mount.dataset.ready = "true";

    /* Cleanup ------------------------------------------------------- */
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
      ro.disconnect();
      controls?.dispose();
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose();
        const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
        mats.forEach((m) => {
          Object.values(m).forEach((v) => v instanceof THREE.Texture && v.dispose());
          m.dispose();
        });
      });
      envTex.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mountRef} className={className} />;
}
