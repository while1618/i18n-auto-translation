import { Translate as GoogleTranslate } from '@google-cloud/translate/build/src/v2';
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
      .translate(valuesForTranslation.join('\n'), {
        from: argv.from,
        to: argv.to,
      })
      .then((response) => {
        const value = response[0];
        this.saveTranslation(value, originalObject, saveTo);
      })
      .catch((error) => {
        console.error('Google Translate API Request Error!');
        console.log(`Status Code: ${(error as ErrorResponse).response.statusCode}`);
        console.log(`Status Text: ${(error as ErrorResponse).response.statusMessage}`);
        console.log(`Data: ${JSON.stringify((error as ErrorResponse).errors[0].message)}`);
      });
  };
}
