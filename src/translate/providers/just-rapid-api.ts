import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { argv } from '../cli';
import { JSONObj, JustTranslateResponse } from '../payload';
import { Translate } from '../translate';

export class JustRapidAPI extends Translate {
  private static readonly endpoint: string = 'just-translated.p.rapidapi.com';

  protected callTranslateAPI = (
    valuesForTranslation: string[],
    originalObject: JSONObj,
    saveTo: string
  ): void => {
    const axiosConfig: AxiosRequestConfig = {
      headers: {
        'X-RapidAPI-Host': JustRapidAPI.endpoint,
        'X-RapidAPI-Key': argv.key,
      },
      params: {
        lang: `${argv.from}-${argv.to}`,
        text: valuesForTranslation.join(Translate.sentenceDelimiter),
      },
      responseType: 'json',
    };
    axios
      .get(`https://${JustRapidAPI.endpoint}/`, axiosConfig)
      .then((response) => {
        const value = (response as JustTranslateResponse).data.text[0];
        this.saveTranslation(value, originalObject, saveTo);
      })
      .catch((error) => this.printAxiosError(error as AxiosError, 'Just Rapid API'));
  };
}
