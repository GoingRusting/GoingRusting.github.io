/* RustingShader's End sky (black hole, accretion disk, nebula, stars) in WebGL.
   The fragment shader is a port of RustingShader/shaders/lib/end.glsl (END_STYLE 1,
   default BH_* settings) plus the tone mapping from program/final.fsh, so the
   site shows the same black hole as the pack. Returns null without WebGL; the
   caller then falls back to the canvas 2D scene. */
import type { SceneOptions } from './scene';

const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';

const FRAG = `precision highp float;
uniform vec2 uRes; uniform vec2 uHole; uniform float uScale; uniform float uTime; uniform vec2 uPar;

#define BH_SIZE 2.0
#define BH_SPIN 1.0
#define BH_BRIGHTNESS 1.0
#define END_NEBULA 1.0

float luminance(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
float ign(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
float hash13(vec3 p3) {
  p3 = fract(p3 * 0.1031);
  p3 += dot(p3, p3.zyx + 31.32);
  return fract((p3.x + p3.y) * p3.z);
}
float vnoise3(vec3 p) {
  vec3 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash13(i), hash13(i + vec3(1.0, 0.0, 0.0)), f.x),
                 mix(hash13(i + vec3(0.0, 1.0, 0.0)), hash13(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
             mix(mix(hash13(i + vec3(0.0, 0.0, 1.0)), hash13(i + vec3(1.0, 0.0, 1.0)), f.x),
                 mix(hash13(i + vec3(0.0, 1.0, 1.0)), hash13(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);
}
float fbm3(vec3 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { s += vnoise3(p) * a; p = p * 2.03 + vec3(1.7, 9.2, 3.1); a *= 0.5; }
  return s / 0.9375;
}
vec3 endHoleDir() { return normalize(vec3(0.45, 0.3, -0.84)); }

vec3 endSpace(vec3 d) {
  float t = uTime * 0.004;
  vec3 q = d * 2.0;
  vec3 w = vec3(fbm3(q + t), fbm3(q + 5.2 - t), fbm3(q + 9.7));
  float n    = fbm3(q * 1.4 + w * 2.2);
  float dust = fbm3(q * 3.1 + w * 3.0 + 20.0);
  vec3 neb = mix(vec3(0.22, 0.04, 0.42), vec3(0.03, 0.28, 0.5), smoothstep(0.35, 0.65, w.x));
  neb = mix(neb, vec3(0.85, 0.18, 0.5), smoothstep(0.55, 0.75, w.y));
  float dens = smoothstep(0.4, 0.85, n) * (1.0 - smoothstep(0.45, 0.7, dust) * 0.9);
  vec3 col = neb * dens * dens * 0.35 * END_NEBULA + vec3(0.002, 0.001, 0.004);
  for (int i = 0; i < 2; i++) {
    float scale = i == 0 ? 90.0 : 220.0;
    vec3 sp = d * scale;
    vec3 cell = floor(sp);
    float h = hash13(cell + float(i) * 13.0);
    const float th = 0.985;
    if (h > th) {
      vec3 c = vec3(hash13(cell + 1.3), hash13(cell + 7.1), hash13(cell + 3.7)) - 0.5;
      vec3 f = fract(sp) - 0.5 - c * 0.6;
      float s = exp(-dot(f, f) * 50.0) * (h - th) / (1.0 - th);
      vec3 tint = mix(vec3(1.0, 0.75, 0.55), vec3(0.65, 0.8, 1.0), hash13(cell + 5.0));
      col += tint * s * (i == 0 ? 6.0 : 2.0) * (1.0 - dust * 0.7);
    }
  }
  return col;
}

vec3 diskGlow(float r, float ang, float side) {
  if (r < 1.3 || r > 7.0) return vec3(0.0);
  float t = uTime * BH_SPIN;
  float a = ang + t * 1.2 / pow(r, 1.5) + log(r) * 2.5;
  float n = vnoise3(vec3(cos(a) * 3.0, sin(a) * 3.0, r * 2.5)) * 0.55
          + vnoise3(vec3(cos(a) * 9.0, sin(a) * 9.0, r * 9.0)) * 0.3
          + vnoise3(vec3(cos(a) * 20.0, sin(a) * 20.0, r * 30.0)) * 0.15;
  float lanes = 0.75 + 0.25 * sin(r * 18.0 + n * 9.0);
  float I = smoothstep(1.3, 1.7, r) * (1.0 - smoothstep(3.0, 7.0, r)) / (r * r) * 3.0;
  I *= (0.15 + 1.6 * n * n * n) * lanes;
  float x = smoothstep(1.5, 5.0, r);
  vec3 temp = mix(vec3(1.0, 0.92, 0.85), vec3(1.0, 0.42, 0.1), smoothstep(0.0, 0.5, x));
  temp = mix(temp, vec3(0.6, 0.08, 0.12), smoothstep(0.5, 1.0, x));
  float beam = pow(1.0 + 0.55 * side, 3.0);
  temp = mix(temp, vec3(0.75, 0.85, 1.0), max(side, 0.0) * 0.35 * (1.0 - x));
  return temp * I * beam * 8.0 * BH_BRIGHTNESS;
}

vec3 endSky(vec3 d) {
  vec3  bh   = endHoleDir();
  float R    = 0.08 * BH_SIZE;
  float cosA = dot(d, bh);
  float a    = acos(clamp(cosA, -1.0, 1.0));
  vec3  perp = d - bh * cosA;
  float pl   = length(perp);
  perp = pl > 1e-5 ? perp / pl : vec3(0.0, 1.0, 0.0);

  float rE = R * 1.7;
  float a2 = a - rE * rE / max(a, 1e-4);
  vec3 col = endSpace(bh * cos(a2) + perp * sin(a2));
  col *= smoothstep(R * 1.0, R * 1.15, a);

  float cosMax  = cos(min(R * 8.0, 3.14));
  float cosHalf = cos(min(R * 4.0, 3.14));
  if (cosA > cosMax) {
    vec3 u = normalize(cross(bh, vec3(0.15, 1.0, 0.05)));
    vec3 v = cross(u, bh);
    vec2 q = vec2(dot(perp, u), dot(perp, v)) * a / R;
    float tilt = 0.18;
    float rr = length(q);
    col += vec3(1.0, 0.8, 0.6) * exp(-pow((rr - 1.12) / 0.025, 2.0)) * 2.0 * BH_BRIGHTNESS;
    if (rr > 1.1) {
      float hr = 1.3 + (rr - 1.15) * 4.0;
      vec3 halo = diskGlow(hr, atan(q.y, q.x) * 1.0 + 1.3, q.x / rr * 0.6);
      col += halo * smoothstep(1.1, 1.25, rr) * (0.3 + 0.7 * abs(q.y) / rr) * 0.7;
    }
    vec2 dp = vec2(q.x, q.y / tilt);
    float r = length(dp);
    vec3 front = diskGlow(r, atan(dp.y, dp.x), dp.x / max(r, 1e-3));
    float behind = dp.y > 0.0 ? smoothstep(1.0, 1.15, rr) : 1.0;
    front *= behind;
    float cover = clamp(luminance(front) * 2.0, 0.0, 1.0);
    col = col * (1.0 - cover * 0.8) + front;
    col += vec3(0.5, 0.2, 0.35) * exp(-rr * 0.5) * 0.12 * BH_BRIGHTNESS * smoothstep(1.0, 1.15, rr) * smoothstep(cosMax, cosHalf, cosA);
  }
  return col;
}

vec3 aces(vec3 x) { return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }

void main() {
  // Camera looks straight at the hole (nudged by the pointer); the hole lands on uHole.
  vec3 f = endHoleDir();
  vec3 right = normalize(cross(f, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(right, f);
  f = normalize(f - right * uPar.x * 0.05 + up * uPar.y * 0.03);
  right = normalize(cross(f, vec3(0.0, 1.0, 0.0)));
  up = cross(right, f);
  vec2 px = (gl_FragCoord.xy - uHole) / uScale * 0.08 * BH_SIZE;
  vec3 d = normalize(f + right * px.x + up * px.y);

  vec3 color = endSky(d);
  // final.fsh: auto exposure in the End (eye brightness 0), ACES, gamma, grade.
  color = aces(color * 2.2);
  color = pow(color, vec3(1.0 / 2.2));
  color = mix(vec3(luminance(color)), color, 1.15);
  color = (color - 0.5) * 1.05 + 0.5;
  vec3 grade = mix(vec3(0.93, 1.0, 1.06), vec3(1.04, 1.0, 0.95), smoothstep(0.1, 0.75, luminance(color)));
  color *= grade;
  color += (ign(gl_FragCoord.xy) - 0.5) / 255.0;
  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}`;

