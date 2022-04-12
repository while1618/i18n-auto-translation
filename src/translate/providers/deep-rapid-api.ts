import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { decode, encode } from 'html-entities';
import { argv } from '../cli';
import { DeepTranslateResponse, JSONObj } from '../payload';
import { Translate } from '../translate';

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
  protected callTranslateAPI = async (
    valuesForTranslation: string[],
    originalObject: JSONObj,
    saveTo: string
  ): Promise<void> => {
    try {
      const response = await axios.post(
        `https://${DeepRapidAPI.endpoint}/language/translate/v2`,
        {
          q: encode(valuesForTranslation.join(Translate.sentenceDelimiter)),
          source: argv.from,
          target: argv.to,
        },
        DeepRapidAPI.axiosConfig
      );

      const value = (response as DeepTranslateResponse).data.data.translations.translatedText;
      this.saveTranslation(decode(value), originalObject, saveTo);
    } catch (error) {
      this.printAxiosError(error as AxiosError, 'Deep Rapid API');
    }
  };
}
