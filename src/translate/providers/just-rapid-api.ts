import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { argv } from '../cli';
import { JSONObj, JustTranslateResponse } from '../payload';
import { Translate } from '../translate';

export class JustRapidAPI extends Translate {
  private static readonly endpoint: string = 'just-translated.p.rapidapi.com';

  protected callTranslateAPI = (valuesForTranslation: string[]): Promise<AxiosResponse> => {
    const axiosConfig: AxiosRequestConfig = {
      headers: {
        'X-RapidAPI-Host': JustRapidAPI.endpoint,
        'X-RapidAPI-Key': argv.key,
      },
      params: {
        lang: `${argv.from}-${argv.to}`,
        text: valuesForTranslation.join('\n'),
      },
      responseType: 'json',
    };
    return axios.get(`https://${JustRapidAPI.endpoint}/`, axiosConfig);
  };

  protected onSuccess = (
    response: AxiosResponse,
    originalObject: JSONObj,
    saveTo: string
  ): void => {
    const value = (response as JustTranslateResponse).data.text[0];
    this.saveTranslation(value, originalObject, saveTo);
  };
}
