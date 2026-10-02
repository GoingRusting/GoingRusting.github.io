import { defineConfig } from 'astro/config';
import { theme, grCode } from './src/lib/shiki.mjs';

// GitHub Pages: the deploy workflow passes SITE_URL and BASE_PATH from actions/configure-pages.
const base = process.env.BASE_PATH || '/';

// Synced docs link to each other with root-relative routes; prefix them with the base.
const rehypeBaseLinks = () => (tree) => {
  const walk = (node) => {
    if (node.tagName === 'a' && node.properties?.href?.startsWith('/') && base !== '/')
      node.properties.href = base.replace(/\/$/, '') + node.properties.href;
    node.children?.forEach(walk);
  };
  walk(tree);
};

export default defineConfig({
  site: process.env.SITE_URL || 'https://goingrusting.github.io',
  base,
  trailingSlash: 'always',
  markdown: {
    shikiConfig: { theme, transformers: [grCode()] },
    rehypePlugins: [rehypeBaseLinks],
  },
});
