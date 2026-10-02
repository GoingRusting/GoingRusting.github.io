# Scene

A live 3D background on a canvas — no libraries. Fills its positioned parent.

- Props: `kind` `forge | engine | brain | shader`, `density` (0–1, fewer objects for tiles), `focusX`/`focusY` (0–1, where the subject sits), `fill` (forge scale), `still` (one frame), `interactive` (pointer parallax, default on), `theme` (sets `data-theme` on the scene only).
- Colours are read live from `--accent`, `--scene-hot`, `--ink` and `--surface-000`, so any ancestor's `data-theme` reskins it.
- The parent must be `position: relative` with a height and `overflow: hidden`. Put a shade gradient between the scene and any text.
- Pauses off-screen and when the tab is hidden; renders a single still frame under `prefers-reduced-motion`.
