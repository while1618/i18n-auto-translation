import axios, { AxiosRequestConfig } from 'axios';
import { decode, encode } from 'html-entities';
import { argv } from '../cli';
import { LectoTranslateResponse } from '../payload';
import { Translate } from '../translate';
import { addCustomCert } from '../util';

export class LectoRapidAPI extends Translate {
  private static readonly endpoint: string = 'lecto-translation.p.rapidapi.com';
  private static readonly axiosConfig: AxiosRequestConfig = {
    headers: {
      'X-RapidAPI-Host': LectoRapidAPI.endpoint,
      'X-RapidAPI-Key': argv.key,
      'Content-Type': 'application/json',
    },
    responseType: 'json',
  };

  constructor() {
    super();
    if (argv.certificatePath) {
      LectoRapidAPI.axiosConfig.httpsAgent = addCustomCert(argv.certificatePath);
    }
  }

  protected callTranslateAPI = async (valuesForTranslation: string[]): Promise<string> => {
    const response = await axios.post(
      `https://${LectoRapidAPI.endpoint}/v1/translate/text`,
      {
        texts: [encode(valuesForTranslation.join(Translate.sentenceDelimiter))],
        to: [argv.to],
        from: argv.from,
      },
      LectoRapidAPI.axiosConfig,
    );
    return decode((response as LectoTranslateResponse).data.translations[0].translated[0]);
  };
}
