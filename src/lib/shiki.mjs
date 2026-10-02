// Shiki setup shared by markdown and <CodeBlock>: a theme built from the
// syntax-* tokens (see global.css) and a transformer that renders the
// design system's chamfered code card around every block.
import { createCssVariablesTheme } from 'shiki/core';

export const theme = createCssVariablesTheme({ name: 'goingrusting', variablePrefix: '--shiki-', fontStyle: true });

const NO_LN = new Set(['bash', 'sh', 'shell', 'console', 'powershell', 'text', 'plaintext', 'txt', '']);
const ICON = (d, cls) => ({ type: 'element', tagName: 'svg', properties: { class: `gr-icon ${cls}`, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.75, 'stroke-linecap': 'square', 'stroke-linejoin': 'miter', 'aria-hidden': 'true' }, children: [{ type: 'element', tagName: 'path', properties: { d }, children: [] }] });
const el = (tagName, properties, children = []) => ({ type: 'element', tagName, properties, children });
const text = (value) => ({ type: 'text', value });

/** opts: { title?, highlight?: number[], lineNumbers?: boolean, floating?: boolean } — markdown reads title="…" from the fence meta. */
export function grCode(opts = {}) {
  return {
    name: 'goingrusting-code',
    line(node, line) {
      const hl = opts.highlight ?? [];
      if (hl.includes(line)) this.addClassToHast(node, 'is-hl');
    },
    root(root) {
      const pre = root.children.find((n) => n.tagName === 'pre');
      if (!pre) return;
      const lang = this.options.lang ?? '';
      const title = opts.title ?? this.options.meta?.__raw?.match(/title="([^"]+)"/)?.[1] ?? '';
      const lines = this.source.replace(/\n$/, '').split('\n').length;
      const ln = opts.lineNumbers ?? (!NO_LN.has(lang) && lines > 1);
      pre.properties = { tabindex: 0 };
      const cls = ['gr-code', opts.floating && 'is-floating', !ln && 'no-ln'].filter(Boolean).join(' ');
      root.children = [el('figure', { class: cls }, [el('div', { class: 'gr-code-in' }, [
        el('div', { class: 'gr-code-bar' }, [
          el('span', { class: 'gr-code-file' }, [text(title)]),
          el('span', { class: 'gr-code-lang' }, [text(lang === 'plaintext' ? 'text' : lang)]),
          el('button', { type: 'button', class: 'gr-code-copy', 'aria-label': 'Copy code' }, [ICON('M9 9h11v11H9zM5 15V4h11', 'i-copy'), ICON('M5 12.5l4.5 4.5L19 7', 'i-check')]),
        ]),
        pre,
      ])])];
    },
  };
}
