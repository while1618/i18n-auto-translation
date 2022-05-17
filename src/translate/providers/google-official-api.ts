import { Translate as GoogleTranslate } from '@google-cloud/translate/build/src/v2';
import { decode, encode } from 'html-entities';
import { argv } from '../cli';
import { JSONObj } from '../payload';
import { Translate } from '../translate';

interface ErrorResponse {
  response: { statusCode: number; statusMessage: string };
  errors: [{ message: string }];
}

export class GoogleOfficialAPI extends Translate {
  protected callTranslateAPI = (
    valuesForTranslation: string[],
    originalObject: JSONObj,
    saveTo: string
  ): void => {
    new GoogleTranslate({ key: argv.key })
      .translate(encode(valuesForTranslation.join(Translate.sentenceDelimiter)), {
        from: argv.from,
        to: argv.to,
      })
      .then((response) => {
        const value = response[0];
        this.saveTranslation(decode(value), originalObject, saveTo);
      })
      .catch((error) => {
        const err = error as ErrorResponse;
        console.error(`Request error for file: ${saveTo}`);
        if (err.response?.statusCode && err.response.statusMessage && err.errors[0].message) {
          console.log(`Status Code: ${err.response.statusCode}`);
          console.log(`Status Text: ${err.response.statusMessage}`);
          console.log(`Data: ${JSON.stringify(err.errors[0].message)}`);
        } else {
          console.log(error);
        }
      });
  };
}
