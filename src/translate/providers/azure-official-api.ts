import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { v4 as uuid } from 'uuid';
import { argv } from '../cli';
import { AzureTranslateResponse, JSONObj } from '../payload';
import { Translate } from '../translate';

export class AzureOfficialAPI extends Translate {
  private static readonly endpoint: string = 'api.cognitive.microsofttranslator.com';
  private static readonly axiosConfig: AxiosRequestConfig = {
    headers: {
      'Ocp-Apim-Subscription-Key': argv.key,
      'Ocp-Apim-Subscription-Region': argv.location,
      'Content-type': 'application/json',
      'X-ClientTraceId': uuid(),
    },
    params: {
      'api-version': '3.0',
      from: argv.from,
      to: argv.to,
    },
    responseType: 'json',
  };

  protected callTranslateAPI = (
    valuesForTranslation: string[],
    originalObject: JSONObj,
    saveTo: string
  ): void => {
    axios
      .post(
        `https://${AzureOfficialAPI.endpoint}/translate`,
        [{ text: valuesForTranslation.join('\n') }],
        AzureOfficialAPI.axiosConfig
      )
      .then((response) => {
        const value = (response as AzureTranslateResponse).data[0].translations[0].text;
        this.saveTranslation(value, originalObject, saveTo);
      })
      .catch((error) => this.printAxiosError(error as AxiosError, 'Azure Official API'));
  };
}
