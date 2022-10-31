import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import fs from 'fs';
import { decode, encode } from 'html-entities';
import https from 'https';
import { exit } from 'process';
import { argv } from '../cli';
import { DeepTranslateResponse, JSONObj } from '../payload';
import { Translate } from '../translate';

export class DeepRapidAPI extends Translate {
  private static readonly endpoint: string = 'deep-translate1.p.rapidapi.com';
  private static readonly axiosConfig: AxiosRequestConfig = {
    headers: {
      'X-RapidAPI-Host': DeepRapidAPI.endpoint,
      'X-RapidAPI-Key': argv.key,
      'Content-type': 'application/json',
    },
    responseType: 'json',
  };

  constructor() {
    super();
    if (argv.certificatePath) {
      try {
        DeepRapidAPI.axiosConfig.httpsAgent = new https.Agent({
          ca: fs.readFileSync(argv.certificatePath),
        });
      } catch (e) {
        console.log(`Certificate not fount at: ${argv.certificatePath}`);
        exit(1);
      }
    }
  }

  protected callTranslateAPI = (
    valuesForTranslation: string[],
    originalObject: JSONObj,
    saveTo: string
  ): void => {
    axios
      .post(
        `https://${DeepRapidAPI.endpoint}/language/translate/v2`,
        {
          q: encode(valuesForTranslation.join(Translate.sentenceDelimiter)),
          source: argv.from,
          target: argv.to,
        },
        DeepRapidAPI.axiosConfig
      )
      .then((response) => {
        const value = (response as DeepTranslateResponse).data.data.translations.translatedText;
        this.saveTranslation(decode(value), originalObject, saveTo);
      })
      .catch((error) => this.printAxiosError(error as AxiosError, saveTo));
  };
}
