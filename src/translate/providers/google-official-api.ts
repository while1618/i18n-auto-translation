import { Translate as GoogleTranslate } from '@google-cloud/translate/build/src/v2/index.js';
import { decode, encode } from 'html-entities';
import { argv } from '../cli.js';
import { Translate } from '../translate.js';

export class GoogleOfficialAPI extends Translate {
  protected callTranslateAPI = async (valuesForTranslation: string[]): Promise<string> => {
    const response = await new GoogleTranslate({ key: argv.key }).translate(
      encode(valuesForTranslation.join(Translate.sentenceDelimiter)),
      {
        from: argv.from,
        to: argv.to,
      },
    );
    return decode(response[0]);
  };
}
