# Button

Chamfered action button; primary uses the current theme's `accent`, so it follows the project.

- Props: `variant` `primary | secondary | ghost`, `size` `sm | md | lg`, `icon` (an `Icon` name), `arrow` (`true` → arrow right, `"external"` → arrow up-right), `href` (renders a link), plus native button props.
- One primary per view — the thing the page is for. Secondary for the alternative; ghost for GitHub and tertiary links.
- Labels are verb-first, sentence case: "Read the docs", "Start tutorial".
- Do not place on a raw 3D scene without a shade behind it.
