import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('Bad Arguments', () => {
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

  it('should throw error, both filePath and dirPath provided', async () => {
    process.argv.push('--filePath=test');
    process.argv.push('--dirPath=sr');
    const { AzureOfficialAPI } = await import('../src/translate/providers/azure-official-api');
    await expect(new AzureOfficialAPI().translate()).rejects.toThrow(
      'You should only provide a single file or a directory.',
    );
  });

  it('should throw error, filePath or dirPath not provided', async () => {
    const { AzureOfficialAPI } = await import('../src/translate/providers/azure-official-api');
    await expect(new AzureOfficialAPI().translate()).rejects.toThrow(
      'You must provide a single file or a directory.',
    );
  });

  it('should throw error, empty directory provided', async () => {
    process.argv.push('--dirPath=test');
    const { AzureOfficialAPI } = await import('../src/translate/providers/azure-official-api');
    await expect(new AzureOfficialAPI().translate()).rejects.toThrow(
      'Nothing to translate in directory: test',
    );
  });
});
