# SiteHeader

The global bar: wordmark, main navigation, docs search, GitHub.

- Props: `active` (nav label to underline), `project` (`engine | brain | shader` — shows a chip and themes the header), `clear` (transparent, for heroes), `items` (`[label, href]` pairs).
- 64px (`header-h`), blurred `surface-100` at 72% so scenes glow through. Collapses to logo + menu under 900px.
- Search is a trigger for a command palette (Ctrl K); the consumer wires the palette.
