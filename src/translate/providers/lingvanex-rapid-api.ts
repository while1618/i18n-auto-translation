import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { argv } from '../cli';
import { JSONObj, LingvanexTranslateResponse } from '../payload';
import { Translate } from '../translate';

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

  protected callTranslateAPI = (valuesForTranslation: string[]): Promise<AxiosResponse> =>
    axios.post(
      `https://${LingvanexRapidAPI.endpoint}/translate`,
      { data: valuesForTranslation.join('\n'), to: argv.to, from: argv.from, platform: 'api' },
      LingvanexRapidAPI.axiosConfig
    );

  protected onSuccess = (
    response: AxiosResponse,
    originalObject: JSONObj,
    saveTo: string
  ): void => {
    const value = (response as LingvanexTranslateResponse).data.result;
    this.saveTranslation(value, originalObject, saveTo);
  };
}
