/** @vitest-environment node */
import { TextDecoder, TextEncoder } from 'util';
import type { ConfigEnv, UserConfigExport } from 'vite';

globalThis.TextEncoder = TextEncoder as typeof globalThis.TextEncoder;
globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;

const loadConfig = async () => {
  const configModule = await import('./vite.config');
  const configExport = configModule.default as UserConfigExport;
  const buildEnv: ConfigEnv = {
    command: 'build',
    mode: 'production',
  };
  const resolved = typeof configExport === 'function' ? await configExport(buildEnv) : configExport;

  return resolved;
};

describe('vite config (web)', () => {
  it('uses esbuild minifier', async () => {
    const config = await loadConfig();
    expect(config.build?.minify).toBe('esbuild');
  });
});
