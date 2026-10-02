/* @ds-bundle: {"format":4,"namespace":"GoingRusting","components":[{"name":"Logo"},{"name":"Button"},{"name":"Tag"},{"name":"SiteHeader"},{"name":"Scene"},{"name":"HomeHero"},{"name":"ProjectTile"},{"name":"ProjectPanel"},{"name":"StatRow"},{"name":"CodeBlock"},{"name":"Callout"},{"name":"DocsShell"},{"name":"TutorialPath"},{"name":"SiteFooter"}]} */
(function () {
  "use strict";
  var React = window.React;
  var h = React.createElement;
  var useRef = React.useRef, useEffect = React.useEffect, useState = React.useState;

  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(" "); }

  /* ------------------------------------------------------------------ data */
  var GH = "https://github.com/GoingRusting/";
  var PROJECTS = {
    engine: {
      id: "engine", theme: "copper", scene: "engine", index: "01",
      name: "RustingEngine", stem: "Engine",
      kicker: "Game engine / Vulkan / Physics",
      short: "A Rust game engine with Vulkan rendering, an editor, and hybrid CPU/GPU physics.",
      lede: "A GPU-first game engine for physics-heavy scenes. Vulkan rendering, a Blender-style editor, and hybrid physics — you decide what the CPU owns and what the GPU simulates.",
      stats: [
        { value: "2,191", unit: "FPS", label: "10,000 GPU-simulated cubes" },
        { value: "7", label: "CPU joint types, hinge to six-axis" },
        { value: "2", label: "Platforms: Linux and Windows" }
      ],
      statsFoot: "Measured on an RTX 3060.",
      tags: ["PBR + shadows", "GPU frustum culling", "Deterministic scenarios", "rusting CLI"],
      code: { lang: "rust", title: "src/game.rs", text: "use rusting_engine::prelude::*;\n\nfn update(scene: &mut GameScene<'_>, time: &FrameTime) {\n    scene.object(\"Planet\").rotate_y(0.2 * time.delta_seconds());\n}\n\nrusting_game!(update);", hl: [4] },
      repo: GH + "RustingEngine"
    },
    brain: {
      id: "brain", theme: "verdigris", scene: "brain", index: "02",
      name: "RustingBrain", stem: "Brain",
      kicker: "Deep learning / CUDA / Metal",
      short: "A deep-learning library in Rust, from small networks to transformer models.",
      lede: "Train anything from an XOR network to a 300M-parameter transformer on one desktop GPU. No Python, no C++ build step — CUDA kernels compile at startup.",
      stats: [
        { value: "300M", label: "Parameter LMs on a single GPU" },
        { value: "3", label: "Backends: CPU, CUDA, Metal" },
        { value: "16", label: "Tutorial chapters, zero to LM" }
      ],
      statsFoot: "Matches or beats PyTorch on most RTX 3060 configurations.",
      tags: ["Flash attention", "Mixture of Experts", "LoRA fine-tuning", "BF16"],
      code: { lang: "rust", title: "examples/xor.rs", text: "let mut model = Network::builder()\n    .input_size(2)\n    .dense(8, Activation::Tanh)\n    .dense(1, Activation::Sigmoid)\n    .loss(Loss::BinaryCrossEntropy)\n    .optimizer(Optimizer::adam(0.05))\n    .build();", hl: [3, 4] },
      repo: GH + "RustingBrain"
    },
    shader: {
      id: "shader", theme: "cobalt", scene: "shader", index: "03",
      name: "RustingShader", stem: "Shader",
      kicker: "Shader pack / GLSL / Iris",
      short: "A cinematic Iris shader pack for Minecraft, with a black hole in the End.",
      lede: "A cinematic shader pack for Minecraft Java Edition. Soft PCSS shadows, deferred water with caustics, volumetric clouds and light — and a gravitationally lensed black hole in the End.",
      stats: [
        { value: "PCSS", label: "Soft shadows, deferred lighting" },
        { value: "3", label: "Dimensions, each lit its own way" },
        { value: "GL 3", label: "Runs through Iris on OpenGL 3.x" }
      ],
      statsFoot: "Developed on an RTX 3060.",
      tags: ["Volumetric clouds", "Water caustics", "Lensed black hole", "Bloom + auto-exposure"],
      code: { lang: "bash", title: "install", text: "# 1. Install Iris for Minecraft Java Edition\n# 2. Download the latest RustingShader release\n$ mv RustingShader.zip ~/.minecraft/shaderpacks/\n# 3. Video Settings → Shader Packs → RustingShader", hl: [3] },
      repo: GH + "RustingShader"
    }
  };

  /* ----------------------------------------------------------------- icons */
  var ICONS = {
    arrowRight: "M4 12h15M13 6l6 6-6 6",
    arrowUpRight: "M7 17L17 7M8 7h9v9",
    search: "M10.5 4a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zM15.5 15.5L20 20",
    copy: "M9 9h11v11H9zM5 15V4h11",
    check: "M5 12.5l4.5 4.5L19 7",
    book: "M4 5h6l2 2 2-2h6v14h-6l-2 2-2-2H4zM12 7v14",
    path: "M5 19V9l4-4h10M5 13h8v6",
    bolt: "M13 3L6 13h6l-1 8 7-10h-6z",
    info: "M12 3l9 9-9 9-9-9zM12 11v5M12 8v.5",
    alert: "M12 4l9 16H3zM12 10v4M12 17v.5",
    menu: "M4 7h16M4 12h16M4 17h10",
    chevronDown: "M6 9l6 6 6-6",
    chevronRight: "M9 6l6 6-6 6",
    repo: "M6 4h12v16H6zM6 16h12M10 4v8l2-2 2 2V4"
  };
  function Icon(p) {
    return h("svg", { className: cx("gr-icon", p.className), viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: p.strokeWidth || 1.75, strokeLinecap: "square", strokeLinejoin: "miter", "aria-hidden": true },
      h("path", { d: ICONS[p.name] || "" }));
  }

  /* ------------------------------------------------------------------ Logo */
  // Exact geometry of GoingRusting.svg (the angular copper G with the cream cap).
  function Logo(p) {
    var size = p.size || 32;
    var mark = h("svg", { width: size, height: size, viewBox: "0 0 256 256", role: p.wordmark ? undefined : "img", "aria-label": p.wordmark ? undefined : "GoingRusting", "aria-hidden": p.wordmark ? true : undefined },
      h("path", { d: "M220 32H92L36 88V168L92 224H220V128H152", fill: "none", stroke: "var(--copper)", strokeWidth: 30, strokeLinecap: "square", strokeLinejoin: "miter" }),
      h("path", { d: "M186 32H220", fill: "none", stroke: "var(--ink)", strokeWidth: 30 }));
    return h(p.href ? "a" : "span", { className: cx("gr-logo", p.className), href: p.href },
      mark,
      p.wordmark ? h("span", { className: "gr-logo-word", style: { fontSize: Math.round(size * 0.62) + "px" } }, "Going", h("b", null, "Rusting")) : null);
  }

  /* ---------------------------------------------------------------- Button */
  function Button(p) {
    var variant = p.variant || "primary", size = p.size || "md";
    var rest = {};
    for (var k in p) if (["variant", "size", "icon", "arrow", "className", "children", "href"].indexOf(k) < 0) rest[k] = p[k];
    rest.className = cx("gr-btn", "gr-btn-" + variant, size !== "md" && "gr-btn-" + size, p.className);
    if (p.href) rest.href = p.href;
    return h(p.href ? "a" : "button", rest,
      p.icon ? h(Icon, { name: p.icon }) : null,
      p.children,
      p.arrow ? h(Icon, { name: p.arrow === "external" ? "arrowUpRight" : "arrowRight", className: "gr-arrow" }) : null);
  }

  /* ------------------------------------------------------------------- Tag */
  function Tag(p) {
    return h("span", { className: cx("gr-tag", p.tone && p.tone !== "neutral" && "gr-tag-" + p.tone, p.outline && "gr-tag-outline", p.className) },
      p.dot ? h("i", { className: "gr-dot" }) : null, p.children);
  }

  /* ------------------------------------------------------------ SiteHeader */
  function SiteHeader(p) {
    var items = p.items || [["Projects", "#projects"], ["Docs", "#docs"], ["Tutorials", "#tutorials"], ["Community", "#community"]];
    var proj = p.project && PROJECTS[p.project];
    return h("header", { className: cx("gr-header", p.clear && "is-clear", p.className), "data-theme": proj ? proj.theme : undefined },
      h(Logo, { size: 28, wordmark: true, href: "#" }),
      proj ? h("span", { className: "gr-header-project" }, h("i"), proj.name) : null,
      h("nav", { className: "gr-header-nav", "aria-label": "Main" },
        items.map(function (it) {
          return h("a", { key: it[0], href: it[1], className: cx("gr-header-link", p.active === it[0] && "is-active") }, it[0]);
        })),
      h("button", { className: "gr-search", type: "button", "aria-label": "Search documentation" },
        h(Icon, { name: "search" }), h("span", null, "Search docs"), h("kbd", { className: "gr-kbd" }, "Ctrl K")),
      h("a", { className: "gr-btn gr-btn-ghost gr-header-gh", href: "https://github.com/GoingRusting" }, "GitHub", h(Icon, { name: "arrowUpRight" })),
      h("button", { className: "gr-btn gr-btn-ghost gr-header-menu", type: "button", "aria-label": "Open menu" }, h(Icon, { name: "menu" })));
  }

  /* ================================================================ SCENES
     Dependency-free 3D on a 2D canvas: perspective projection, painter's
     sort, additive glow. Colours come from CSS custom properties
     (--accent, --scene-hot, --copper, --copper-deep, --surface-000) so a
     data-theme on any ancestor reskins the scene. */
  function parseColor(s, fb) {
    s = (s || "").trim();
    if (!s) return fb;
    if (s[0] === "#") {
      var v = s.slice(1);
      if (v.length === 3 || v.length === 4) v = v.split("").map(function (c) { return c + c; }).join("");
      var n = parseInt(v.slice(0, 6), 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    var m = s.match(/[\d.]+/g);
    return m && m.length >= 3 ? [+m[0], +m[1], +m[2]] : fb;
  }
  function rgba(c, a) { return "rgba(" + (c[0] | 0) + "," + (c[1] | 0) + "," + (c[2] | 0) + "," + (a < 0 ? 0 : a > 1 ? 1 : a).toFixed(3) + ")"; }
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function rot(p, ay, ax, az) {
    var x = p[0], y = p[1], z = p[2], c, s, t;
    if (az) { c = Math.cos(az); s = Math.sin(az); t = x * c - y * s; y = x * s + y * c; x = t; }
    c = Math.cos(ay); s = Math.sin(ay); t = x * c + z * s; z = -x * s + z * c; x = t;
    c = Math.cos(ax); s = Math.sin(ax); t = y * c - z * s; z = y * s + z * c; y = t;
    return [x, y, z];
  }
  function rng(seed) { var s = seed >>> 0 || 1; return function () { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; }; }

  /* -- forge: the extruded G mark ------------------------------------------ */
  function strokeOutline(pts, hw) {
    var n = pts.length, L = [], R = [];
    function nrm(a, b) { var dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy); return [-dy / l, dx / l]; }
    for (var i = 0; i < n; i++) {
      if (i === 0 || i === n - 1) {
        var q = i === 0 ? nrm(pts[0], pts[1]) : nrm(pts[n - 2], pts[n - 1]);
        L.push([pts[i][0] + q[0] * hw, pts[i][1] + q[1] * hw]); R.push([pts[i][0] - q[0] * hw, pts[i][1] - q[1] * hw]);
      } else {
        var n1 = nrm(pts[i - 1], pts[i]), n2 = nrm(pts[i], pts[i + 1]);
        var m = [n1[0] + n2[0], n1[1] + n2[1]], ml = Math.hypot(m[0], m[1]); m = [m[0] / ml, m[1] / ml];
        var d = hw / (m[0] * n1[0] + m[1] * n1[1]);
        L.push([pts[i][0] + m[0] * d, pts[i][1] + m[1] * d]); R.push([pts[i][0] - m[0] * d, pts[i][1] - m[1] * d]);
      }
    }
    return L.concat(R.reverse());
  }
  function prism(outline, z0, z1) {
    var front = outline.map(function (p) { return [p[0] - 128, 128 - p[1], z0]; });
    var back = outline.map(function (p) { return [p[0] - 128, 128 - p[1], z1]; });
    var sides = [];
    for (var i = 0; i < outline.length; i++) {
      var j = (i + 1) % outline.length;
      sides.push([front[j], front[i], back[i], back[j]]);
    }
    return { front: front, back: back.slice().reverse(), sides: sides };
  }
  function makeForge() {
    // Centre line + square caps of the G path "M220 32H92L36 88V168L92 224H220V128H152"
    var G = prism(strokeOutline([[235, 32], [92, 32], [36, 88], [36, 168], [92, 224], [220, 224], [220, 128], [137, 128]], 15), -18, 18);
    var CAP = prism([[186, 17], [220, 17], [220, 47], [186, 47]], -18.6, 18);
    var r = rng(7), sparks = [];
    for (var i = 0; i < 70; i++) sparks.push({ a: r() * 6.283, rad: 150 + r() * 120, y: (r() - 0.5) * 220, sp: 0.08 + r() * 0.22, s: 0.6 + r() * 1.6, tw: r() * 6 });
    return {
      draw: function (ctx, t, W, H, col, par, opt) {
        var narrow = W < 760;
        var cxp = narrow ? W * 0.5 : W * (opt.focusX || 0.7), cyp = H * (narrow ? 0.3 : (opt.focusY || 0.46));
        var scale = Math.min(H * (opt.fill || 0.0026), W * (narrow ? 0.0026 : 0.0019));
        var cam = 900, f = 900;
        var yaw = Math.sin(t * 0.35) * 0.5 + par.x * 0.5 - 0.18, pitch = Math.sin(t * 0.27) * 0.1 + par.y * 0.25 - 0.08, roll = Math.sin(t * 0.21) * 0.03;
        var bob = Math.sin(t * 0.8) * 6;
        function P(v) { var q = rot(v, yaw, pitch, roll); var z = q[2] * scale + cam; return [cxp + q[0] * scale * f / z, cyp - (q[1] + bob) * scale * f / z, z, q]; }

        // floor grid
        ctx.lineWidth = 1;
        var gy = -190;
        for (var gi = -8; gi <= 8; gi++) {
          var a1 = P([gi * 50, gy, -300]), a2 = P([gi * 50, gy, 500]);
          var gl = ctx.createLinearGradient(a1[0], a1[1], a2[0], a2[1]);
          gl.addColorStop(0, rgba(col.accent, 0.0)); gl.addColorStop(0.35, rgba(col.accent, 0.16)); gl.addColorStop(1, rgba(col.accent, 0));
          ctx.strokeStyle = gl; ctx.beginPath(); ctx.moveTo(a1[0], a1[1]); ctx.lineTo(a2[0], a2[1]); ctx.stroke();
        }
        for (var gz = -300; gz <= 500; gz += 50) {
          var b1 = P([-400, gy, gz]), b2 = P([400, gy, gz]);
          ctx.strokeStyle = rgba(col.accent, 0.13 * (1 - (gz + 300) / 800)); ctx.beginPath(); ctx.moveTo(b1[0], b1[1]); ctx.lineTo(b2[0], b2[1]); ctx.stroke();
        }
        // halo
        var c0 = P([0, 0, 0]);
        var hg = ctx.createRadialGradient(c0[0], c0[1], 0, c0[0], c0[1], 260 * scale * 1.4);
        hg.addColorStop(0, rgba(col.accent, 0.22)); hg.addColorStop(1, rgba(col.accent, 0));
        ctx.fillStyle = hg; ctx.fillRect(0, 0, W, H);

        function drawSparks(behind) {
          ctx.globalCompositeOperation = "lighter";
          for (var i = 0; i < sparks.length; i++) {
            var s = sparks[i], a = s.a + t * s.sp;
            var p = P([Math.cos(a) * s.rad, s.y + Math.sin(t * 0.5 + s.tw) * 10, Math.sin(a) * s.rad]);
            if ((p[2] > cam) !== behind) continue;
            var al = 0.35 + 0.35 * Math.sin(t * 2 + s.tw);
            ctx.fillStyle = rgba(i % 5 === 0 ? col.hot : col.accent, al);
            ctx.beginPath(); ctx.arc(p[0], p[1], s.s * (behind ? 0.8 : 1.2), 0, 6.283); ctx.fill();
          }
          ctx.globalCompositeOperation = "source-over";
        }
        drawSparks(true);

        var light = [-0.45, 0.6, -0.65];
        function face(poly, base, edge, edgeA) {
          var pts = poly.map(P);
          var area = 0;
          for (var i = 0; i < pts.length; i++) { var j = (i + 1) % pts.length; area += pts[i][0] * pts[j][1] - pts[j][0] * pts[i][1]; }
          return { pts: pts, area: area, z: pts.reduce(function (s, p) { return s + p[2]; }, 0) / pts.length, base: base, edge: edge, edgeA: edgeA, poly: poly };
        }
        var frontG = face(G.front, col.accent, col.hot, 0.25);
        var sign = frontG.area > 0 ? 1 : -1;
        var faces = [];
        [G, CAP].forEach(function (obj, k) {
          obj.sides.forEach(function (q) {
            var fc = face(q, k ? col.hot : col.accent, col.accent, 0.2);
            if (fc.area * sign <= 0) return;
            var a = fc.pts[0][3], b = fc.pts[1][3], c = fc.pts[2][3];
            var u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
            var nx = u[1] * v[2] - u[2] * v[1], ny = u[2] * v[0] - u[0] * v[2], nz = u[0] * v[1] - u[1] * v[0], nl = Math.hypot(nx, ny, nz) || 1;
            var lam = Math.abs((nx * light[0] + ny * light[1] + nz * light[2]) / nl);
            fc.base = mix(k ? mix(col.hot, col.deep, 0.35) : col.deep, k ? col.hot : col.accent, 0.15 + lam * 0.6);
            faces.push(fc);
          });
        });
        faces.sort(function (a, b) { return b.z - a.z; });
        function fill(fc, alpha) {
          ctx.beginPath(); fc.pts.forEach(function (p, i) { if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.closePath();
          ctx.fillStyle = rgba(fc.base, alpha); ctx.fill();
          ctx.strokeStyle = rgba(fc.edge, fc.edgeA); ctx.lineWidth = 1; ctx.stroke();
        }
        faces.forEach(function (fc) { fill(fc, 1); });
        // front face with a subtle sheen
        ctx.save();
        ctx.beginPath(); frontG.pts.forEach(function (p, i) { if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.closePath();
        ctx.fillStyle = rgba(col.accent, 1); ctx.fill();
        ctx.clip();
        var sx = c0[0] + Math.sin(t * 0.5) * 220 * scale;
        var sh = ctx.createLinearGradient(sx - 120 * scale, 0, sx + 120 * scale, H);
        sh.addColorStop(0, "rgba(255,255,255,0)"); sh.addColorStop(0.5, "rgba(255,255,255,0.14)"); sh.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = sh; ctx.fillRect(0, 0, W, H);
        ctx.restore();
        var frontCap = face(CAP.front, col.hot, col.hot, 0);
        fill(frontCap, 1);
        drawSparks(false);
      }
    };
  }

  /* -- engine: polyhedra + a field of instanced cubes ----------------------- */
  function makeEngine(opt) {
    var phi = (1 + Math.sqrt(5)) / 2, V = [];
    [[0, 1, phi], [1, phi, 0], [phi, 0, 1]].forEach(function (b) {
      [1, -1].forEach(function (s1) { [1, -1].forEach(function (s2) {
        var p = b.slice(); var nz = []; p.forEach(function (c, i) { if (c) nz.push(i); });
        p[nz[0]] *= s1; p[nz[1]] *= s2; V.push(p);
      }); });
    });
    var E = [];
    for (var i = 0; i < V.length; i++) for (var j = i + 1; j < V.length; j++) {
      var d = Math.hypot(V[i][0] - V[j][0], V[i][1] - V[j][1], V[i][2] - V[j][2]); if (Math.abs(d - 2) < 0.01) E.push([i, j]);
    }
    var CUBE = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]];
    var CE = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
    var OCT = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
    var OE = [[0, 2], [0, 3], [0, 4], [0, 5], [1, 2], [1, 3], [1, 4], [1, 5], [2, 4], [2, 5], [3, 4], [3, 5]];
    var r = rng(11), N = Math.round((opt.density || 1) * 130), cubes = [];
    for (var k = 0; k < N; k++) cubes.push({ x: (r() - 0.5) * 1000, y: r() * 700, z: -150 + r() * 650, s: 5 + r() * 9, v: 30 + r() * 60, ax: r() * 6, ay: r() * 6, w: (r() - 0.5) * 2 });
    return {
      draw: function (ctx, t, W, H, col, par, opt) {
        var narrow = W < 760;
        var cxp = W * (narrow ? 0.5 : (opt.focusX || 0.68)), cyp = H * 0.48;
        var sc = Math.min(W, H) / 700, cam = 1000, f = 900;
        var yaw = t * 0.12 + par.x * 0.4, pitch = -0.32 + par.y * 0.2;
        function P(v) { var q = rot(v, yaw, pitch); var z = q[2] + cam; return [cxp + q[0] * f / z * sc, cyp - q[1] * f / z * sc, z]; }
        // floor
        ctx.lineWidth = 1;
        for (var g = -6; g <= 6; g++) {
          var a = P([g * 70, -260, -420]), b = P([g * 70, -260, 420]);
          ctx.strokeStyle = rgba(col.accent, 0.08); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
          a = P([-420, -260, g * 70]); b = P([420, -260, g * 70]);
          ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        }
        // falling cubes (GPU-physics stand-ins)
        var items = [];
        for (var i = 0; i < cubes.length; i++) {
          var c = cubes[i], y = 350 - ((c.y + t * c.v) % 700);
          var land = y < -250; if (land) y = -250 + c.s;
          var ry = c.ay + t * c.w * (land ? 0 : 1), rx = c.ax + t * c.w * (land ? 0 : 0.7);
          var pts = CUBE.map(function (v) { var q = rot([v[0] * c.s, v[1] * c.s, v[2] * c.s], ry, rx); return P([q[0] + c.x, q[1] + y, q[2] + c.z]); });
          items.push({ pts: pts, z: pts[0][2], hot: i % 9 === 0 });
        }
        items.sort(function (a, b) { return b.z - a.z; });
        items.forEach(function (it) {
          var depth = Math.max(0, Math.min(1, (1700 - it.z) / 1100));
          ctx.strokeStyle = rgba(it.hot ? col.hot : col.accent, 0.12 + depth * 0.5);
          ctx.beginPath();
          CE.forEach(function (e) { ctx.moveTo(it.pts[e[0]][0], it.pts[e[0]][1]); ctx.lineTo(it.pts[e[1]][0], it.pts[e[1]][1]); });
          ctx.stroke();
        });
        // core: icosahedron shell, octahedron, cube
        function wire(verts, edges, R, ry, rx, color, alpha, lw) {
          var p = verts.map(function (v) { return P(rot([v[0] * R, v[1] * R, v[2] * R], ry, rx)); });
          edges.forEach(function (e) {
            var a = p[e[0]], b = p[e[1]], dz = Math.max(0, Math.min(1, (cam + R - (a[2] + b[2]) / 2) / (2 * R)));
            ctx.strokeStyle = rgba(color, alpha * (0.25 + dz * 0.75)); ctx.lineWidth = lw;
            ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
          });
          return p;
        }
        var glow = ctx.createRadialGradient(cxp, cyp, 0, cxp, cyp, 300 * sc);
        glow.addColorStop(0, rgba(col.accent, 0.18)); glow.addColorStop(1, rgba(col.accent, 0));
        ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = "lighter";
        var ico = wire(V, E, 125, t * 0.25, t * 0.15, col.accent, 0.9, 1.4);
        wire(OCT, OE, 120, -t * 0.4, 0.6, col.hot, 0.55, 1);
        wire(CUBE, CE, 52, t * 0.7, t * 0.5, col.hot, 0.9, 1.6);
        ico.forEach(function (p) { ctx.fillStyle = rgba(col.hot, 0.9); ctx.fillRect(p[0] - 2, p[1] - 2, 4, 4); });
        ctx.globalCompositeOperation = "source-over";
      }
    };
  }

  /* -- brain: a 3D network of neurons with signals firing forward ----------- */
  function makeBrain(opt) {
    var r = rng(23), nodes = [], edges = [], out = [], LAYERS = 6, per = Math.round(18 * (opt.density || 1));
    for (var l = 0; l < LAYERS; l++) {
      for (var i = 0; i < per; i++) {
        var a = r() * 6.283, rad = Math.sqrt(r()) * (200 - Math.abs(l - 2.5) * 26);
        var lx = (l - (LAYERS - 1) / 2) * 85;
        nodes.push({ p: [lx + (r() - 0.5) * 34 - rad * rad * 0.0012, Math.sin(a) * rad * 0.8, Math.cos(a) * rad], l: l, act: 0 });
      }
    }
    nodes.forEach(function () { out.push([]); });
    nodes.forEach(function (n, i) {
      var cand = [];
      nodes.forEach(function (m, j) {
        if (m.l === n.l + 1 || (m.l === n.l && j > i)) {
          var d = Math.hypot(n.p[0] - m.p[0], n.p[1] - m.p[1], n.p[2] - m.p[2]);
          cand.push([d + (m.l === n.l ? 60 : 0), j]);
        }
      });
      cand.sort(function (a, b) { return a[0] - b[0]; });
      cand.slice(0, n.l === LAYERS - 1 ? 1 : 3).forEach(function (c) {
        var idx = edges.length; edges.push([i, c[1]]);
        if (nodes[c[1]].l > n.l) out[i].push(idx);
      });
    });
    var pulses = [];
    function spawn() {
      var start = Math.floor(r() * per);
      var e = out[start][Math.floor(r() * out[start].length)];
      if (e !== undefined) pulses.push({ e: e, u: 0, v: 0.5 + r() * 0.7 });
    }
    for (var s = 0; s < 22; s++) { spawn(); pulses[pulses.length - 1] && (pulses[pulses.length - 1].u = r()); }
    var last = 0;
    return {
      draw: function (ctx, t, W, H, col, par, opt) {
        var dt = Math.min(0.05, Math.max(0, t - last)); last = t;
        var narrow = W < 760;
        var cxp = W * (narrow ? 0.5 : (opt.focusX || 0.68)), cyp = H * 0.5;
        var sc = Math.min(W * (narrow ? 1.3 : 0.95), H * 1.45) / 560, cam = 900, f = 800;
        var yaw = t * 0.1 + 0.5 + par.x * 0.5, pitch = 0.18 + par.y * 0.25 + Math.sin(t * 0.2) * 0.06;
        var P = nodes.map(function (n) { var q = rot(n.p, yaw, pitch); var z = q[2] + cam; return [cxp + q[0] * f / z * sc, cyp - q[1] * f / z * sc, z]; });
        var glow = ctx.createRadialGradient(cxp, cyp, 0, cxp, cyp, 340 * sc);
        glow.addColorStop(0, rgba(col.accent, 0.14)); glow.addColorStop(1, rgba(col.accent, 0));
        ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
        ctx.lineWidth = 1;
        edges.forEach(function (e) {
          var a = P[e[0]], b = P[e[1]], dz = Math.max(0, Math.min(1, (cam + 300 - (a[2] + b[2]) / 2) / 600));
          ctx.strokeStyle = rgba(col.accent, 0.05 + dz * 0.2);
          ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        });
        ctx.globalCompositeOperation = "lighter";
        for (var i = pulses.length - 1; i >= 0; i--) {
          var pu = pulses[i]; pu.u += dt * pu.v;
          var e = edges[pu.e], a = P[e[0]], b = P[e[1]];
          if (pu.u >= 1) {
            nodes[e[1]].act = 1;
            var nx = out[e[1]];
            if (nx.length && r() < 0.92) { pu.e = nx[Math.floor(r() * nx.length)]; pu.u = 0; } else { pulses.splice(i, 1); spawn(); }
            continue;
          }
          var x = a[0] + (b[0] - a[0]) * pu.u, y = a[1] + (b[1] - a[1]) * pu.u;
          var tu = Math.max(0, pu.u - 0.25), tx = a[0] + (b[0] - a[0]) * tu, ty = a[1] + (b[1] - a[1]) * tu;
          var gr = ctx.createLinearGradient(tx, ty, x, y); gr.addColorStop(0, rgba(col.hot, 0)); gr.addColorStop(1, rgba(col.hot, 0.9));
          ctx.strokeStyle = gr; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y); ctx.stroke();
          ctx.fillStyle = rgba(col.hot, 1); ctx.beginPath(); ctx.arc(x, y, 2.2, 0, 6.283); ctx.fill();
        }
        ctx.globalCompositeOperation = "source-over";
        var order = P.map(function (p, i) { return i; }).sort(function (a, b) { return P[b][2] - P[a][2]; });
        order.forEach(function (i) {
          var p = P[i], n = nodes[i], dz = Math.max(0, Math.min(1, (cam + 300 - p[2]) / 600));
          n.act *= Math.pow(0.12, dt);
          var rr = (1.8 + dz * 2.6) * (f / p[2]) * Math.max(0.8, sc) ;
          if (n.act > 0.05) {
            var g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], rr * 6);
            g.addColorStop(0, rgba(col.hot, 0.5 * n.act)); g.addColorStop(1, rgba(col.hot, 0));
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p[0], p[1], rr * 6, 0, 6.283); ctx.fill();
          }
          ctx.fillStyle = rgba(mix(col.bg, col.accent, 0.35 + dz * 0.65), 1);
          ctx.beginPath(); ctx.arc(p[0], p[1], rr, 0, 6.283); ctx.fill();
          ctx.fillStyle = rgba(mix(col.accent, col.hot, n.act), 0.5 + dz * 0.5);
          ctx.beginPath(); ctx.arc(p[0], p[1], rr * 0.45, 0, 6.283); ctx.fill();
        });
      }
    };
  }

  /* -- shader: a lensed black hole with an accretion disk ------------------- */
  function makeShader(opt) {
    var r = rng(5), stars = [], disk = [], N = Math.round(900 * (opt.density || 1));
    for (var i = 0; i < 260; i++) stars.push({ x: r(), y: r(), s: r() < 0.9 ? 0.8 : 1.5, tw: r() * 6.283, b: 0.25 + r() * 0.6 });
    for (var k = 0; k < N; k++) { var u = r(); disk.push({ r: 1.5 + Math.pow(u, 2.2) * 3.4, a: r() * 6.283, w: (r() - 0.5) * 0.05, s: 0.7 + r() * 1.4 }); }
    return {
      draw: function (ctx, t, W, H, col, par, opt) {
        var narrow = W < 760;
        var cxp = W * (narrow ? 0.5 : (opt.focusX || 0.68)) + par.x * 14, cyp = H * 0.47 + par.y * 10;
        var rs = Math.min(W * (narrow ? 0.13 : 0.085), H * 0.15);
        var k = 0.16 + par.y * 0.05 + Math.sin(t * 0.15) * 0.015, tilt = -0.14 + par.x * 0.06;
        var ct = Math.cos(tilt), st = Math.sin(tilt);
        function T(x, y) { return [cxp + x * ct - y * st, cyp + x * st + y * ct]; }
        // stars, pushed outward near the hole (weak lensing)
        for (var i = 0; i < stars.length; i++) {
          var s = stars[i], x = s.x * W - cxp, y = s.y * H - cyp, d = Math.hypot(x, y) || 1;
          var f = (d + (rs * rs * 1.8) / d) / d; x *= f; y *= f;
          if (Math.hypot(x, y) < rs * 1.2) continue;
          ctx.fillStyle = rgba(col.ink, s.b * (0.6 + 0.4 * Math.sin(t * 1.3 + s.tw)));
          ctx.fillRect(cxp + x, cyp + y, s.s, s.s);
        }
        var glow = ctx.createRadialGradient(cxp, cyp, rs, cxp, cyp, rs * 6);
        glow.addColorStop(0, rgba(col.accent, 0.3)); glow.addColorStop(0.35, rgba(col.accent, 0.09)); glow.addColorStop(1, rgba(col.accent, 0));
        ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
        // Doppler: the approaching (left) side burns brighter
        function dop() {
          var g = ctx.createLinearGradient(cxp - rs * 5, 0, cxp + rs * 5, 0);
          g.addColorStop(0, rgba(col.hot, 1)); g.addColorStop(0.45, rgba(mix(col.hot, col.accent, 0.4), 0.9)); g.addColorStop(1, rgba(col.accent, 0.45));
          return g;
        }
        // continuous bands of the disk; half = 1 near side (lower), -1 far side (upper)
        function bands(half, alphaMul) {
          ctx.save(); ctx.translate(cxp, cyp); ctx.rotate(tilt);
          for (var b = 0; b < 30; b++) {
            var R = rs * (1.5 + b * 0.11);
            ctx.globalAlpha = alphaMul * Math.pow(1 - b / 30, 1.8) * 0.32;
            ctx.strokeStyle = dop(); ctx.lineWidth = Math.max(1, rs * 0.06);
            ctx.beginPath(); ctx.ellipse(0, 0, R, R * k, 0, half > 0 ? 0 : Math.PI, half > 0 ? Math.PI : 2 * Math.PI); ctx.stroke();
          }
          ctx.restore(); ctx.globalAlpha = 1;
        }
        function sparks(back) {
          for (var i = 0; i < disk.length; i++) {
            var p = disk[i], a = p.a + t * 0.9 * Math.pow(p.r, -1.5);
            if ((Math.sin(a) < 0) !== back) continue;
            var R = p.r * rs, q = T(Math.cos(a) * R, Math.sin(a) * R * k + p.w * rs);
            var heat = Math.min(1, (p.r - 1.5) / 2.4), dp = 1 + 0.6 * Math.cos(a + 0.3) * -1;
            ctx.fillStyle = rgba(mix(col.hot, col.accent, heat), Math.min(1, (0.9 - heat * 0.6) * dp * 0.6));
            ctx.fillRect(q[0], q[1], p.s, p.s);
          }
        }
        ctx.globalCompositeOperation = "lighter";
        bands(-1, 0.8); sparks(true);
        // lensed image of the far side: an arch over the top and a thinner one beneath
        ctx.save(); ctx.translate(cxp, cyp); ctx.rotate(tilt);
        for (var j = 0; j < 22; j++) {
          var rr = rs * (1.1 + j * 0.026);
          ctx.globalAlpha = Math.pow(1 - j / 22, 1.6) * 0.42;
          ctx.strokeStyle = dop(); ctx.lineWidth = Math.max(1, rs * 0.03);
          ctx.beginPath(); ctx.ellipse(0, 0, rr, rr * 0.96, 0, Math.PI * 1.02, Math.PI * 1.98); ctx.stroke();
          ctx.globalAlpha *= 0.45;
          ctx.beginPath(); ctx.ellipse(0, 0, rr * 0.98, rr * 0.9, 0, Math.PI * 0.12, Math.PI * 0.88); ctx.stroke();
        }
        ctx.restore(); ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
        // event horizon shadow + photon ring
        ctx.fillStyle = "rgb(4,6,9)"; ctx.beginPath(); ctx.arc(cxp, cyp, rs, 0, 6.283); ctx.fill();
        ctx.globalCompositeOperation = "lighter";
        ctx.lineWidth = Math.max(1.2, rs * 0.03); ctx.strokeStyle = rgba(col.hot, 0.9);
        ctx.beginPath(); ctx.arc(cxp, cyp, rs * 1.03, 0, 6.283); ctx.stroke();
        ctx.lineWidth = rs * 0.1; ctx.strokeStyle = rgba(col.accent, 0.16);
        ctx.beginPath(); ctx.arc(cxp, cyp, rs * 1.09, 0, 6.283); ctx.stroke();
        // near side of the disk crosses in front of the shadow
        bands(1, 1); sparks(false);
        ctx.globalCompositeOperation = "source-over";
      }
    };
  }

  var SCENES = { forge: makeForge, engine: makeEngine, brain: makeBrain, shader: makeShader };

  function startScene(canvas, kind, opt) {
    var ctx = canvas.getContext("2d");
    if (!ctx) return function () {};
    var sim = (SCENES[kind] || makeForge)(opt);
    var W = 1, H = 1, raf = 0, alive = true, visible = true;
    var still = !!opt.still || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    var par = { x: 0, y: 0 }, target = { x: 0, y: 0 }, col = {};
    var t0 = performance.now() - (opt.seed || 0) * 1000;
    function readColors() {
      var cs = getComputedStyle(canvas);
      col.accent = parseColor(cs.getPropertyValue("--accent"), [239, 146, 94]);
      col.hot = parseColor(cs.getPropertyValue("--scene-hot"), [245, 238, 227]);
      col.ink = parseColor(cs.getPropertyValue("--ink"), [245, 238, 227]);
      col.bg = parseColor(cs.getPropertyValue("--surface-000"), [15, 21, 27]);
      col.deep = mix(col.bg, col.accent, 0.42);
    }
    function frame(now) {
      var t = still ? 4 + (opt.seed || 0) : (now - t0) / 1000;
      par.x += (target.x - par.x) * 0.04; par.y += (target.y - par.y) * 0.04;
      ctx.clearRect(0, 0, W, H);
      sim.draw(ctx, t, W, H, col, par, opt);
    }
    function resize() {
      var rc = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, rc.width); H = Math.max(1, rc.height);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (still) frame(performance.now());
    }
    function loop(now) {
      if (!alive) return;
      if (visible && !document.hidden) frame(now);
      raf = requestAnimationFrame(loop);
    }
    function onMove(e) {
      if (opt.interactive === false) return;
      target.x = (e.clientX / window.innerWidth - 0.5); target.y = (e.clientY / window.innerHeight - 0.5);
    }
    readColors(); resize();
    var ro = window.ResizeObserver ? new ResizeObserver(resize) : null; if (ro) ro.observe(canvas);
    var io = window.IntersectionObserver ? new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }) : null; if (io) io.observe(canvas);
    var colTimer = setInterval(function () { readColors(); if (still) frame(performance.now()); }, 600);
    window.addEventListener("pointermove", onMove, { passive: true });
    if (!still) raf = requestAnimationFrame(loop);
    return function () {
      alive = false; cancelAnimationFrame(raf); clearInterval(colTimer);
      if (ro) ro.disconnect(); if (io) io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }

  function Scene(p) {
    var ref = useRef(null);
    var kind = p.kind || "forge";
    useEffect(function () {
      return startScene(ref.current, kind, { still: p.still, density: p.density, focusX: p.focusX, focusY: p.focusY, fill: p.fill, seed: p.seed, interactive: p.interactive });
    }, [kind, p.still, p.density, p.focusX, p.focusY, p.fill]);
    return h("div", { className: cx("gr-scene", p.className), style: p.style, "aria-hidden": true, "data-theme": p.theme },
      h("canvas", { ref: ref }));
  }

  /* -------------------------------------------------------------- StatRow */
  function StatRow(p) {
    var stats = p.stats || [];
    return h("div", { className: cx("gr-stats", p.className), style: { "--n": stats.length } },
      stats.map(function (s, i) {
        return h("div", { className: "gr-stat", key: i },
          h("div", { className: "gr-stat-value" }, s.value, s.unit ? h("small", null, s.unit) : null),
          h("div", { className: "gr-stat-label" }, s.label));
      }),
      p.foot ? h("div", { className: "gr-stats-foot" }, p.foot) : null);
  }

  /* ------------------------------------------------------------- CodeBlock */
  var KW = { rust: "as async await break const continue crate dyn else enum extern false fn for if impl in let loop match mod move mut pub ref return self Self static struct super trait true type unsafe use where while Some None Ok Err".split(" "),
    bash: "cargo run add mv cd cp export sudo git".split(" "),
    glsl: "uniform in out inout void float int vec2 vec3 vec4 mat3 mat4 sampler2D return if else for const".split(" "),
    json: ["true", "false", "null"] };
  function tokenize(line, lang) {
    var out = [], m, rest = line, kws = KW[lang] || [];
    var rules = [
      ["co", lang === "bash" ? /^#.*/ : /^\/\/.*/],
      ["pr", lang === "bash" ? /^\$(?=\s)/ : /^(?!)/],
      ["st", /^"(?:[^"\\]|\\.)*"?/],
      ["ma", /^[a-z_][a-z0-9_]*!/],
      ["nu", /^\d[\d_]*(?:\.\d+)?(?:e-?\d+)?(?:[iu](?:8|16|32|64|size)|f32|f64)?/],
      ["id", /^[A-Za-z_][A-Za-z0-9_]*/],
      ["sp", /^\s+/],
      ["pu", /^[^\sA-Za-z0-9_"]+/]
    ];
    while (rest.length) {
      for (var i = 0; i < rules.length; i++) {
        m = rules[i][1].exec(rest);
        if (m && m[0].length) {
          var kind = rules[i][0], text = m[0];
          if (kind === "id") {
            if (kws.indexOf(text) >= 0) kind = "kw";
            else if (/^[A-Z]/.test(text)) kind = "ty";
            else if (/^\s*\(/.test(rest.slice(text.length))) kind = "fn";
            else kind = "";
          }
          if (kind === "sp") kind = "";
          if (lang === "json" && kind === "st" && /^\s*:/.test(rest.slice(text.length))) kind = "ty";
          out.push(kind ? h("span", { className: "tk-" + kind, key: out.length }, text) : text);
          rest = rest.slice(text.length);
          break;
        }
      }
      if (i === rules.length) { out.push(rest[0]); rest = rest.slice(1); }
    }
    return out;
  }
  function CodeBlock(p) {
    var text = (p.code || p.children || "").replace(/\n$/, "");
    var lang = p.lang || "rust";
    var lines = text.split("\n"), hl = p.highlight || [];
    var st = useState(false), copied = st[0], setCopied = st[1];
    function copy() {
      try { navigator.clipboard.writeText(text.replace(/^\$ /gm, "")); } catch (e) {}
      setCopied(true); setTimeout(function () { setCopied(false); }, 1400);
    }
    var showLn = p.lineNumbers !== false;
    return h("figure", { className: cx("gr-code", p.floating && "is-floating", !showLn && "no-ln", p.className) },
      h("div", { className: "gr-code-in" },
        h("div", { className: "gr-code-bar" },
          h("span", { className: "gr-code-file" }, p.title || ""),
          h("span", { className: "gr-code-lang" }, lang),
          h("button", { type: "button", className: "gr-code-copy", onClick: copy, "aria-label": copied ? "Copied" : "Copy code" }, h(Icon, { name: copied ? "check" : "copy" }))),
        h("pre", null, h("code", null, lines.map(function (ln, i) {
          return h("span", { key: i, className: cx("gr-code-line", hl.indexOf(i + 1) >= 0 && "is-hl") },
            showLn ? h("span", { className: "gr-code-ln" }, i + 1) : null, tokenize(ln, lang), "\n");
        })))));
  }

  /* --------------------------------------------------------------- Callout */
  var CALLOUT = { note: ["info", "Note"], tip: ["check", "Tip"], warning: ["alert", "Warning"], perf: ["bolt", "Performance"] };
  function Callout(p) {
    var kind = CALLOUT[p.kind] ? p.kind : "note";
    return h("aside", { className: cx("gr-callout", "gr-callout-" + kind, p.className) },
      h(Icon, { name: CALLOUT[kind][0] }),
      h("div", null, h("span", { className: "gr-callout-title" }, p.title || CALLOUT[kind][1]), typeof p.children === "string" ? h("p", null, p.children) : p.children));
  }

  /* ------------------------------------------------------- ProjectTile */
  function ProjectTile(p) {
    var pr = PROJECTS[p.project] || PROJECTS.engine;
    return h("a", { className: cx("gr-tile", p.className), href: p.href || "#" + pr.id, "data-theme": pr.theme },
      h(Scene, { kind: pr.scene, density: 0.45, focusX: 0.62, still: p.still, interactive: false }),
      h("div", { className: "gr-tile-top" }, h("span", null, h("em", null, pr.index), " / 03"), h("span", null, pr.kicker.split(" / ")[0])),
      h("div", { className: "gr-tile-name" }, pr.name),
      h("p", { className: "gr-tile-desc" }, pr.short),
      h(Icon, { name: "arrowUpRight", className: "gr-tile-go" }));
  }

  /* -------------------------------------------------------------- HomeHero */
  function HomeHero(p) {
    return h("section", { className: cx("gr-root gr-hero", p.className), "data-theme": "copper" },
      h("div", { className: "gr-grid-bg" }),
      h(Scene, { kind: "forge", still: p.still, focusX: 0.74, focusY: 0.37, fill: 0.00185 }),
      h("div", { className: "gr-hero-shade" }),
      h(SiteHeader, { clear: true, active: p.active }),
      h("div", { className: "gr-container gr-hero-body" },
        h("span", { className: "gr-kicker" }, "Rust / GPU / Possibility"),
        h("h1", { className: "gr-hero-title" }, "Going", h("b", null, "Rusting")),
        h("p", { className: "gr-hero-tagline" }, "Rethinking engines, learning, and graphics."),
        h("p", { className: "gr-hero-lede" }, "We explore how Rust and GPU computing can reshape game engines, machine learning, and real-time graphics."),
        h("div", { className: "gr-hero-cta" },
          h(Button, { size: "lg", arrow: true, href: "#projects" }, "Explore the projects"),
          h(Button, { size: "lg", variant: "secondary", icon: "book", href: "#docs" }, "Read the docs")),
        h("div", { className: "gr-hero-motto" }, "BUILD. MEASURE. EXPLORE.")),
      h("div", { className: "gr-container gr-hero-index", id: "projects" },
        ["engine", "brain", "shader"].map(function (id) { return h(ProjectTile, { key: id, project: id, still: p.still }); })));
  }

  /* ---------------------------------------------------------- ProjectPanel */
  function ProjectPanel(p) {
    var pr = PROJECTS[p.project] || PROJECTS.engine;
    var right = p.align === "right";
    var nameParts = pr.name.split(pr.stem);
    return h("section", { className: cx("gr-root gr-panel", right && "is-right", p.className), "data-theme": pr.theme, id: pr.id },
      h(Scene, { kind: pr.scene, still: p.still, focusX: right ? 0.3 : 0.7 }),
      h("div", { className: "gr-panel-shade" }),
      h("div", { className: "gr-container gr-panel-inner" },
        h("div", { className: "gr-panel-copy" },
          h("div", { className: "gr-panel-index" }, h("b", null, pr.index), " / 03"),
          h("span", { className: "gr-kicker" }, pr.kicker),
          h("h2", { className: "gr-panel-name" }, nameParts[0], h("b", null, pr.stem)),
          h("p", { className: "gr-panel-lede" }, pr.lede),
          h(StatRow, { stats: pr.stats, foot: pr.statsFoot }),
          h("div", { className: "gr-panel-tags" }, pr.tags.map(function (t) { return h(Tag, { key: t, tone: "accent" }, t); })),
          h("div", { className: "gr-panel-cta" },
            h(Button, { arrow: true, href: "#" + pr.id + "-docs" }, "Read the docs"),
            h(Button, { variant: "secondary", icon: "path", href: "#" + pr.id + "-tutorials" }, "Tutorials"),
            h(Button, { variant: "ghost", arrow: "external", href: pr.repo }, "GitHub"))),
        p.code === false ? null : h("div", { className: "gr-panel-code" },
          h(CodeBlock, { floating: true, lang: pr.code.lang, title: pr.code.title, code: pr.code.text, highlight: pr.code.hl }))));
  }

  /* ------------------------------------------------------------- DocsShell */
  function DocsShell(p) {
    var pr = PROJECTS[p.project] || PROJECTS.engine;
    var nav = p.nav || [];
    var toc = p.toc || [];
    return h("div", { className: cx("gr-root gr-docs", p.className), "data-theme": pr.theme },
      h("aside", { className: "gr-docs-side" },
        h("button", { className: "gr-docs-switch", type: "button" }, h("i"), h("span", null, h("b", null, pr.name), h("small", null, p.version || "Documentation")), h(Icon, { name: "chevronDown" })),
        h("button", { className: "gr-search", type: "button" }, h(Icon, { name: "search" }), h("span", null, "Search " + pr.stem.toLowerCase() + " docs"), h("kbd", { className: "gr-kbd" }, "/")),
        nav.map(function (g) {
          return h("div", { className: "gr-docs-group", key: g.title },
            h("h4", null, g.title),
            g.items.map(function (it) {
              return h("a", { key: it.label, href: it.href || "#", className: cx("gr-docs-link", it.active && "is-active") }, it.label, it.tag ? h(Tag, { tone: it.tagTone || "accent" }, it.tag) : null);
            }));
        })),
      h("main", { className: "gr-docs-main" },
        h("div", { className: "gr-docs-banner" },
          h(Scene, { kind: pr.scene, density: 0.6, focusX: 0.8, still: p.still, interactive: false }),
          h("div", { className: "gr-docs-head" },
            h("nav", { className: "gr-crumbs", "aria-label": "Breadcrumb" },
              (p.crumbs || [pr.name, "Docs"]).map(function (c, i, arr) {
                return h(React.Fragment, { key: i }, h("span", null, c), i < arr.length - 1 ? h(Icon, { name: "chevronRight" }) : null);
              })),
            h("h1", { className: "gr-docs-title" }, p.title),
            p.meta ? h("div", { className: "gr-docs-meta" }, p.meta) : null)),
        h("article", { className: "gr-prose" }, p.children)),
      toc.length ? h("nav", { className: "gr-docs-toc", "aria-label": "On this page" },
        h("div", { className: "gr-docs-toc-in" },
          h("h4", null, "On this page"),
          toc.map(function (t, i) { return h("a", { key: i, href: t.href || "#", className: cx(t.active && "is-active", t.sub && "is-sub") }, t.label); }))) : null);
  }

  /* ---------------------------------------------------------- TutorialPath */
  function TutorialPath(p) {
    var steps = p.steps || [];
    var done = steps.filter(function (s) { return s.state === "done"; }).length;
    return h("div", { className: cx("gr-root", p.className), "data-theme": p.project && PROJECTS[p.project] ? PROJECTS[p.project].theme : undefined },
      p.progress !== false ? h("div", { className: "gr-path-progress" },
        h("span", null, done + " / " + steps.length + " chapters"),
        h("div", { className: "gr-path-bar" }, h("i", { style: { width: (steps.length ? done / steps.length * 100 : 0) + "%" } }))) : null,
      h("ol", { className: "gr-path" }, steps.map(function (s, i) {
        var state = s.state || "todo";
        return h("li", { key: i, className: cx("gr-path-step", "is-" + state) },
          h("span", { className: "gr-path-mark" }, state === "done" ? h(Icon, { name: "check", strokeWidth: 2.25 }) : String(i + 1).padStart(2, "0")),
          h("div", { className: "gr-path-body" },
            h("h5", null, s.title),
            s.summary ? h("p", null, s.summary) : null,
            h("div", { className: "gr-path-meta" },
              s.minutes ? h(Tag, null, s.minutes + " min") : null,
              s.level ? h(Tag, { outline: true }, s.level) : null)),
          state === "current" ? h(Button, { size: "sm", arrow: true }, "Continue") : null);
      })));
  }

  /* ------------------------------------------------------------ SiteFooter */
  function SiteFooter(p) {
    var col = function (title, links) {
      return h("div", { className: "gr-footer-col" }, h("h6", null, title), links.map(function (l) {
        return h("a", { key: l[0], href: l[1] }, l[2] ? h("i", { style: { background: "var(--" + l[2] + ")" } }) : null, l[0]);
      }));
    };
    return h("footer", { className: cx("gr-root gr-footer", p.className), "data-theme": "copper" },
      h("div", { className: "gr-container" },
        h("div", { className: "gr-footer-top" },
          h("div", { className: "gr-footer-brand" },
            h(Logo, { size: 30, wordmark: true }),
            h("p", null, "Independent projects exploring how Rust and GPU computing can reshape engines, learning, and graphics.")),
          col("Projects", [["RustingEngine", GH + "RustingEngine", "copper"], ["RustingBrain", GH + "RustingBrain", "verdigris"], ["RustingShader", GH + "RustingShader", "cobalt"]]),
          col("Learn", [["Docs", "#docs"], ["Tutorials", "#tutorials"], ["Releases", GH + "RustingEngine/releases"]]),
          col("Community", [["Contributing", GH + ".github/blob/main/CONTRIBUTING.md"], ["Support", GH + ".github/blob/main/SUPPORT.md"], ["Code of Conduct", GH + ".github/blob/main/CODE_OF_CONDUCT.md"], ["GitHub", "https://github.com/GoingRusting"]])),
        h("div", { className: "gr-footer-bottom" },
          h("span", { className: "gr-footer-motto" }, "BUILD. MEASURE. EXPLORE."),
          h("span", null, "Projects evolve independently — check each repository for platform support and license terms."))));
  }

  var api = {
    Logo: Logo, Button: Button, Tag: Tag, Icon: Icon, SiteHeader: SiteHeader, Scene: Scene, HomeHero: HomeHero,
    ProjectTile: ProjectTile, ProjectPanel: ProjectPanel, StatRow: StatRow, CodeBlock: CodeBlock, Callout: Callout,
    DocsShell: DocsShell, TutorialPath: TutorialPath, SiteFooter: SiteFooter, PROJECTS: PROJECTS
  };
  window.GoingRusting = Object.assign(window.GoingRusting || {}, api);
})();
