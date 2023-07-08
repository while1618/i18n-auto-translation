/* eslint-disable import/first */
process.argv.push('--key=test');
process.argv.push('--filePath=./tests/i18n/nested/en.json');
process.argv.push('--to=sr');

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { AzureTranslateResponse } from '../../src/translate/payload';
import { AzureRapidAPI } from '../../src/translate/providers/azure-rapid-api';
import { Translate } from '../../src/translate/translate';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const translatedFilePath = path.resolve(__dirname, '../i18n/nested/sr.json');

describe('AzureRapid Provider', () => {
  afterAll(() => {
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

  it('should translate file from en to sr, translation already there, just remove old and add new translations', async () => {
    const translations = [
      {
        translations: [
          {
            text: `Novo${Translate.sentenceDelimiter}`,
          },
        ],
      },
    ];
    mockedAxios.post.mockResolvedValue({ data: translations } as AzureTranslateResponse);
    new AzureRapidAPI().translate();

    // eslint-disable-next-line @typescript-eslint/unbound-method
    await new Promise(process.nextTick); // wait fot translate method to finish

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
  });
});
