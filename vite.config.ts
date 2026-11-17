import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Generate a unique release marker for every GitHub Pages deployment.
function offlineShell(): Plugin {
  const release = process.env.GITHUB_SHA?.slice(0, 12) ?? 'local';
  return {
    name: 'rivals-offline-shell',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace('</head>', `<meta name="rivals-build" content="${release}"/></head>`);
    },
    async writeBundle({ dir = 'dist' }, bundle) {
      const files = [
        'index.html',
        'manifest.webmanifest',
        ...(await readdir(join(dir, 'icons'))).sort().map((file) => `icons/${file}`),
        ...(await readdir(join(dir, 'data'))).sort().map((file) => `data/${file}`),
        ...Object.keys(bundle).filter((file) => file.startsWith('assets/')).sort(),
      ];
      const workerPath = join(dir, 'sw.js');
      const worker = await readFile(workerPath, 'utf8');
      const hash = createHash('sha256').update(worker);
      for (const file of files) {
        hash.update(file).update(await readFile(join(dir, file)));
      }
      const config = { version: hash.digest('hex').slice(0, 16), files };
      await writeFile(workerPath, `const offlineBuild = ${JSON.stringify(config)};\n${worker}`);
      await writeFile(join(dir, 'release.json'), JSON.stringify({ version: release }));
    },
  };
}

export default defineConfig({ plugins: [react(), offlineShell()], base: './' });
