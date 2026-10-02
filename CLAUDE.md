# GoingRusting website

The website for the GoingRusting GitHub organization (https://github.com/GoingRusting): a welcome page that shows every project, plus docs and tutorials for each project in its own theme.

## Source of truth: `design-system/`

Everything visual comes from `design-system/`. Read these before writing UI:

1. `design-system/README.md`: the brand book (voice, colour, type, chamfer shape, 3D scenes, motion, focus).
2. `design-system/site-blueprint.md`: the page map and what each page is built from.
3. `design-system/tokens.json` / `tokens.css`: every colour, type style, space, radius, chamfer, shadow and duration token. Three themes: `copper` (org + RustingEngine), `verdigris` (RustingBrain), `cobalt` (RustingShader), switched with `data-theme`.
4. `design-system/components/<Name>/README.md`: usage rules per component. `components/index.d.ts` has the props.
5. `design-system/components/bundle.js` + `bundle.css`: a working reference implementation of every component, including the dependency-free canvas 3D scenes (`forge`, `engine`, `brain`, `shader`).
6. `design-system/reference/*.html`: the target design running live. Serve the folder (`npx serve design-system`) and open `reference/index.html`. `HomePage.html` and `DocsPage.html` are the two key pages.

## Rules

- Match the reference pages visually: same tokens, chamfers, spacing, scene behaviour. Port the components into real source files; do not load `bundle.js` at runtime.
- Use CSS custom properties from `tokens.css`. Never hard-code a colour that has a token. Components use `--accent*`, never a project colour directly.
- Port the 3D scenes faithfully (same geometry, colours read from CSS variables, pointer parallax, pause off-screen, one still frame under `prefers-reduced-motion`). Keep them dependency-free canvas 2D unless asked otherwise.
- Copy the logo from `design-system/assets/Logos/GoingRusting.svg`. Never redraw it.
- Fonts: Chakra Petch (display), IBM Plex Sans (text), JetBrains Mono (code/kickers). Self-host them via `@fontsource` packages.
- Numbers on the site must be measured ones from the project READMEs. Docs content comes from each repo's README, `docs/` and `tutorials/` folders. Don't invent APIs.
- Accessibility: text contrast as noted in tokens, the `focus-ring` on every focusable element, keyboard-navigable menus and search, no horizontal scroll at 360px.
