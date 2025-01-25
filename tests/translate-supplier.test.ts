import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('Translate Supplier', () => {
  let originalArgv: string[];

  beforeEach(() => {
    originalArgv = [...process.argv];
    process.argv.push('--key=test');
    process.argv.push('--to=sr');
  });

  afterEach(() => {
    process.argv = originalArgv;
    vi.resetModules();
  });

  it('should get right translate provider based on string', async () => {
    const { GoogleOfficialAPI } = await import('../src/translate/providers/google-official-api');
    const { TranslateSupplier } = await import('../src/translate/translate-supplier');
    const provider = TranslateSupplier.getProvider('google-official');
    expect(provider).toBeInstanceOf(GoogleOfficialAPI);
  });
});
