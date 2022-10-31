import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import fs from 'fs';
import { decode, encode } from 'html-entities';
import https from 'https';
import { exit } from 'process';
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

  constructor() {
    super();
    if (argv.certificatePath) {
      try {
        NLPRapidAPI.axiosConfig.httpsAgent = new https.Agent({
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
        `https://${NLPRapidAPI.endpoint}/v1/translate`,
        {
          text: encode(valuesForTranslation.join(Translate.sentenceDelimiter)),
          to: argv.to,
          from: argv.from,
        },
        NLPRapidAPI.axiosConfig
      )
      .then((response) => {
        const value = (response as NLPTranslateResponse).data.translated_text[argv.to];
        this.saveTranslation(decode(value), originalObject, saveTo);
      })
      .catch((error) => this.printAxiosError(error as AxiosError, saveTo));
  };
}
