#!/usr/bin/env node
/**
 * Image Optimization Script
 * Converts all JPG/PNG images in public/images/ to WebP format.
 *
 * Requirements: npm install --save-dev sharp
 * Usage:        npm run optimize:images
 *               npm run optimize:images -- --quality 80 --force
 */

import { createRequire } from 'module';
import { readdirSync, existsSync, statSync } from 'fs';
import { join, extname, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// ── Configuration ────────────────────────────────────────────────────────────

const QUALITY = parseInt(process.env.WEBP_QUALITY ?? '82', 10);
const FORCE = process.argv.includes('--force');

const IMAGE_DIRS = [
  join(__dirname, '../k-sebe-yoga-studioWEB/public/images'),
  join(__dirname, '../k-sebe-yoga-studio-APPp/public/images'),
];

const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);
// Skip PWA icons — they must stay PNG/ICO for manifest compatibility
const SKIP_DIRS = new Set(['icons']);

// ── Helpers ──────────────────────────────────────────────────────────────────

function* walkImages(dir) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkImages(full);
    } else if (EXTENSIONS.has(extname(entry.name).toLowerCase())) {
      yield full;
    }
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    console.error('❌  sharp is not installed. Run:  npm install --save-dev sharp');
    process.exit(1);
  }

  let converted = 0;
  let skipped = 0;
  let errors = 0;

  for (const dir of IMAGE_DIRS) {
    const relDir = relative(join(__dirname, '..'), dir);
    console.log(`\n📂  ${relDir}`);

    for (const src of walkImages(dir)) {
      const webpPath = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      const relSrc = relative(dir, src);

      if (!FORCE && existsSync(webpPath)) {
        console.log(`  ⏭  ${relSrc}  (already exists, skip)`);
        skipped++;
        continue;
      }

      try {
        const srcBytes = statSync(src).size;
        await sharp(src).webp({ quality: QUALITY }).toFile(webpPath);
        const dstBytes = statSync(webpPath).size;
        const saving = (((srcBytes - dstBytes) / srcBytes) * 100).toFixed(1);
        console.log(
          `  ✅  ${relSrc}  ${(srcBytes / 1024).toFixed(0)} KB → ${(dstBytes / 1024).toFixed(0)} KB  (-${saving}%)`
        );
        converted++;
      } catch (err) {
        console.error(`  ❌  ${relSrc}:`, err.message);
        errors++;
      }
    }
  }

  console.log(`\n🎉  Done: ${converted} converted, ${skipped} skipped, ${errors} errors`);
  if (errors > 0) process.exit(1);
}

main();
