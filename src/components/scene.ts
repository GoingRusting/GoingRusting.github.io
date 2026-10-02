/* Dependency-free 3D on a 2D canvas: perspective projection, painter's sort,
   additive glow. Faithful port of the scenes in design-system/components/bundle.js.
   Colours come from CSS custom properties (--accent, --scene-hot, --ink,
   --surface-000), so a data-theme on any ancestor reskins the scene. */

import { startBlackHole } from './blackhole';

export type SceneKind = 'forge' | 'engine' | 'brain' | 'shader';
export interface SceneOptions { still?: boolean; density?: number; focusX?: number; focusY?: number; fill?: number; seed?: number; interactive?: boolean }

type RGB = number[];
type Vec = number[];
interface Colors { accent: RGB; hot: RGB; ink: RGB; bg: RGB; deep: RGB }
interface Par { x: number; y: number }
type Draw = (ctx: CanvasRenderingContext2D, t: number, W: number, H: number, col: Colors, par: Par, opt: SceneOptions) => void;

function parseColor(s: string, fb: RGB): RGB {
  s = (s || '').trim();
  if (!s) return fb;
  if (s[0] === '#') {
    let v = s.slice(1);
    if (v.length === 3 || v.length === 4) v = v.split('').map((c) => c + c).join('');
    const n = parseInt(v.slice(0, 6), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const m = s.match(/[\d.]+/g);
  return m && m.length >= 3 ? [+m[0], +m[1], +m[2]] : fb;
}
const rgba = (c: RGB, a: number) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${(a < 0 ? 0 : a > 1 ? 1 : a).toFixed(3)})`;
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
function rot(p: Vec, ay: number, ax: number, az?: number): Vec {
  let x = p[0], y = p[1], z = p[2], c, s, t;
  if (az) { c = Math.cos(az); s = Math.sin(az); t = x * c - y * s; y = x * s + y * c; x = t; }
  c = Math.cos(ay); s = Math.sin(ay); t = x * c + z * s; z = -x * s + z * c; x = t;
  c = Math.cos(ax); s = Math.sin(ax); t = y * c - z * s; z = y * s + z * c; y = t;
  return [x, y, z];
}
function rng(seed: number) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; }; }

/* -- forge: the extruded G mark ------------------------------------------ */
function strokeOutline(pts: Vec[], hw: number): Vec[] {
  const n = pts.length, L: Vec[] = [], R: Vec[] = [];
  const nrm = (a: Vec, b: Vec) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy); return [-dy / l, dx / l]; };
  for (let i = 0; i < n; i++) {
    if (i === 0 || i === n - 1) {
      const q = i === 0 ? nrm(pts[0], pts[1]) : nrm(pts[n - 2], pts[n - 1]);
      L.push([pts[i][0] + q[0] * hw, pts[i][1] + q[1] * hw]); R.push([pts[i][0] - q[0] * hw, pts[i][1] - q[1] * hw]);
    } else {
      const n1 = nrm(pts[i - 1], pts[i]), n2 = nrm(pts[i], pts[i + 1]);
      let m = [n1[0] + n2[0], n1[1] + n2[1]]; const ml = Math.hypot(m[0], m[1]); m = [m[0] / ml, m[1] / ml];
      const d = hw / (m[0] * n1[0] + m[1] * n1[1]);
      L.push([pts[i][0] + m[0] * d, pts[i][1] + m[1] * d]); R.push([pts[i][0] - m[0] * d, pts[i][1] - m[1] * d]);
    }
  }
  return L.concat(R.reverse());
}
function prism(outline: Vec[], z0: number, z1: number) {
  const front = outline.map((p) => [p[0] - 128, 128 - p[1], z0]);
  const back = outline.map((p) => [p[0] - 128, 128 - p[1], z1]);
  const sides: Vec[][] = [];
  for (let i = 0; i < outline.length; i++) {
    const j = (i + 1) % outline.length;
    sides.push([front[j], front[i], back[i], back[j]]);
  }
  return { front, back: back.slice().reverse(), sides };
}
function makeForge(): Draw {
  // Centre line + square caps of the G path "M220 32H92L36 88V168L92 224H220V128H152"
  const G = prism(strokeOutline([[235, 32], [92, 32], [36, 88], [36, 168], [92, 224], [220, 224], [220, 128], [137, 128]], 15), -18, 18);
  const CAP = prism([[186, 17], [220, 17], [220, 47], [186, 47]], -18.6, 18);
  const r = rng(7), sparks: { a: number; rad: number; y: number; sp: number; s: number; tw: number }[] = [];
  for (let i = 0; i < 70; i++) sparks.push({ a: r() * 6.283, rad: 150 + r() * 120, y: (r() - 0.5) * 220, sp: 0.08 + r() * 0.22, s: 0.6 + r() * 1.6, tw: r() * 6 });
  return (ctx, t, W, H, col, par, opt) => {
    const narrow = W < 760;
    const cxp = narrow ? W * 0.5 : W * (opt.focusX || 0.7), cyp = H * (narrow ? 0.3 : (opt.focusY || 0.46));
    const scale = Math.min(H * (opt.fill || 0.0026), W * (narrow ? 0.0026 : 0.0019));
    const cam = 900, f = 900;
    const yaw = Math.sin(t * 0.35) * 0.5 + par.x * 0.5 - 0.18, pitch = Math.sin(t * 0.27) * 0.1 + par.y * 0.25 - 0.08, roll = Math.sin(t * 0.21) * 0.03;
    const bob = Math.sin(t * 0.8) * 6;
    const P = (v: Vec): [number, number, number, Vec] => { const q = rot(v, yaw, pitch, roll); const z = q[2] * scale + cam; return [cxp + q[0] * scale * f / z, cyp - (q[1] + bob) * scale * f / z, z, q]; };

    // floor grid
    ctx.lineWidth = 1;
    const gy = -190;
    for (let gi = -8; gi <= 8; gi++) {
      const a1 = P([gi * 50, gy, -300]), a2 = P([gi * 50, gy, 500]);
      const gl = ctx.createLinearGradient(a1[0], a1[1], a2[0], a2[1]);
      gl.addColorStop(0, rgba(col.accent, 0.0)); gl.addColorStop(0.35, rgba(col.accent, 0.16)); gl.addColorStop(1, rgba(col.accent, 0));
      ctx.strokeStyle = gl; ctx.beginPath(); ctx.moveTo(a1[0], a1[1]); ctx.lineTo(a2[0], a2[1]); ctx.stroke();
    }
    for (let gz = -300; gz <= 500; gz += 50) {
      const b1 = P([-400, gy, gz]), b2 = P([400, gy, gz]);
      ctx.strokeStyle = rgba(col.accent, 0.13 * (1 - (gz + 300) / 800)); ctx.beginPath(); ctx.moveTo(b1[0], b1[1]); ctx.lineTo(b2[0], b2[1]); ctx.stroke();
    }
    // halo
    const c0 = P([0, 0, 0]);
    const hg = ctx.createRadialGradient(c0[0], c0[1], 0, c0[0], c0[1], 260 * scale * 1.4);
    hg.addColorStop(0, rgba(col.accent, 0.22)); hg.addColorStop(1, rgba(col.accent, 0));
    ctx.fillStyle = hg; ctx.fillRect(0, 0, W, H);

    const drawSparks = (behind: boolean) => {
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < sparks.length; i++) {
        const s = sparks[i], a = s.a + t * s.sp;
        const p = P([Math.cos(a) * s.rad, s.y + Math.sin(t * 0.5 + s.tw) * 10, Math.sin(a) * s.rad]);
        if ((p[2] > cam) !== behind) continue;
        const al = 0.35 + 0.35 * Math.sin(t * 2 + s.tw);
        ctx.fillStyle = rgba(i % 5 === 0 ? col.hot : col.accent, al);
        ctx.beginPath(); ctx.arc(p[0], p[1], s.s * (behind ? 0.8 : 1.2), 0, 6.283); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    };
    drawSparks(true);

    const light = [-0.45, 0.6, -0.65];
    type Face = { pts: ReturnType<typeof P>[]; area: number; z: number; base: RGB; edge: RGB; edgeA: number };
    const face = (poly: Vec[], base: RGB, edge: RGB, edgeA: number): Face => {
      const pts = poly.map(P);
      let area = 0;
      for (let i = 0; i < pts.length; i++) { const j = (i + 1) % pts.length; area += pts[i][0] * pts[j][1] - pts[j][0] * pts[i][1]; }
      return { pts, area, z: pts.reduce((s, p) => s + p[2], 0) / pts.length, base, edge, edgeA };
    };
    const frontG = face(G.front, col.accent, col.hot, 0.25);
    const sign = frontG.area > 0 ? 1 : -1;
    const faces: Face[] = [];
    [G, CAP].forEach((obj, k) => {
      obj.sides.forEach((q) => {
        const fc = face(q, k ? col.hot : col.accent, col.accent, 0.2);
        if (fc.area * sign <= 0) return;
        const a = fc.pts[0][3], b = fc.pts[1][3], c = fc.pts[2][3];
        const uu = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
        const nx = uu[1] * v[2] - uu[2] * v[1], ny = uu[2] * v[0] - uu[0] * v[2], nz = uu[0] * v[1] - uu[1] * v[0], nl = Math.hypot(nx, ny, nz) || 1;
        const lam = Math.abs((nx * light[0] + ny * light[1] + nz * light[2]) / nl);
        fc.base = mix(k ? mix(col.hot, col.deep, 0.35) : col.deep, k ? col.hot : col.accent, 0.15 + lam * 0.6);
        faces.push(fc);
      });
    });
    faces.sort((a, b) => b.z - a.z);
    const path = (fc: Face) => { ctx.beginPath(); fc.pts.forEach((p, i) => { if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.closePath(); };
    const fill = (fc: Face, alpha: number) => {
      path(fc);
      ctx.fillStyle = rgba(fc.base, alpha); ctx.fill();
      ctx.strokeStyle = rgba(fc.edge, fc.edgeA); ctx.lineWidth = 1; ctx.stroke();
    };
    faces.forEach((fc) => fill(fc, 1));
    // front face with a subtle sheen
    ctx.save();
    path(frontG);
    ctx.fillStyle = rgba(col.accent, 1); ctx.fill();
    ctx.clip();
    const sx = c0[0] + Math.sin(t * 0.5) * 220 * scale;
    const sh = ctx.createLinearGradient(sx - 120 * scale, 0, sx + 120 * scale, H);
    sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(0.5, 'rgba(255,255,255,0.14)'); sh.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sh; ctx.fillRect(0, 0, W, H);
    ctx.restore();
    fill(face(CAP.front, col.hot, col.hot, 0), 1);
    drawSparks(false);
  };
}

/* -- engine: polyhedra + a field of instanced cubes ----------------------- */
function makeEngine(opt: SceneOptions): Draw {
  const phi = (1 + Math.sqrt(5)) / 2, V: Vec[] = [];
  [[0, 1, phi], [1, phi, 0], [phi, 0, 1]].forEach((b) => {
    [1, -1].forEach((s1) => { [1, -1].forEach((s2) => {
      const p = b.slice(); const nz: number[] = []; p.forEach((c, i) => { if (c) nz.push(i); });
      p[nz[0]] *= s1; p[nz[1]] *= s2; V.push(p);
    }); });
  });
  const E: number[][] = [];
  for (let i = 0; i < V.length; i++) for (let j = i + 1; j < V.length; j++) {
    const d = Math.hypot(V[i][0] - V[j][0], V[i][1] - V[j][1], V[i][2] - V[j][2]); if (Math.abs(d - 2) < 0.01) E.push([i, j]);
  }
  const CUBE = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]];
  const CE = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
  const OCT = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
  const OE = [[0, 2], [0, 3], [0, 4], [0, 5], [1, 2], [1, 3], [1, 4], [1, 5], [2, 4], [2, 5], [3, 4], [3, 5]];
  const r = rng(11), N = Math.round((opt.density || 1) * 130), cubes: { x: number; y: number; z: number; s: number; v: number; ax: number; ay: number; w: number }[] = [];
  for (let k = 0; k < N; k++) cubes.push({ x: (r() - 0.5) * 1000, y: r() * 700, z: -150 + r() * 650, s: 5 + r() * 9, v: 30 + r() * 60, ax: r() * 6, ay: r() * 6, w: (r() - 0.5) * 2 });
  return (ctx, t, W, H, col, par, opt) => {
    const narrow = W < 760;
    const cxp = W * (narrow ? 0.5 : (opt.focusX || 0.68)), cyp = H * 0.48;
    const sc = Math.min(W, H) / 700, cam = 1000, f = 900;
    const yaw = t * 0.12 + par.x * 0.4, pitch = -0.32 + par.y * 0.2;
    const P = (v: Vec) => { const q = rot(v, yaw, pitch); const z = q[2] + cam; return [cxp + q[0] * f / z * sc, cyp - q[1] * f / z * sc, z]; };
    // floor
    ctx.lineWidth = 1;
    for (let g = -6; g <= 6; g++) {
      let a = P([g * 70, -260, -420]), b = P([g * 70, -260, 420]);
      ctx.strokeStyle = rgba(col.accent, 0.08); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      a = P([-420, -260, g * 70]); b = P([420, -260, g * 70]);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    // falling cubes (GPU-physics stand-ins)
    const items: { pts: Vec[]; z: number; hot: boolean }[] = [];
    for (let i = 0; i < cubes.length; i++) {
      const c = cubes[i]; let y = 350 - ((c.y + t * c.v) % 700);
      const land = y < -250; if (land) y = -250 + c.s;
      const ry = c.ay + t * c.w * (land ? 0 : 1), rx = c.ax + t * c.w * (land ? 0 : 0.7);
      const pts = CUBE.map((v) => { const q = rot([v[0] * c.s, v[1] * c.s, v[2] * c.s], ry, rx); return P([q[0] + c.x, q[1] + y, q[2] + c.z]); });
      items.push({ pts, z: pts[0][2], hot: i % 9 === 0 });
    }
    items.sort((a, b) => b.z - a.z);
    items.forEach((it) => {
      const depth = Math.max(0, Math.min(1, (1700 - it.z) / 1100));
      ctx.strokeStyle = rgba(it.hot ? col.hot : col.accent, 0.12 + depth * 0.5);
      ctx.beginPath();
      CE.forEach((e) => { ctx.moveTo(it.pts[e[0]][0], it.pts[e[0]][1]); ctx.lineTo(it.pts[e[1]][0], it.pts[e[1]][1]); });
      ctx.stroke();
    });
    // core: icosahedron shell, octahedron, cube
    const wire = (verts: Vec[], edges: number[][], R: number, ry: number, rx: number, color: RGB, alpha: number, lw: number) => {
      const p = verts.map((v) => P(rot([v[0] * R, v[1] * R, v[2] * R], ry, rx)));
      edges.forEach((e) => {
        const a = p[e[0]], b = p[e[1]], dz = Math.max(0, Math.min(1, (cam + R - (a[2] + b[2]) / 2) / (2 * R)));
        ctx.strokeStyle = rgba(color, alpha * (0.25 + dz * 0.75)); ctx.lineWidth = lw;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      });
      return p;
    };
    const glow = ctx.createRadialGradient(cxp, cyp, 0, cxp, cyp, 300 * sc);
    glow.addColorStop(0, rgba(col.accent, 0.18)); glow.addColorStop(1, rgba(col.accent, 0));
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    const ico = wire(V, E, 125, t * 0.25, t * 0.15, col.accent, 0.9, 1.4);
    wire(OCT, OE, 120, -t * 0.4, 0.6, col.hot, 0.55, 1);
    wire(CUBE, CE, 52, t * 0.7, t * 0.5, col.hot, 0.9, 1.6);
    ico.forEach((p) => { ctx.fillStyle = rgba(col.hot, 0.9); ctx.fillRect(p[0] - 2, p[1] - 2, 4, 4); });
    ctx.globalCompositeOperation = 'source-over';
  };
}

/* -- brain: a 3D network of neurons with signals firing forward ----------- */
function makeBrain(opt: SceneOptions): Draw {
  const r = rng(23), nodes: { p: Vec; l: number; act: number }[] = [], edges: number[][] = [], out: number[][] = [], LAYERS = 6, per = Math.round(18 * (opt.density || 1));
  for (let l = 0; l < LAYERS; l++) {
    for (let i = 0; i < per; i++) {
      const a = r() * 6.283, rad = Math.sqrt(r()) * (200 - Math.abs(l - 2.5) * 26);
      const lx = (l - (LAYERS - 1) / 2) * 85;
      nodes.push({ p: [lx + (r() - 0.5) * 34 - rad * rad * 0.0012, Math.sin(a) * rad * 0.8, Math.cos(a) * rad], l, act: 0 });
    }
  }
  nodes.forEach(() => out.push([]));
  nodes.forEach((n, i) => {
    const cand: number[][] = [];
    nodes.forEach((m, j) => {
      if (m.l === n.l + 1 || (m.l === n.l && j > i)) {
        const d = Math.hypot(n.p[0] - m.p[0], n.p[1] - m.p[1], n.p[2] - m.p[2]);
        cand.push([d + (m.l === n.l ? 60 : 0), j]);
      }
    });
    cand.sort((a, b) => a[0] - b[0]);
    cand.slice(0, n.l === LAYERS - 1 ? 1 : 3).forEach((c) => {
      const idx = edges.length; edges.push([i, c[1]]);
      if (nodes[c[1]].l > n.l) out[i].push(idx);
    });
  });
  const pulses: { e: number; u: number; v: number }[] = [];
  const spawn = () => {
    const start = Math.floor(r() * per);
    const e = out[start][Math.floor(r() * out[start].length)];
    if (e !== undefined) pulses.push({ e, u: 0, v: 0.5 + r() * 0.7 });
  };
  for (let s = 0; s < 22; s++) { spawn(); if (pulses[pulses.length - 1]) pulses[pulses.length - 1].u = r(); }
  let last = 0;
  return (ctx, t, W, H, col, par, opt) => {
    const dt = Math.min(0.05, Math.max(0, t - last)); last = t;
    const narrow = W < 760;
    const cxp = W * (narrow ? 0.5 : (opt.focusX || 0.68)), cyp = H * 0.5;
    const sc = Math.min(W * (narrow ? 1.3 : 0.95), H * 1.45) / 560, cam = 900, f = 800;
    const yaw = t * 0.1 + 0.5 + par.x * 0.5, pitch = 0.18 + par.y * 0.25 + Math.sin(t * 0.2) * 0.06;
    const P = nodes.map((n) => { const q = rot(n.p, yaw, pitch); const z = q[2] + cam; return [cxp + q[0] * f / z * sc, cyp - q[1] * f / z * sc, z]; });
    const glow = ctx.createRadialGradient(cxp, cyp, 0, cxp, cyp, 340 * sc);
    glow.addColorStop(0, rgba(col.accent, 0.14)); glow.addColorStop(1, rgba(col.accent, 0));
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
    ctx.lineWidth = 1;
    edges.forEach((e) => {
      const a = P[e[0]], b = P[e[1]], dz = Math.max(0, Math.min(1, (cam + 300 - (a[2] + b[2]) / 2) / 600));
      ctx.strokeStyle = rgba(col.accent, 0.05 + dz * 0.2);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    });
    ctx.globalCompositeOperation = 'lighter';
    for (let i = pulses.length - 1; i >= 0; i--) {
      const pu = pulses[i]; pu.u += dt * pu.v;
      const e = edges[pu.e], a = P[e[0]], b = P[e[1]];
      if (pu.u >= 1) {
        nodes[e[1]].act = 1;
        const nx = out[e[1]];
        if (nx.length && r() < 0.92) { pu.e = nx[Math.floor(r() * nx.length)]; pu.u = 0; } else { pulses.splice(i, 1); spawn(); }
        continue;
      }
      const x = a[0] + (b[0] - a[0]) * pu.u, y = a[1] + (b[1] - a[1]) * pu.u;
      const tu = Math.max(0, pu.u - 0.25), tx = a[0] + (b[0] - a[0]) * tu, ty = a[1] + (b[1] - a[1]) * tu;
      const gr = ctx.createLinearGradient(tx, ty, x, y); gr.addColorStop(0, rgba(col.hot, 0)); gr.addColorStop(1, rgba(col.hot, 0.9));
      ctx.strokeStyle = gr; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y); ctx.stroke();
      ctx.fillStyle = rgba(col.hot, 1); ctx.beginPath(); ctx.arc(x, y, 2.2, 0, 6.283); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    const order = P.map((_, i) => i).sort((a, b) => P[b][2] - P[a][2]);
    order.forEach((i) => {
      const p = P[i], n = nodes[i], dz = Math.max(0, Math.min(1, (cam + 300 - p[2]) / 600));
      n.act *= Math.pow(0.12, dt);
      const rr = (1.8 + dz * 2.6) * (f / p[2]) * Math.max(0.8, sc);
      if (n.act > 0.05) {
        const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], rr * 6);
        g.addColorStop(0, rgba(col.hot, 0.5 * n.act)); g.addColorStop(1, rgba(col.hot, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p[0], p[1], rr * 6, 0, 6.283); ctx.fill();
      }
      ctx.fillStyle = rgba(mix(col.bg, col.accent, 0.35 + dz * 0.65), 1);
      ctx.beginPath(); ctx.arc(p[0], p[1], rr, 0, 6.283); ctx.fill();
      ctx.fillStyle = rgba(mix(col.accent, col.hot, n.act), 0.5 + dz * 0.5);
      ctx.beginPath(); ctx.arc(p[0], p[1], rr * 0.45, 0, 6.283); ctx.fill();
    });
  };
}

/* -- shader: a lensed black hole with an accretion disk ------------------- */
function makeShader(opt: SceneOptions): Draw {
  const r = rng(5), stars: { x: number; y: number; s: number; tw: number; b: number }[] = [], disk: { r: number; a: number; w: number; s: number }[] = [], N = Math.round(900 * (opt.density || 1));
  for (let i = 0; i < 260; i++) stars.push({ x: r(), y: r(), s: r() < 0.9 ? 0.8 : 1.5, tw: r() * 6.283, b: 0.25 + r() * 0.6 });
  for (let k = 0; k < N; k++) { const uu = r(); disk.push({ r: 1.5 + Math.pow(uu, 2.2) * 3.4, a: r() * 6.283, w: (r() - 0.5) * 0.05, s: 0.7 + r() * 1.4 }); }
  return (ctx, t, W, H, col, par, opt) => {
    const narrow = W < 760;
    const cxp = W * (narrow ? 0.5 : (opt.focusX || 0.68)) + par.x * 14, cyp = H * 0.47 + par.y * 10;
    const rs = Math.min(W * (narrow ? 0.13 : 0.085), H * 0.15);
    const k = 0.16 + par.y * 0.05 + Math.sin(t * 0.15) * 0.015, tilt = -0.14 + par.x * 0.06;
    const ct = Math.cos(tilt), st = Math.sin(tilt);
    const T = (x: number, y: number) => [cxp + x * ct - y * st, cyp + x * st + y * ct];
    // stars, pushed outward near the hole (weak lensing)
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i]; let x = s.x * W - cxp, y = s.y * H - cyp; const d = Math.hypot(x, y) || 1;
      const f = (d + (rs * rs * 1.8) / d) / d; x *= f; y *= f;
      if (Math.hypot(x, y) < rs * 1.2) continue;
      ctx.fillStyle = rgba(col.ink, s.b * (0.6 + 0.4 * Math.sin(t * 1.3 + s.tw)));
      ctx.fillRect(cxp + x, cyp + y, s.s, s.s);
    }
    const glow = ctx.createRadialGradient(cxp, cyp, rs, cxp, cyp, rs * 6);
    glow.addColorStop(0, rgba(col.accent, 0.3)); glow.addColorStop(0.35, rgba(col.accent, 0.09)); glow.addColorStop(1, rgba(col.accent, 0));
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
    // Doppler: the approaching (left) side burns brighter
    const dop = () => {
      const g = ctx.createLinearGradient(cxp - rs * 5, 0, cxp + rs * 5, 0);
      g.addColorStop(0, rgba(col.hot, 1)); g.addColorStop(0.45, rgba(mix(col.hot, col.accent, 0.4), 0.9)); g.addColorStop(1, rgba(col.accent, 0.45));
      return g;
    };
    // continuous bands of the disk; half = 1 near side (lower), -1 far side (upper)
    const bands = (half: number, alphaMul: number) => {
      ctx.save(); ctx.translate(cxp, cyp); ctx.rotate(tilt);
      for (let b = 0; b < 30; b++) {
        const R = rs * (1.5 + b * 0.11);
        ctx.globalAlpha = alphaMul * Math.pow(1 - b / 30, 1.8) * 0.32;
        ctx.strokeStyle = dop(); ctx.lineWidth = Math.max(1, rs * 0.06);
        ctx.beginPath(); ctx.ellipse(0, 0, R, R * k, 0, half > 0 ? 0 : Math.PI, half > 0 ? Math.PI : 2 * Math.PI); ctx.stroke();
      }
      ctx.restore(); ctx.globalAlpha = 1;
    };
    const sparks = (back: boolean) => {
      for (let i = 0; i < disk.length; i++) {
        const p = disk[i], a = p.a + t * 0.9 * Math.pow(p.r, -1.5);
        if ((Math.sin(a) < 0) !== back) continue;
        const R = p.r * rs, q = T(Math.cos(a) * R, Math.sin(a) * R * k + p.w * rs);
        const heat = Math.min(1, (p.r - 1.5) / 2.4), dp = 1 + 0.6 * Math.cos(a + 0.3) * -1;
        ctx.fillStyle = rgba(mix(col.hot, col.accent, heat), Math.min(1, (0.9 - heat * 0.6) * dp * 0.6));
        ctx.fillRect(q[0], q[1], p.s, p.s);
      }
    };
    ctx.globalCompositeOperation = 'lighter';
    bands(-1, 0.8); sparks(true);
    // lensed image of the far side: an arch over the top and a thinner one beneath
    ctx.save(); ctx.translate(cxp, cyp); ctx.rotate(tilt);
    for (let j = 0; j < 22; j++) {
      const rr = rs * (1.1 + j * 0.026);
      ctx.globalAlpha = Math.pow(1 - j / 22, 1.6) * 0.42;
      ctx.strokeStyle = dop(); ctx.lineWidth = Math.max(1, rs * 0.03);
      ctx.beginPath(); ctx.ellipse(0, 0, rr, rr * 0.96, 0, Math.PI * 1.02, Math.PI * 1.98); ctx.stroke();
      ctx.globalAlpha *= 0.45;
      ctx.beginPath(); ctx.ellipse(0, 0, rr * 0.98, rr * 0.9, 0, Math.PI * 0.12, Math.PI * 0.88); ctx.stroke();
    }
    ctx.restore(); ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    // event horizon shadow + photon ring
    ctx.fillStyle = 'rgb(4,6,9)'; ctx.beginPath(); ctx.arc(cxp, cyp, rs, 0, 6.283); ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineWidth = Math.max(1.2, rs * 0.03); ctx.strokeStyle = rgba(col.hot, 0.9);
    ctx.beginPath(); ctx.arc(cxp, cyp, rs * 1.03, 0, 6.283); ctx.stroke();
    ctx.lineWidth = rs * 0.1; ctx.strokeStyle = rgba(col.accent, 0.16);
    ctx.beginPath(); ctx.arc(cxp, cyp, rs * 1.09, 0, 6.283); ctx.stroke();
    // near side of the disk crosses in front of the shadow
    bands(1, 1); sparks(false);
    ctx.globalCompositeOperation = 'source-over';
  };
}

const SCENES: Record<SceneKind, (opt: SceneOptions) => Draw> = { forge: makeForge, engine: makeEngine, brain: makeBrain, shader: makeShader };

export function startScene(canvas: HTMLCanvasElement, kind: SceneKind, opt: SceneOptions): () => void {
  // The black hole is the pack's own GLSL in WebGL; makeShader stays as the no-WebGL fallback.
  if (kind === 'shader') { const stop = startBlackHole(canvas, opt); if (stop) return stop; }
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  const draw = (SCENES[kind] || makeForge)(opt);
  let W = 1, H = 1, raf = 0, alive = true, visible = true;
  const still = !!opt.still || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const par = { x: 0, y: 0 }, target = { x: 0, y: 0 };
  const col = {} as Colors;
  const t0 = performance.now() - (opt.seed || 0) * 1000;
  const readColors = () => {
    const cs = getComputedStyle(canvas);
    col.accent = parseColor(cs.getPropertyValue('--accent'), [239, 146, 94]);
    col.hot = parseColor(cs.getPropertyValue('--scene-hot'), [245, 238, 227]);
    col.ink = parseColor(cs.getPropertyValue('--ink'), [245, 238, 227]);
    col.bg = parseColor(cs.getPropertyValue('--surface-000'), [15, 21, 27]);
    col.deep = mix(col.bg, col.accent, 0.42);
  };
  const frame = (now: number) => {
    const t = still ? 4 + (opt.seed || 0) : (now - t0) / 1000;
    par.x += (target.x - par.x) * 0.04; par.y += (target.y - par.y) * 0.04;
    ctx.clearRect(0, 0, W, H);
    draw(ctx, t, W, H, col, par, opt);
  };
  const resize = () => {
    const rc = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    W = Math.max(1, rc.width); H = Math.max(1, rc.height);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (still) frame(performance.now());
  };
  const loop = (now: number) => {
    if (!alive) return;
    if (visible && !document.hidden) frame(now);
    raf = requestAnimationFrame(loop);
  };
  const onMove = (e: PointerEvent) => {
    if (opt.interactive === false) return;
    target.x = e.clientX / innerWidth - 0.5; target.y = e.clientY / innerHeight - 0.5;
  };
  readColors(); resize();
  const ro = new ResizeObserver(resize); ro.observe(canvas);
  const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; }); io.observe(canvas);
  const colTimer = setInterval(() => { readColors(); if (still) frame(performance.now()); }, 600);
  addEventListener('pointermove', onMove, { passive: true });
  if (!still) raf = requestAnimationFrame(loop);
  return () => {
    alive = false; cancelAnimationFrame(raf); clearInterval(colTimer);
    ro.disconnect(); io.disconnect();
    removeEventListener('pointermove', onMove);
  };
}
