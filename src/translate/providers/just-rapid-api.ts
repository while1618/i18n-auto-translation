import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { decode, encode } from 'html-entities';
import { argv } from '../cli';
import { JSONObj, JustTranslateResponse } from '../payload';
import { Translate } from '../translate';
import { addCustomCert } from '../util';

export class JustRapidAPI extends Translate {
  private static readonly endpoint: string = 'just-translated.p.rapidapi.com';
  private static axiosConfig: AxiosRequestConfig = {
    headers: {
      'X-RapidAPI-Host': JustRapidAPI.endpoint,
      'X-RapidAPI-Key': argv.key,
    },
    responseType: 'json',
  };

  constructor() {
    super();
    if (argv.certificatePath) addCustomCert(argv.certificatePath);
  }

  protected callTranslateAPI = (
    valuesForTranslation: string[],
    originalObject: JSONObj,
    saveTo: string
  ): void => {
    JustRapidAPI.axiosConfig.params = {
      lang: `${argv.from}-${argv.to}`,
      text: encode(valuesForTranslation.join(Translate.sentenceDelimiter)),
    };
    axios
      .get(`https://${JustRapidAPI.endpoint}/`, JustRapidAPI.axiosConfig)
      .then((response) => {
        const value = (response as JustTranslateResponse).data.text[0];
        this.saveTranslation(decode(value), originalObject, saveTo);
      })
      .catch((error) => this.printAxiosError(error as AxiosError, saveTo));
  };
}
