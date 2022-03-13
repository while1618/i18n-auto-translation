import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { argv } from '../cli';
import { JSONObj, NLPTranslateResponse } from '../payload';
import { Translate } from '../translate';

export class NLPRapidAPI extends Translate {
  private static readonly endpoint: string = 'nlp-translation.p.rapidapi.com';
  private static readonly axiosConfig: AxiosRequestConfig = {
    headers: {
      'X-RapidAPI-Host': NLPRapidAPI.endpoint,
      'X-RapidAPI-Key': argv.key,
      'Content-type': 'application/x-www-form-urlencoded',
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
        `https://${NLPRapidAPI.endpoint}/v1/translate`,
        { text: valuesForTranslation.join('\n'), to: argv.to, from: argv.from },
        NLPRapidAPI.axiosConfig
      )
      .then((response) => {
        const value = (response as NLPTranslateResponse).data.translated_text[argv.to];
        this.saveTranslation(value, originalObject, saveTo);
      })
      .catch((error) => this.printAxiosError(error as AxiosError, 'NLP Rapid API'));
  };
}