export function startBlackHole(canvas: HTMLCanvasElement, opt: SceneOptions): (() => void) | null {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) return null;
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog); gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const U = (n: string) => gl.getUniformLocation(prog, n);
  const uRes = U('uRes'), uHole = U('uHole'), uScale = U('uScale'), uTime = U('uTime'), uPar = U('uPar');

  let W = 1, H = 1, raf = 0, alive = true, visible = true;
  const still = !!opt.still || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const par = { x: 0, y: 0 }, target = { x: 0, y: 0 };
  const t0 = performance.now() - (opt.seed || 0) * 1000;
  const frame = (now: number) => {
    const t = still ? 4 + (opt.seed || 0) : (now - t0) / 1000;
    par.x += (target.x - par.x) * 0.04; par.y += (target.y - par.y) * 0.04;
    // Panels: hole at focusX, clear of the code card; narrow panels keep it in the top band above the copy.
    // Short canvases (tiles, docs banner) scale it to their height.
    const k = canvas.width / W, panel = H >= 300, narrow = panel && W < 720;
    const hx = W * (narrow ? 0.5 : (opt.focusX || 0.68));
    const hy = !panel ? H * 0.36 : narrow && H > 500 ? 150 : H * 0.42;
    const scale = !panel ? H * 0.1 : narrow ? W * 0.05 : Math.min(W * 0.034, H * 0.068);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform2f(uHole, hx * k, (H - hy) * k);
    gl.uniform1f(uScale, scale * k);
    gl.uniform1f(uTime, t);
    gl.uniform2f(uPar, par.x, par.y);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const resize = () => {
    const rc = canvas.getBoundingClientRect();
    // ponytail: render at ≤1x device pixels; the scene is soft and this keeps big panels cheap.
    const dpr = Math.min(devicePixelRatio || 1, 1);
    W = Math.max(1, rc.width); H = Math.max(1, rc.height);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    frame(performance.now());
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
  resize();
  const ro = new ResizeObserver(resize); ro.observe(canvas);
  const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; }); io.observe(canvas);
  addEventListener('pointermove', onMove, { passive: true });
  if (!still) raf = requestAnimationFrame(loop);
  return () => {
    alive = false; cancelAnimationFrame(raf);
    ro.disconnect(); io.disconnect();
    removeEventListener('pointermove', onMove);
  };
}
