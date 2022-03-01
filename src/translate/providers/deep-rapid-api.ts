import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
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

  protected callTranslateAPI = (valuesForTranslation: string[]): Promise<AxiosResponse> =>
    axios.post(
      `https://${DeepRapidAPI.endpoint}/language/translate/v2`,
      { q: valuesForTranslation.join('\n'), source: argv.from, target: argv.to },
      DeepRapidAPI.axiosConfig
    );

  protected onSuccess = (
    response: AxiosResponse,
    originalObject: JSONObj,
    saveTo: string
  ): void => {
    const value = (response as DeepTranslateResponse).data.data.translations.translatedText;
    this.saveTranslation(value, originalObject, saveTo);
  };
}
