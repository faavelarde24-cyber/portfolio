import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { keycaps } from '../content/tools';
import type { Theme } from '../hooks/useTheme';
import { usePrefersReducedMotion } from '../hooks/useReducedMotion';

const COLS = 6;
const ROWS = 3;

type Palette = {
  plate: number;
  cap: number;
  hemi: number;
  ground: number;
  key: number;
  shadow: number;
};

const THEMES: Record<Theme, Palette> = {
  light: { plate: 0x2b3035, cap: 0xf4f4f5, hemi: 0xffffff, ground: 0xc7ccd2, key: 2.7, shadow: 0.2 },
  dark: { plate: 0x1c2024, cap: 0xe9eaec, hemi: 0x2c3339, ground: 0x0e1013, key: 2.4, shadow: 0.45 },
};

type Cut = { canvas: HTMLCanvasElement; x: number; y: number; w: number; h: number };

/** Crop an image's white / transparent margin so the mark fills the cap. */
function trim(img: HTMLImageElement): Cut {
  const max = 512;
  const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * s));
  const h = Math.max(1, Math.round(img.naturalHeight * s));
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const x = c.getContext('2d', { willReadFrequently: true })!;
  x.drawImage(img, 0, 0, w, h);
  let d: Uint8ClampedArray;
  try {
    d = x.getImageData(0, 0, w, h).data;
  } catch {
    return { canvas: c, x: 0, y: 0, w, h };
  }
  let x0 = w;
  let y0 = h;
  let x1 = -1;
  let y1 = -1;
  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const i = (py * w + px) * 4;
      if (d[i + 3] < 24) continue;
      if (d[i] > 242 && d[i + 1] > 242 && d[i + 2] > 242) continue;
      if (px < x0) x0 = px;
      if (px > x1) x1 = px;
      if (py < y0) y0 = py;
      if (py > y1) y1 = py;
    }
  }
  if (x1 < 0) return { canvas: c, x: 0, y: 0, w, h };
  const pad = 2;
  x0 = Math.max(0, x0 - pad);
  y0 = Math.max(0, y0 - pad);
  x1 = Math.min(w - 1, x1 + pad);
  y1 = Math.min(h - 1, y1 + pad);
  return { canvas: c, x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

/** Draw a trimmed mark onto a cap-coloured square, contained with margin. */
function capTexture(cut: Cut | null, capColor: number) {
  const S = 256;
  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  const x = c.getContext('2d')!;
  x.fillStyle = '#' + capColor.toString(16).padStart(6, '0');
  x.fillRect(0, 0, S, S);
  if (cut) {
    const box = S * 0.76;
    const k = Math.min(box / cut.w, box / cut.h);
    const dw = cut.w * k;
    const dh = cut.h * k;
    // Multiply keeps any residual white ground from printing a bright square.
    x.globalCompositeOperation = 'multiply';
    x.drawImage(cut.canvas, cut.x, cut.y, cut.w, cut.h, (S - dw) / 2, (S - dh) / 2, dw, dh);
    x.globalCompositeOperation = 'source-over';
  }
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 8;
  return t;
}

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2 + r, -h / 2);
  s.lineTo(w / 2 - r, -h / 2);
  s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  s.lineTo(w / 2, h / 2 - r);
  s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  s.lineTo(-w / 2 + r, h / 2);
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  s.lineTo(-w / 2, -h / 2 + r);
  s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  return s;
}

/** A rounded slab extruded along Y, optionally tapered toward the top. */
function slabGeometry(w: number, d: number, h: number, r: number, taper: number) {
  const g = new THREE.ExtrudeGeometry(roundedRect(w, d, r), {
    depth: h,
    bevelEnabled: true,
    bevelThickness: h * 0.16,
    bevelSize: r * 0.34,
    bevelSegments: 2,
    curveSegments: 5,
  });
  g.rotateX(-Math.PI / 2);
  g.center();

  // ExtrudeGeometry UVs come straight from shape coordinates; remap them to
  // 0..1 so the logo texture lands squarely on the cap face.
  const p = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / w + 0.5, 0.5 - p.getZ(i) / d);
  uv.needsUpdate = true;

  if (taper) {
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i);
      if (y < min) min = y;
      if (y > max) max = y;
    }
    for (let i = 0; i < p.count; i++) {
      const k = 1 - taper * ((p.getY(i) - min) / (max - min));
      p.setX(i, p.getX(i) * k);
      p.setZ(i, p.getZ(i) * k);
    }
    p.needsUpdate = true;
    g.computeVertexNormals();
  }
  return g;
}

