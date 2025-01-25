import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('axios');

describe('Translate', () => {
  let originalArgv: string[];

  beforeEach(() => {
    originalArgv = [...process.argv];
    process.argv.push('--key=test');
    process.argv.push('--to=sr');
  });

  afterEach(() => {
    process.argv = originalArgv;
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('should translate file from en to sr, translation already there, just remove old and add new translations', async () => {
    process.argv.push('--filePath=./tests/i18n/nested/en.json');

    const { Translate } = await import('../src/translate/translate');
    const { AzureOfficialAPI } = await import('../src/translate/providers/azure-official-api');

    const translatedFilePath = path.resolve(__dirname, 'i18n/nested/sr.json');
    const translations = [{ translations: [{ text: `Novo${Translate.sentenceDelimiter}` }] }];
    vi.spyOn(axios, 'post').mockResolvedValue({ data: translations });
    await new AzureOfficialAPI().translate();

    expect(fs.readFileSync(translatedFilePath, 'utf-8')).toEqual(
      JSON.stringify(
        {
          example: 'Zdravo, ovo je primer',
          object: {
            test: 'Zdravo, ovo je test',
          },
          new: 'Novo',
        },
        null,
        2,
      ),
    );

    fs.writeFileSync(
      translatedFilePath,
      JSON.stringify(
        {
          example: 'Zdravo, ovo je primer',
          hello: 'Zdravo',
          object: {
            test: 'Zdravo, ovo je test',
          },
        },
        null,
        2,
      ),
    );
  });

  it("should translate file from en to sr, translation doesn't exists", async () => {
    process.argv.push('--filePath=./tests/i18n/en.json');

    const { Translate } = await import('../src/translate/translate');
    const { AzureOfficialAPI } = await import('../src/translate/providers/azure-official-api');

    const translatedFilePath = path.resolve(__dirname, 'i18n/sr.json');
    const translations = [
      {
        translations: [
          {
            text: `Zdravo, ovo je primer${Translate.sentenceDelimiter}Zdravo${Translate.sentenceDelimiter}Zdravo, ovo je test`,
          },
        ],
      },
    ];
    vi.spyOn(axios, 'post').mockResolvedValue({ data: translations });
    await new AzureOfficialAPI().translate();

    expect(fs.readFileSync(translatedFilePath, 'utf-8')).toEqual(
      JSON.stringify(
        {
          example: 'Zdravo, ovo je primer',
          hello: 'Zdravo',
          object: {
            test: 'Zdravo, ovo je test',
          },
        },
        null,
        2,
      ),
    );
  });

  it('should print file already translated', async () => {
    process.argv.push('--filePath=./tests/i18n/en.json');

    const { AzureOfficialAPI } = await import('../src/translate/providers/azure-official-api');

    const translatedFilePath = path.resolve(__dirname, 'i18n/sr.json');
    const logSpy = vi.spyOn(console, 'log');
    await new AzureOfficialAPI().translate();
    expect(logSpy).toHaveBeenCalledWith('\nEverything already translated for: tests/i18n/sr.json');
    fs.unlinkSync(translatedFilePath);
  });

  it('should translate files from en to sr, in a directory', async () => {
    process.argv.push('--dirPath=./tests/i18n/');

    const { Translate } = await import('../src/translate/translate');
    const { AzureOfficialAPI } = await import('../src/translate/providers/azure-official-api');

    const translatedFilePath1 = path.resolve(__dirname, 'i18n/sr.json');
    const translatedFilePath2 = path.resolve(__dirname, 'i18n/nested/sr.json');
    const translations = [
      {
        translations: [
          {
            text: `Zdravo, ovo je primer${Translate.sentenceDelimiter}Zdravo${Translate.sentenceDelimiter}Zdravo, ovo je test`,
          },
        ],
      },
    ];
    vi.spyOn(axios, 'post').mockResolvedValue({ data: translations });
    await new AzureOfficialAPI().translate();
    expect(axios.post).toHaveBeenCalledTimes(2);

    fs.unlinkSync(translatedFilePath1);
    fs.writeFileSync(
      translatedFilePath2,
      JSON.stringify(
        {
          example: 'Zdravo, ovo je primer',
          hello: 'Zdravo',
          object: {
            test: 'Zdravo, ovo je test',
          },
        },
        null,
        2,
      ),
    );
  });
});
