// Copy exercise artwork from @bryllim/workout-guide into public/workouts/.
// Downscales to 160px with macOS `sips` when available (thumbnails render <=48px);
// falls back to raw copies elsewhere.
import { cpSync, mkdirSync, readdirSync, existsSync } from 'fs';
import { execFileSync } from 'child_process';
import path from 'path';

const SRC = path.resolve('node_modules/@bryllim/workout-guide/assets');
const DEST = path.resolve('public/workouts');

if (!existsSync(SRC)) {
  console.error('copy-workouts: run npm install first (' + SRC + ' missing)');
  process.exit(1);
}

const hasSips = process.platform === 'darwin';
mkdirSync(DEST, { recursive: true });

let count = 0;
for (const slug of readdirSync(SRC)) {
  const srcDir = path.join(SRC, slug);
  const destDir = path.join(DEST, slug);
  if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });
  for (const file of readdirSync(srcDir)) {
    if (!file.endsWith('.png')) continue;
    const from = path.join(srcDir, file);
    const to = path.join(destDir, file);
    if (hasSips) {
      try {
        execFileSync('sips', ['-Z', '160', from, '--out', to], { stdio: 'ignore' });
      } catch {
        cpSync(from, to);
      }
    } else {
      cpSync(from, to);
    }
    count++;
  }
}
console.log(`copy-workouts: ${count} frames -> ${DEST}`);