const ARIA =
  'Interactive three-dimensional macro pad. Its eighteen keycaps carry the logos of the tools Franz works in: ' +
  keycaps.map((k) => k.label).join(', ') +
  '. Drag or use the arrow keys to rotate it; click a key to press it.';

type CapMesh = THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial[]> & {
  userData: { label: string; cut: Cut | null; press: number };
};

/**
 * The single 3D moment on the site: a macro pad whose keycaps carry the logos of
 * the stack. Drag or arrow-key to rotate, click a cap to press it. It drifts
 * slowly when idle; under prefers-reduced-motion the drift is off and the object
 * stays still until the visitor moves it.
 */
export function HeroKeypad({ theme }: { theme: Theme }) {
  const host = useRef<HTMLDivElement>(null);
  const applyTheme = useRef<((p: Palette) => void) | null>(null);
  const reduced = usePrefersReducedMotion();
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  /** The hovered or last-pressed key, mirrored into the visible caption. */
  const [readout, setReadout] = useState<string | null>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let pal = THEMES.light;

    const canvas = document.createElement('canvas');
    canvas.tabIndex = 0;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', ARIA);
    Object.assign(canvas.style, {
      display: 'block',
      width: '100%',
      height: '100%',
      cursor: 'grab',
      outlineOffset: '2px',
      touchAction: 'none',
    });
    el.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'low-power',
    });
    renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio || 1, 1), 1.8));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 9.4, 14.2);
    camera.lookAt(0, 0, 0);

    const rig = new THREE.Group();
    scene.add(rig);

    const CAP = 0.92;
    const PITCH = 1.06;
    const REST_Y = 0.46;
    const PRESS_Y = 0.3;

    const plateMat = new THREE.MeshStandardMaterial({ color: pal.plate, roughness: 0.68, metalness: 0.1 });
    const plate = new THREE.Mesh(
      slabGeometry(COLS * PITCH + 0.5, ROWS * PITCH + 0.5, 0.52, 0.16, 0),
      plateMat,
    );
    plate.castShadow = true;
    plate.receiveShadow = true;
    rig.add(plate);

    const capGeo = slabGeometry(CAP, CAP, 0.46, 0.12, 0.16);
    const caps: CapMesh[] = [];
    const images: HTMLImageElement[] = [];

    keycaps.forEach((k, i) => {
      const top = new THREE.MeshStandardMaterial({
        map: capTexture(null, pal.cap),
        roughness: 0.5,
        metalness: 0.04,
      });
      top.toneMapped = false; // keep each mark's brand colour, unfiltered
      const side = new THREE.MeshStandardMaterial({ color: pal.cap, roughness: 0.58, metalness: 0.04 });
      // ExtrudeGeometry groups: 0 = cap faces (top + bottom), 1 = walls.
      const mesh: CapMesh = Object.assign(new THREE.Mesh(capGeo, [top, side]), {
      userData: { label: k.label, cut: null as Cut | null, press: 0 },
      });
      mesh.position.set(
        ((i % COLS) - (COLS - 1) / 2) * PITCH,
        REST_Y,
        (Math.floor(i / COLS) - (ROWS - 1) / 2) * PITCH,
      );
      mesh.castShadow = true;
      caps.push(mesh);
      rig.add(mesh);

      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        mesh.userData.cut = trim(img);
        top.map?.dispose();
        top.map = capTexture(mesh.userData.cut, pal.cap);
        top.needsUpdate = true;
      };
      img.src = k.src;
      images.push(img);
    });

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.ShadowMaterial({ opacity: pal.shadow }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.9;
    floor.receiveShadow = true;
    scene.add(floor);

    const key = new THREE.DirectionalLight(0xffffff, pal.key);
    key.position.set(3.4, 7.5, 4.6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 24;
    key.shadow.camera.left = -8;
    key.shadow.camera.right = 8;
    key.shadow.camera.top = 8;
    key.shadow.camera.bottom = -8;
    key.shadow.radius = 3;
    key.shadow.bias = -0.0007;
    scene.add(key);

    const rim = new THREE.DirectionalLight(0x9fb6cc, 0.85);
    rim.position.set(-5, 2.4, -3);
    scene.add(rim);

    const hemi = new THREE.HemisphereLight(pal.hemi, pal.ground, 0.9);
    scene.add(hemi);

    const render = () => renderer.render(scene, camera);

    applyTheme.current = (p) => {
      pal = p;
      plateMat.color.set(p.plate);
      caps.forEach((m) => {
        m.material[0].map?.dispose();
        m.material[0].map = capTexture(m.userData.cut, p.cap);
        m.material[0].needsUpdate = true;
        m.material[1].color.set(p.cap);
      });
      (floor.material as THREE.ShadowMaterial).opacity = p.shadow;
      key.intensity = p.key;
      hemi.color.set(p.hemi);
      hemi.groundColor.set(p.ground);
      render();
    };

    const resize = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      render();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const REST_RX = 0.62;
    const REST_RY = -0.32;
    let ry = REST_RY;
    let rx = REST_RX;
    let ty = REST_RY;
    let tx = REST_RX;
    let vy = 0;
    let dragging = false;
    let moved = 0;
    let lastX = 0;
    let lastY = 0;
    let idle = 0;
    rig.rotation.set(rx, ry, 0);
    resize();

    const clampX = (v: number) => Math.max(0.12, Math.min(1.16, v));
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();

    const pick = (e: PointerEvent): CapMesh | null => {
      const r = canvas.getBoundingClientRect();
      ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      ray.setFromCamera(ndc, camera);
      return (ray.intersectObjects(caps, false)[0]?.object as CapMesh) ?? null;
    };

    const onDown = (e: PointerEvent) => {
      dragging = true;
      moved = 0;
      idle = 0;
      vy = 0;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = 'grabbing';
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) {
        const hit = pick(e);
        canvas.style.cursor = hit ? 'pointer' : 'grab';
        setReadout(hit ? hit.userData.label : null);
        return;
      }
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      moved += Math.abs(dx) + Math.abs(dy);
      ty += dx * 0.008;
      tx = clampX(tx + dy * 0.005);
      vy = dx * 0.0006;
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      canvas.style.cursor = 'grab';
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        /* pointer already released */
      }
      // A click, not a drag: press the key under the cursor.
      if (moved < 6 && e.button === 0) {
        const hit = pick(e);
        if (hit) {
          hit.userData.press = 1;
          setReadout(hit.userData.label);
        }
      }
    };
    const onLeave = () => {
      if (!dragging) setReadout(null);
    };
    const onKey = (e: KeyboardEvent) => {
      const step = 0.14;
      if (e.key === 'ArrowLeft') ty -= step;
      else if (e.key === 'ArrowRight') ty += step;
      else if (e.key === 'ArrowUp') tx = clampX(tx - step * 0.6);
      else if (e.key === 'ArrowDown') tx = clampX(tx + step * 0.6);
      else if (e.key === 'Home' || e.key === 'Escape') {
        ty = REST_RY;
        tx = REST_RX;
      } else return;
      e.preventDefault();
      idle = 0;
      vy = 0;
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('keydown', onKey);

    let visible = true;
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
    });
    io.observe(el);

    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      if (!dragging) {
        if (Math.abs(vy) > 0.00005) {
          ty += vy;
          vy *= 0.94;
          idle = 0;
        } else if (!reducedRef.current) {
          idle = Math.min(idle + 1, 200);
          if (idle >= 60) ty += 0.0016;
        }
      }
      ry += (ty - ry) * 0.12;
      rx += (tx - rx) * 0.12;
      rig.rotation.y = ry;
      rig.rotation.x = rx;
      caps.forEach((m) => {
        const u = m.userData;
        if (u.press > 0.001 || m.position.y !== REST_Y) {
          u.press *= 0.86;
          if (u.press < 0.002) u.press = 0;
          m.position.y = REST_Y - (REST_Y - PRESS_Y) * u.press;
        }
      });
      render();
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('keydown', onKey);
      images.forEach((img) => {
        img.onload = null;
      });
      caps.forEach((m) =>
        m.material.forEach((mat) => {
          mat.map?.dispose();
          mat.dispose();
        }),
      );
      capGeo.dispose();
      plate.geometry.dispose();
      plateMat.dispose();
      floor.geometry.dispose();
      renderer.dispose();
      canvas.remove();
      applyTheme.current = null;
    };
  }, []);

  useEffect(() => {
    applyTheme.current?.(THEMES[theme]);
  }, [theme]);

  return (
    <>
      <div ref={host} className="absolute inset-0" />
      <span
        aria-live="polite"
        className="label absolute -bottom-6 left-0 whitespace-nowrap text-[12px] text-[color-mix(in_srgb,var(--color-text)_50%,transparent)]"
      >
        {readout ?? 'Drag to rotate · click a key'}
      </span>
    </>
  );
}
