import axios, { AxiosRequestConfig } from 'axios';
import { decode, encode } from 'html-entities';
import { argv } from '../cli.js';
import { DeepTranslateResponse } from '../payload.js';
import { Translate } from '../translate.js';
import { addCustomCert } from '../util.js';

export class DeepRapidAPI extends Translate {
  private static readonly endpoint: string = 'deep-translate1.p.rapidapi.com';
  private static readonly axiosConfig: AxiosRequestConfig = {
    headers: {
      'X-RapidAPI-Host': DeepRapidAPI.endpoint,
      'X-RapidAPI-Key': argv.key,
      'Content-type': 'application/json',
    },
    responseType: 'json',
  };

  constructor() {
    super();
    if (argv.certificatePath) {
      DeepRapidAPI.axiosConfig.httpsAgent = addCustomCert(argv.certificatePath);
    }
  }

  protected callTranslateAPI = async (valuesForTranslation: string[]): Promise<string> => {
    const response = await axios.post(
      `https://${DeepRapidAPI.endpoint}/language/translate/v2`,
      {
        q: encode(valuesForTranslation.join(Translate.sentenceDelimiter)),
        source: argv.from,
        target: argv.to,
      },
      DeepRapidAPI.axiosConfig,
    );
    return decode((response as DeepTranslateResponse).data.data.translations.translatedText);
  };
}
