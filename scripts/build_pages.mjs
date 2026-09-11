import { spawnSync } from 'node:child_process';
import { cpSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const build = spawnSync(process.execPath, [resolve(root, 'node_modules/next/dist/bin/next'), 'build', '--webpack'], {
  cwd: root, stdio: 'inherit', env: { ...process.env, NEXT_PUBLIC_BASE_PATH: '/pcef_workshop_site_mockup' },
});
if (build.error) throw build.error;
if (build.status !== 0) process.exit(build.status ?? 1);
rmSync(resolve(root, 'docs'), { recursive: true, force: true });
cpSync(resolve(root, 'out'), resolve(root, 'docs'), { recursive: true });
writeFileSync(resolve(root, 'docs/.nojekyll'), '');
console.log('Prepared docs/ for GitHub Pages. Run npm run check:export before committing.');
