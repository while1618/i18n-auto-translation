import axios, { AxiosRequestConfig } from 'axios';
import { decode, encode } from 'html-entities';
import { argv } from '../cli.js';
import { LingvanexTranslateResponse } from '../payload.js';
import { Translate } from '../translate.js';
import { addCustomCert } from '../util.js';

export class LingvanexRapidAPI extends Translate {
  private static readonly endpoint: string = 'lingvanex-translate.p.rapidapi.com';
  private static readonly axiosConfig: AxiosRequestConfig = {
    headers: {
      'X-RapidAPI-Host': LingvanexRapidAPI.endpoint,
      'X-RapidAPI-Key': argv.key,
      'Content-Type': 'application/json',
    },
    responseType: 'json',
  };

  constructor() {
    super();
    if (argv.certificatePath) {
      LingvanexRapidAPI.axiosConfig.httpsAgent = addCustomCert(argv.certificatePath);
    }
  }

  protected callTranslateAPI = async (valuesForTranslation: string[]): Promise<string> => {
    const response = await axios.post(
      `https://${LingvanexRapidAPI.endpoint}/translate`,
      {
        data: encode(valuesForTranslation.join(Translate.sentenceDelimiter)),
        to: argv.to,
        from: argv.from,
        platform: 'api',
      },
      LingvanexRapidAPI.axiosConfig,
    );
    return decode((response as LingvanexTranslateResponse).data.result);
  };
}
