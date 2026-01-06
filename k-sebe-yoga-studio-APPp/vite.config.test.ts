import fs from 'fs';
import path from 'path';

const viteConfigPath = path.resolve(__dirname, 'vite.config.ts');

describe('vite config (app)', () => {
  it('uses esbuild minifier', () => {
    const content = fs.readFileSync(viteConfigPath, 'utf-8');
    expect(content).toMatch(/minify:\s*['"]esbuild['"]/);
    expect(content).not.toMatch(/minify:\s*['"]terser['"]/);
  });
});
