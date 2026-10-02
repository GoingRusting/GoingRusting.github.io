# Site blueprint

How the GoingRusting website is put together from this system. Every page is built from the components listed here; nothing else is needed.

## Map

| Route | Built from | Theme |
| --- | --- | --- |
| `/` | `HomeHero` → `ProjectPanel` × 3 (engine, brain right-aligned, shader) → `SiteFooter` | copper, then each project's |
| `/engine`, `/brain`, `/shader` | `SiteHeader project=…` → `ProjectPanel` → feature sections → `TutorialPath` teaser → `SiteFooter` | the project's |
| `/<project>/docs/…` | `SiteHeader project=… active="Docs"` → `DocsShell` with prose, `CodeBlock`, `Callout` | the project's |
| `/<project>/tutorials` | `DocsShell` (no TOC) wrapping `TutorialPath` | the project's |
| `/<project>/tutorials/<n>` | `DocsShell` with chapter prose; pager to previous / next chapter | the project's |

## The welcome screen

The first viewport carries everything:

1. `SiteHeader` (clear variant) — wordmark, Projects / Docs / Tutorials / Community, docs search (Ctrl K), GitHub.
2. Kicker "RUST / GPU / POSSIBILITY", the `display-xl` wordmark, the tagline, one sentence of mission, two buttons: "Explore the projects" (primary) and "Read the docs" (secondary).
3. The extruded G (`Scene kind="forge"`) on the right, over the blueprint grid.
4. One `ProjectTile` per project along the bottom: index, category, name, one-line description, its own live mini-scene in its own material.

Scrolling then gives each project a full-bleed `ProjectPanel`: its scene filling the far side, name, lede, measured stats, feature tags, three actions (Read the docs · Tutorials · GitHub) and a real code sample floating over the scene.

## Adding a project

1. Pick a material that is new in hue and lightness, text-safe (4.5:1) on `surface-000` to `surface-300`: add it, a `-strong` hover step and a theme whose `accent*`, `scene-hot` and `glow-accent` point at it.
2. Add an entry to `PROJECTS` (index, name, stem, kicker, short, lede, stats from real measurements, tags, a real code sample, repo).
3. Give it a scene: a geometric idea that is literally the project (an engine's primitives, a brain's neurons, a shader's light).

## Docs content rules

- Every page opens with one paragraph saying what you will have at the end.
- Show the install command before the first code sample.
- Code samples come from the repository's examples and are runnable as shown; highlight the lines the prose talks about.
- One `Callout` per section at most. `perf` callouts carry measured numbers and the hardware.
- End with the pager: previous and next page by title.
