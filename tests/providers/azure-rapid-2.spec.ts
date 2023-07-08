/* eslint-disable import/first */
process.argv.push('--key=test');
process.argv.push('--filePath=./tests/i18n/en.json');
process.argv.push('--to=sr');

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { AzureTranslateResponse } from '../../src/translate/payload';
import { AzureRapidAPI } from '../../src/translate/providers/azure-rapid-api';
import { Translate } from '../../src/translate/translate';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const translatedFilePath = path.resolve(__dirname, '../i18n/sr.json');

describe('AzureRapid Provider', () => {
  afterAll(() => {
    fs.unlinkSync(translatedFilePath);
  });

  it("should translate file from en to sr, translation doesn't exists", async () => {
    const translations = [
      {
        translations: [
          {
            text: `Zdravo, ovo je primer${Translate.sentenceDelimiter}Zdravo${Translate.sentenceDelimiter}Zdravo, ovo je test`,
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

  it('should print file already translated', () => {
    const logSpy = jest.spyOn(global.console, 'log');
    new AzureRapidAPI().translate();
    expect(logSpy).toHaveBeenCalledWith('Everything already translated for: tests/i18n/sr.json');
    logSpy.mockRestore();
  });
});
