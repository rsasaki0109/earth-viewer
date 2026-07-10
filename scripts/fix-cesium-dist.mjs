/**
 * vite-plugin-cesium joins Vite `base` into both the public URL *and* the
 * on-disk copy destination. For a project Pages site with
 * base `/earth-viewer/`, that yields:
 *
 *   dist/earth-viewer/cesium/...   (wrong — double-prefixed under Pages)
 *
 * while index.html correctly requests:
 *
 *   /earth-viewer/cesium/...
 *
 * Move the folder so URLs and files line up under `dist/cesium/`.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'dist');

const rawBase = process.env.VITE_BASE ?? '/earth-viewer/';
const baseSegments = rawBase.split('/').filter(Boolean);

if (baseSegments.length === 0) {
  console.log('[fix-cesium-dist] base is root; nothing to fix');
  process.exit(0);
}

const wrongDir = path.join(outDir, ...baseSegments, 'cesium');
const rightDir = path.join(outDir, 'cesium');

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

if (!(await exists(wrongDir))) {
  if (await exists(rightDir)) {
    console.log('[fix-cesium-dist] cesium already at dist/cesium');
    process.exit(0);
  }
  console.error(`[fix-cesium-dist] expected ${wrongDir} but it is missing`);
  process.exit(1);
}

await fs.rm(rightDir, { recursive: true, force: true });
await fs.rename(wrongDir, rightDir);

// Remove empty intermediate dirs created by the double prefix (e.g. dist/earth-viewer).
let dir = path.dirname(wrongDir);
while (dir.startsWith(outDir) && dir !== outDir) {
  const entries = await fs.readdir(dir);
  if (entries.length > 0) break;
  await fs.rmdir(dir);
  dir = path.dirname(dir);
}

console.log(`[fix-cesium-dist] moved ${path.relative(outDir, wrongDir)} → cesium`);
