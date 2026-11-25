import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const distClientDir = path.join(rootDir, 'dist', 'client');
const distIndex = path.join(distClientDir, 'index.html');
const distAssets = path.join(distClientDir, 'assets');
const rootIndex = path.join(rootDir, 'index.html');
const rootAssets = path.join(rootDir, 'assets');
const noJekyll = path.join(rootDir, '.nojekyll');

if (!fs.existsSync(distIndex) || !fs.existsSync(distAssets)) {
  throw new Error('dist/client build output not found. Run vite build first.');
}

fs.copyFileSync(distIndex, rootIndex);
fs.rmSync(rootAssets, { recursive: true, force: true });
fs.cpSync(distAssets, rootAssets, { recursive: true });
fs.writeFileSync(noJekyll, '');
