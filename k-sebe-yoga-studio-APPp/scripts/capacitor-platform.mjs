import { spawnSync } from 'node:child_process';

const supportedPlatforms = new Set(['android', 'ios']);
const platform = process.argv[2];

if (!supportedPlatforms.has(platform)) {
  console.error(
    `Unsupported platform "${platform}". Use one of: ${Array.from(supportedPlatforms).join(', ')}`
  );
  process.exit(1);
}

const npmCommand = 'npm';

function runNpm(args, options = {}) {
  const result = spawnSync(npmCommand, args, {
    stdio: 'inherit',
    cwd: process.cwd(),
    shell: process.platform === 'win32',
    ...options,
  });

  if (result.error) {
    throw result.error;
  }

  return result.status ?? 1;
}

function runOrFail(args) {
  const status = runNpm(args);

  if (status !== 0) {
    process.exit(status);
  }
}

runOrFail(['run', 'build']);

const syncStatus = runNpm(['exec', 'cap', '--', 'sync', platform]);

if (syncStatus === 0) {
  process.exit(0);
}

runOrFail(['exec', 'cap', '--', 'add', platform]);
runOrFail(['exec', 'cap', '--', 'sync', platform]);
