GoingRusting is an organization that rethinks old things with Rust. Its site is dark, precise and warm: a near-black blueprint ground, cream type, and copper — the colour of the G. Every project oxidises into its own material, so the site always tells you where you are.

## Voice

- Plain, measured, curious. The org's own lines set the tone: "Rethinking engines, learning, and graphics." · "BUILD. MEASURE. EXPLORE." · "RUST / GPU / POSSIBILITY".
- Lead with what a thing does, then the evidence. Numbers only when measured, always with the hardware: "2,191 FPS — 10,000 GPU-simulated cubes on an RTX 3060."
- Sentence case for headings and buttons; verb first ("Read the docs", "Start tutorial"). Uppercase only in kickers.
- "We" for the org, "you" for the reader. No exclamation marks, no emoji, no hype words ("blazing", "revolutionary").
- Project names are one word, CamelCase, never translated or spaced: RustingEngine, RustingBrain, RustingShader.

## Colour

- Ground is `surface-100` (#16191d, the banner's). Scenes, code and the footer sit deeper on `surface-000`; cards and the docs sidebar rise to `surface-200`; hovers and inputs use `surface-300`.
- Text is cream `ink` for headlines, `ink-soft` for body, `ink-muted` for kickers and metadata, `ink-faint` for mottos and line numbers. Never pure white.
- **Materials — one per project, swapped with `data-theme`:**
  - `copper` (#ef925e) — the org and **RustingEngine**. Theme `copper`.
  - `verdigris` (#5fd0b3) — the green patina copper grows — **RustingBrain**. Theme `verdigris`.
  - `cobalt` (#86a9ff) — cobalt glass, deep space and water — **RustingShader**. Theme `cobalt`.
- Components only ever use `accent`, `accent-strong`, `accent-soft`, `accent-line`, `on-accent`, `scene-hot` and `glow-accent`. Put `data-theme="verdigris"` on a section and everything inside — buttons, tags, links, code highlights, the 3D scene — becomes RustingBrain.
- Copper stays the org's signature everywhere: the G, "Rusting" in the wordmark, and `syntax-keyword` in code, whatever the theme.
- Text on an accent fill is `on-accent` (dark), never white. Status colours (`success`, `warning`, `danger`) always come with an icon and a word.

## Type

- Display: **Chakra Petch** (`--font-display`) — its chamfered corners echo the G. `display-xl` for the home wordmark only, `display-l` for project names, `heading-1…3` for docs.
- Text: **IBM Plex Sans** (`--font-sans`) — `body-l` for ledes, `body` for prose at 72ch max, `body-s` for UI.
- Mono: **JetBrains Mono** (`--font-mono`) — code, `stat` figures, and `kicker` labels (uppercase, 0.18em tracking, after a 32×3px accent dash).
- In a project name, colour the second word with `accent`: Rusting<b>Engine</b>. In the org wordmark, "Going" is `ink`, "Rusting" is `copper`.
- All three are Google Fonts; `components/bundle.css` imports them.

## Shape — the chamfer

- The G is square-capped and mitered: the UI has no rounded corners (`radius-0`). `radius-sm` softens inputs and kbd keys; `radius-lg` only frames a banner image.
- The signature move is the **45° chamfer** cut from the G's corners: `chamfer-sm` on tags, `chamfer-md` on buttons (top-left + bottom-right), `chamfer-lg` on cards and code cards (top-left), `chamfer-xl` on large frames.
- Borders are 1px `line-200` hairlines; control borders are `line-300` (3:1). Depth comes from light — `glow-accent` — not grey drop shadows; `lift` only for code cards floating over scenes.

## Space and layout

- 4px base; the blueprint grid behind heroes is 32px (`space-8`) in `grid`, faded with a radial mask.
- Container `content-max` 1240px with `space-8` gutters (`space-4` under 720px). Sections are separated by `space-24`.
- Docs: `sidebar-w` 264px navigation, `prose-max` 720px article, a 208px "On this page" column above 1180px.

## 3D scenes

Every project owns a live 3D background, drawn by `Scene` on a canvas with no dependencies:

- `forge` — the G mark extruded in copper, cream cap, orbiting sparks over a perspective floor. Home hero only.
- `engine` — a wireframe icosahedron around an octahedron and a cube, inside a field of falling instanced cubes. RustingEngine.
- `brain` — six layers of neurons with signals (`scene-hot`, copper) firing forward through verdigris synapses. RustingBrain.
- `shader` — a lensed black hole: photon ring, Doppler-bright accretion disk crossing in front of the shadow, a bent starfield. RustingShader.

Rules: a scene is always a background — text sits on a shade gradient (`surface-000`/`surface-100` → transparent) and never directly on geometry. Scenes follow the pointer gently, pause off-screen, and render one still frame under `prefers-reduced-motion`. Use one large scene per viewport; tiles may use small ones (`density` 0.45).

## Motion

- `duration-fast` for hover colour, `duration-base` for tile lift and menus, `duration-slow` for section reveals. Arrows nudge 3px on hover. Nothing bounces.
- Respect `prefers-reduced-motion`: transitions off, scenes still.

## Focus

- Keyboard focus is `focus-ring`: a 2px `surface-100` gap, then a 2px cream ring — at least 12.7:1 on every surface, in every theme.

## Iconography

- The sources ship no icon set. Components use a small built-in set (`Icon`): 24px grid, 1.75px stroke, square caps and miter joins to match the G. Extend it in the same style or substitute Lucide at stroke 1.75 with square caps — flagged as a substitute.
- Never draw third-party logos (GitHub etc.); write the name with an `arrowUpRight` icon.

## Logo

- `assets/Logos/GoingRusting.svg` is the mark — copper G, cream cap, transparent ground. Use it on `surface-000`/`surface-100` only. The `Logo` component renders the same geometry.
- The wordmark is the name set in Chakra Petch 700: "Going" in `ink`, "Rusting" in `copper`.
- `assets/Brand/banner.png` is the GitHub banner — reference for the brand's composition.
