/* eslint-disable import/first */
process.argv.push('--key=test');
process.argv.push('--dirPath=./tests/i18n/');
process.argv.push('--to=sr');

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { AzureTranslateResponse } from '../../src/translate/payload';
import { AzureRapidAPI } from '../../src/translate/providers/azure-rapid-api';
import { Translate } from '../../src/translate/translate';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const translatedFilePath1 = path.resolve(__dirname, '../i18n/sr.json');
const translatedFilePath2 = path.resolve(__dirname, '../i18n/nested/sr.json');

describe('AzureRapid Provider', () => {
  afterEach(() => {
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
        2
      )
    );
  });

  it('should translate files from en to sr, in directory', async () => {
    const translations1 = [
      {
        translations: [
          {
            text: `Zdravo, ovo je primer${Translate.sentenceDelimiter}Zdravo${Translate.sentenceDelimiter}Zdravo, ovo je test`,
          },
        ],
      },
    ];
    mockedAxios.post.mockResolvedValue({ data: translations1 } as AzureTranslateResponse);
    new AzureRapidAPI().translate();

    // eslint-disable-next-line @typescript-eslint/unbound-method
    await new Promise(process.nextTick); // wait fot translate method to finish

    expect(fs.readFileSync(translatedFilePath1, 'utf-8')).toEqual(
      JSON.stringify(
        {
          example: 'Zdravo, ovo je primer',
          hello: 'Zdravo',
          object: {
            test: 'Zdravo, ovo je test',
          },
        },
        null,
        2
      )
    );
  });

  it('should translate files from en to sr, in directory', async () => {
    const translations2 = [
      {
        translations: [
          {
            text: `Novo${Translate.sentenceDelimiter}`,
          },
        ],
      },
    ];
    mockedAxios.post.mockResolvedValue({ data: translations2 } as AzureTranslateResponse);
    new AzureRapidAPI().translate();

    // eslint-disable-next-line @typescript-eslint/unbound-method
    await new Promise(process.nextTick); // wait fot translate method to finish

    expect(fs.readFileSync(translatedFilePath2, 'utf-8')).toEqual(
      JSON.stringify(
        {
          example: 'Zdravo, ovo je primer',
          object: {
            test: 'Zdravo, ovo je test',
          },
          new: 'Novo',
        },
        null,
        2
      )
    );
  });
});
