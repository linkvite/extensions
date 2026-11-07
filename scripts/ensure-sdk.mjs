// While @linkvite/js v4 is linked from ../js (pnpm.overrides in package.json),
// build it if it hasn't been: its dist/ isn't committed, so a fresh checkout of
// ../js has no entry point and Vite can't resolve "@linkvite/js".
// Remove this script (and its calls in package.json) with the override once v4
// is on npm.
import {execSync} from 'node:child_process';
import {existsSync, lstatSync, realpathSync} from 'node:fs';
import path from 'node:path';

const link = path.resolve('node_modules/@linkvite/js');
if (!existsSync(link) || !lstatSync(link).isSymbolicLink()) process.exit(0); // installed from npm

const dir = realpathSync(link);
if (existsSync(path.join(dir, 'dist/index.js'))) process.exit(0);

console.log(`@linkvite/js is linked from ${dir} but not built; building it…`);
const run = cmd => execSync(cmd, {cwd: dir, stdio: 'inherit'});
if (!existsSync(path.join(dir, 'node_modules'))) run('pnpm install --frozen-lockfile');
run('pnpm build');
