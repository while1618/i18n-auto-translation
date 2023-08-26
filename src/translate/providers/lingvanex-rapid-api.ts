import axios, { AxiosRequestConfig } from 'axios';
import { decode, encode } from 'html-entities';
import { argv } from '../cli';
import { LingvanexTranslateResponse } from '../payload';
import { Translate } from '../translate';
import { addCustomCert } from '../util';

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
    if (argv.certificatePath)
      LingvanexRapidAPI.axiosConfig.httpsAgent = addCustomCert(argv.certificatePath);
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
