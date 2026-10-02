# DocsShell

The docs page frame: project switcher, search and navigation on the left; a themed scene banner with breadcrumb, title and tags; the article; "On this page" on the right.

- Props: `project`, `title`, `crumbs` (strings), `meta` (tags), `version`, `nav` (`[{ title, items: [{ label, href?, active?, tag? }] }]`), `toc` (`[{ label, href?, active?, sub? }]`), children (the article).
- Article children may use `p`, `h2`, `h3`, `ul`, inline `code`, `CodeBlock`, `Callout` and a `.gr-docs-pager` block.
- Place a `SiteHeader project=… active="Docs"` above it.
