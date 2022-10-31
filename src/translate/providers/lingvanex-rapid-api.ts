import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import fs from 'fs';
import { decode, encode } from 'html-entities';
import https from 'https';
import { exit } from 'process';
import { argv } from '../cli';
import { JSONObj, LingvanexTranslateResponse } from '../payload';
import { Translate } from '../translate';

export class LingvanexRapidAPI extends Translate {
  private static readonly endpoint: string = 'lingvanex-translate.p.rapidapi.com';
  private static readonly axiosConfig: AxiosRequestConfig = {
    headers: {
      'X-RapidAPI-Host': LingvanexRapidAPI.endpoint,
      'X-RapidAPI-Key': argv.key,
      'Content-Type': 'application/json',
    },
    responseType: 'json',
  };

  constructor() {
    super();
    if (argv.certificatePath) {
      try {
        LingvanexRapidAPI.axiosConfig.httpsAgent = new https.Agent({
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
        `https://${LingvanexRapidAPI.endpoint}/translate`,
        {
          data: encode(valuesForTranslation.join(Translate.sentenceDelimiter)),
          to: argv.to,
          from: argv.from,
          platform: 'api',
        },
        LingvanexRapidAPI.axiosConfig
      )
      .then((response) => {
        const value = (response as LingvanexTranslateResponse).data.result;
        this.saveTranslation(decode(value), originalObject, saveTo);
      })
      .catch((error) => this.printAxiosError(error as AxiosError, saveTo));
  };
}
