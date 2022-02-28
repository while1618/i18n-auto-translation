import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { v4 as uuid } from 'uuid';
import { argv } from '../cli';
import { AzureTranslateResponse, AzureTranslateResponseValue, JSONObj } from '../payload';
import { Translate } from '../translate';

export class Azure extends Translate {
  private static readonly endpoint: string = 'microsoft-translator-text.p.rapidapi.com';
  private static readonly axiosConfig: AxiosRequestConfig = {
    headers: {
      'X-ClientTraceId': uuid(),
      'X-RapidAPI-Host': Azure.endpoint,
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
      `https://${Azure.endpoint}/translate`,
      [{ text: valuesForTranslation.join('\n') }],
      Azure.axiosConfig
    );

  protected onSuccess = (
    response: AxiosResponse,
    originalObject: JSONObj,
    saveTo: string
  ): void => {
    Object.values((response as AzureTranslateResponse).data[0].translations).forEach(
      (value: AzureTranslateResponseValue) =>
        this.saveTranslation(value.text, originalObject, saveTo)
    );
  };
}
