import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { argv } from '../cli';
import { JSONObj, LectoTranslateResponse } from '../payload';
import { Translate } from '../translate';

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

  protected callTranslateAPI = (valuesForTranslation: string[]): Promise<AxiosResponse> =>
    axios.post(
      `https://${LectoRapidAPI.endpoint}/v1/translate/text`,
      { texts: [valuesForTranslation.join('\n')], to: [argv.to], from: argv.from },
      LectoRapidAPI.axiosConfig
    );

  protected onSuccess = (
    response: AxiosResponse,
    originalObject: JSONObj,
    saveTo: string
  ): void => {
    const value = (response as LectoTranslateResponse).data.translations[0].translated[0];
    this.saveTranslation(value, originalObject, saveTo);
  };
}
