/** @vitest-environment node */
import { TextDecoder, TextEncoder } from 'util';

globalThis.TextEncoder = TextEncoder as typeof globalThis.TextEncoder;
globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;

const loadConfig = async () => {
  const configModule = await import('./vite.config');
  const configExport = configModule.default;
  const resolved =
    typeof configExport === 'function'
      ? await configExport({ command: 'build', mode: 'production' } as any)
      : configExport;

  return resolved;
};

describe('vite config (web)', () => {
  it('uses esbuild minifier', async () => {
    const config = await loadConfig();
    expect(config.build?.minify).toBe('esbuild');
    expect(config.build?.minify).not.toBe('terser');
  });
});
