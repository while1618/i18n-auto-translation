import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { decode, encode } from 'html-entities';
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

  protected callTranslateAPI = (
    valuesForTranslation: string[],
    originalObject: JSONObj,
    saveTo: string
  ): void => {
    axios
      .post(
        `https://${LectoRapidAPI.endpoint}/v1/translate/text`,
        {
          texts: [encode(valuesForTranslation.join(Translate.sentenceDelimiter))],
          to: [argv.to],
          from: argv.from,
        },
        LectoRapidAPI.axiosConfig
      )
      .then((response) => {
        const value = (response as LectoTranslateResponse).data.translations[0].translated[0];
        this.saveTranslation(decode(value), originalObject, saveTo);
      })
      .catch((error) => this.printAxiosError(error as AxiosError, 'Lecto Rapid API'));
  };
}
