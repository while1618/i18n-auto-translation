import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('CLI', () => {
  let originalArgv: string[];

  beforeEach(() => {
    originalArgv = [...process.argv];
    process.argv.push('--key=test');
    process.argv.push('--to=sr');
    process.argv.push('--filePath=./tests/i18n/en.json');
    process.argv.push('--dirPath=./tests/i18n/');
  });

  afterEach(() => {
    process.argv = originalArgv;
    vi.resetModules();
  });

  it('should have all parameters', async () => {
    const { argv } = await import('../src/translate/cli');
    expect(argv.apiProvider).toBe('google-official');
    expect(argv.key).toBe('test');
    expect(argv.region).toBe('global');
    expect(argv.filePath).toBe('./tests/i18n/en.json');
    expect(argv.dirPath).toBe('./tests/i18n/');
    expect(argv.from).toBe('en');
    expect(argv.to).toBe('sr');
    expect(argv.override).toBe(false);
    expect(argv.certificatePath).toBeUndefined();
    expect(argv.spaces).toBe(2);
    expect(argv.maxLinesPerRequest).toBe(50);
    expect(argv.context).toBeUndefined();
    expect(argv.formality).toBe('default');
    expect(argv.trim).toBe(true);
    expect(argv.delay).toBe(250);
    expect(argv.saveTo).toBeUndefined();
  });
});
