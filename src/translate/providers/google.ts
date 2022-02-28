import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { argv } from '../cli';
import { JSONObj } from '../payload';
import { Translate } from '../translate';

export class Google extends Translate {
  private static readonly endpoint: string = 'google-translate1.p.rapidapi.com';
  private static readonly axiosConfig: AxiosRequestConfig = {
    headers: {
      'X-RapidAPI-Host': Google.endpoint,
      'X-RapidAPI-Key': argv.key,
      'Content-type': 'application/x-www-form-urlencoded',
      'accept-encoding': 'application/gzip',
    },
    responseType: 'json',
  };

  protected callTranslateAPI = (valuesForTranslation: string[]): Promise<AxiosResponse> =>
    axios.post(
      `https://${Google.endpoint}/language/translate/v2`,
      { source: argv.to, target: argv.from, q: valuesForTranslation.join('\n') },
      Google.axiosConfig
    );

  protected onSuccess = (
    response: AxiosResponse,
    originalObject: JSONObj,
    saveTo: string
  ): void => {
    console.log(response);
  };
}
