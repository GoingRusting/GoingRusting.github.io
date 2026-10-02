import { getCollection, type CollectionEntry } from 'astro:content';
import { u, type ProjectId } from '../data/projects';

export type Page = CollectionEntry<'pages'>;
export type Kind = 'docs' | 'tutorials';

/** "engine/docs/getting-started" → "getting-started"; the docs index has no slug. */
export const slugOf = (p: Page) => { const s = p.id.split('/').slice(2).join('/'); return s === 'index' ? undefined : s; };
export const hrefOf = (p: Page) => u(`/${p.data.project}/${p.data.kind}/${slugOf(p) ? slugOf(p) + '/' : ''}`);

/** Pages of one project and kind, in sidebar order. */
export async function pagesOf(project: ProjectId, kind: Kind) {
  const all = await getCollection('pages', (p) => p.data.project === project && p.data.kind === kind);
  return all.sort((a, b) => a.data.order - b.data.order);
}

/** Sidebar groups in first-seen order. */
export function groupsOf(pages: Page[], active?: Page) {
  const groups = new Map<string, { label: string; href: string; active: boolean }[]>();
  for (const p of pages) {
    if (!groups.has(p.data.group)) groups.set(p.data.group, []);
    groups.get(p.data.group)!.push({ label: p.data.title, href: hrefOf(p), active: p.id === active?.id });
  }
  return [...groups].map(([title, links]) => ({ title, links }));
}
