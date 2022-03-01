import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { v4 as uuid } from 'uuid';
import { argv } from '../cli';
import { AzureTranslateResponse, JSONObj } from '../payload';
import { Translate } from '../translate';

export class AzureRapidAPI extends Translate {
  private static readonly endpoint: string = 'microsoft-translator-text.p.rapidapi.com';
  private static readonly axiosConfig: AxiosRequestConfig = {
    headers: {
      'X-ClientTraceId': uuid(),
      'X-RapidAPI-Host': AzureRapidAPI.endpoint,
      'X-RapidAPI-Key': argv.key,
      'Content-type': 'application/json',
    },
    params: {
      'api-version': '3.0',
      from: argv.from,
      to: argv.to,
    },
    responseType: 'json',
  };

  protected callTranslateAPI = (valuesForTranslation: string[]): Promise<AxiosResponse> =>
    axios.post(
      `https://${AzureRapidAPI.endpoint}/translate`,
      [{ text: valuesForTranslation.join('\n') }],
      AzureRapidAPI.axiosConfig
    );

  protected onSuccess = (
    response: AxiosResponse,
    originalObject: JSONObj,
    saveTo: string
  ): void => {
    const value = (response as AzureTranslateResponse).data[0].translations[0].text;
    this.saveTranslation(value, originalObject, saveTo);
  };
}
