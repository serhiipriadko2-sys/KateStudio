/* global console, process */
import fs from 'node:fs';
import path from 'node:path';

const rootPackagePath = path.resolve('package.json');
const rootLockPath = path.resolve('package-lock.json');

const rootPackage = JSON.parse(fs.readFileSync(rootPackagePath, 'utf8'));
const rootLock = JSON.parse(fs.readFileSync(rootLockPath, 'utf8'));

const expectedVite = '6.0.5';

const configuredVite = rootPackage?.overrides?.vite;
if (configuredVite !== expectedVite) {
  console.error(
    `[verify:toolchain] Expected package.json overrides.vite=${expectedVite}, got ${String(configuredVite)}`
  );
  process.exit(1);
}

const lockVite = rootLock?.packages?.['node_modules/vite']?.version;
if (lockVite !== expectedVite) {
  console.error(
    `[verify:toolchain] Expected package-lock node_modules/vite=${expectedVite}, got ${String(lockVite)}`
  );
  process.exit(1);
}

console.log('[verify:toolchain] OK');
