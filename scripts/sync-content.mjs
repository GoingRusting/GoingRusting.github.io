// Pulls docs and tutorials from the GoingRusting repositories on GitHub into
// src/content/pages/. Run with `npm run sync-content`, then commit the result.
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ORG = 'GoingRusting';
const OUT = new URL('../src/content/pages/', import.meta.url);

// [repo path, slug, group, title override?, extra frontmatter?]
const MANIFEST = {
  engine: {
    repo: 'RustingEngine',
    docs: [
      ['README.md', 'index', 'Start', 'Overview'],
      ['docs/getting-started.md', 'getting-started', 'Start'],
      ['docs/concepts.md', 'concepts', 'Start'],
      ['editor_gui.md', 'editor', 'Guides'],
      ['docs/determinism.md', 'determinism', 'Guides'],
      ['docs/scripting.md', 'scripting', 'Guides'],
      ['architecture.md', 'architecture', 'Reference'],
      ['docs/dev-environment.md', 'dev-environment', 'Reference'],
      ['roadmap.md', 'roadmap', 'Reference'],
      ['CHANGELOG.md', 'changelog', 'Reference'],
    ],
    tutorials: [
      ['docs/tutorials/01-hello-cube.md', '01-hello-cube', 'Tutorials', null, { minutes: 10 }],
      ['docs/tutorials/02-coin-run-cli.md', '02-coin-run-cli', 'Tutorials'],
      ['docs/tutorials/03-gameplay-plugin.md', '03-gameplay-plugin', 'Tutorials'],
      ['docs/tutorials/04-gpu-cube-rain.md', '04-gpu-cube-rain', 'Tutorials'],
    ],
  },
  brain: {
    repo: 'RustingBrain',
    docs: [
      ['README.md', 'index', 'Start', 'Overview'],
      ['INSTALL_CUDA.md', 'install-cuda', 'Start'],
      ['IMPORT_MODELS.md', 'import-models', 'Guides'],
      ['docs/baseline.md', 'baseline', 'Reference'],
      ['CHANGELOG.md', 'changelog', 'Reference'],
    ],
    // Times and parts come from tutorials/README.md.
    tutorials: [
      ['tutorials/1_introduction.md', '1-introduction', 'Foundations', null, { minutes: 30 }],
      ['tutorials/2_setup.md', '2-setup', 'Foundations', null, { minutes: 10 }],
      ['tutorials/3_xor_problem.md', '3-xor-problem', 'Foundations', null, { minutes: 30 }],
      ['tutorials/4_data.md', '4-data', 'Foundations', null, { minutes: 45 }],
      ['tutorials/5_regression.md', '5-regression', 'The dense toolkit', null, { minutes: 45 }],
      ['tutorials/6_classification.md', '6-classification', 'The dense toolkit', null, { minutes: 45 }],
      ['tutorials/7_training_loop.md', '7-training-loop', 'The dense toolkit', null, { minutes: 60 }],
      ['tutorials/8_evaluation.md', '8-evaluation', 'The dense toolkit', null, { minutes: 45 }],
      ['tutorials/9_save_load.md', '9-save-load', 'The dense toolkit', null, { minutes: 40 }],
      ['tutorials/10_full_project.md', '10-full-project', 'The dense toolkit', null, { minutes: 90 }],
      ['tutorials/11_gpu_cuda.md', '11-gpu-cuda', 'Going further', null, { minutes: 60 }],
      ['tutorials/12_import_models.md', '12-import-models', 'Going further', null, { minutes: 45 }],
      ['tutorials/13_troubleshooting.md', '13-troubleshooting', 'Going further'],
      ['tutorials/14_language_model.md', '14-language-model', 'Language models', null, { minutes: 120 }],
      ['tutorials/15_mixture_of_experts.md', '15-mixture-of-experts', 'Language models', null, { minutes: 90 }],
      ['tutorials/16_training_an_llm.md', '16-training-an-llm', 'Language models'],
    ],
  },
  shader: {
    repo: 'RustingShader',
    docs: [
      ['README.md', 'index', 'Start', 'Overview'],
      ['CHANGELOG.md', 'changelog', 'Reference'],
    ],
    tutorials: [],
  },
};

const get = async (url, as = 'text') => {
  const res = await fetch(url, { headers: { 'User-Agent': 'goingrusting-site-sync' } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res[as]();
};

const route = (project, kind, slug) => `/${project}/${kind}/${slug === 'index' ? '' : slug + '/'}`;

// "**Bold** and [link](x) `code`" -> "Bold and link code"
const plain = (s) => s.replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[*`]/g, '').replace(/\s+/g, ' ').trim();

function convert(md, file, repo, routes, tree) {
  const dir = path.posix.dirname(file);
  // Only touch prose, never fenced code.
  const parts = md.split(/^(```[\s\S]*?^```)/m);
  for (let i = 0; i < parts.length; i += 2) {
    parts[i] = parts[i]
      .replace(/<!--[\s\S]*?-->\n?/g, '')
      .replace(/(!?)\[([^\]]*)\]\(([^)\s]+)\)/g, (all, bang, text, target) => {
        if (/^[a-z]+:|^#|^mailto:/i.test(target)) return all;
        const [p, hash = ''] = target.split('#');
        const resolved = path.posix.normalize(path.posix.join(dir, p));
        if (bang) {
          if (!tree.has(resolved)) return ''; // image missing upstream: drop it
          return `![${text}](https://raw.githubusercontent.com/${ORG}/${repo}/main/${resolved})`;
        }
        if (routes.has(resolved)) return `[${text}](${routes.get(resolved)}${hash ? '#' + hash : ''})`;
        return `[${text}](https://github.com/${ORG}/${repo}/blob/main/${resolved}${hash ? '#' + hash : ''})`;
      });
  }
  return parts.join('');
}

for (const [project, m] of Object.entries(MANIFEST)) {
  const treeJson = await get(`https://api.github.com/repos/${ORG}/${m.repo}/git/trees/main?recursive=1`, 'json');
  const tree = new Set(treeJson.tree.map((t) => t.path));
  const routes = new Map();
  for (const kind of ['docs', 'tutorials'])
    for (const [file, slug] of m[kind]) routes.set(file, route(project, kind, slug));

  await rm(new URL(`${project}/`, OUT), { recursive: true, force: true });
  for (const kind of ['docs', 'tutorials']) {
    await mkdir(new URL(`${project}/${kind}/`, OUT), { recursive: true });
    for (const [order, [file, slug, group, titleOverride, extra = {}]] of m[kind].entries()) {
      let md = await get(`https://raw.githubusercontent.com/${ORG}/${m.repo}/main/${file}`);
      md = convert(md, file, m.repo, routes, tree);
      const h1 = md.match(/^# (.+)$/m);
      if (h1) md = md.replace(h1[0], ''); // DocsShell renders the title
      const title = titleOverride ?? plain(h1?.[1] ?? slug);
      const firstPara = md.split(/\n\s*\n/).map((b) => b.trim()).find((b) => b && !/^([#>!|`<-]|\* |\d+\.)/.test(b) && !/^\*\*[^*]+:\*\*/.test(b));
      const fm = { title, project, kind, group, order, description: plain(firstPara ?? ''), source: `https://github.com/${ORG}/${m.repo}/blob/main/${file}`, ...extra };
      const yaml = Object.entries(fm).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join('\n');
      await writeFile(new URL(`${project}/${kind}/${slug}.md`, OUT), `---\n${yaml}\n---\n${md.trimStart()}`);
      console.log(`${project}/${kind}/${slug}  ${title}`);
    }
  }
}
