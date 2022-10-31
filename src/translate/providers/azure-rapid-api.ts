import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import fs from 'fs';
import { decode, encode } from 'html-entities';
import https from 'https';
import { exit } from 'process';
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

  constructor() {
    super();
    if (argv.certificatePath) {
      try {
        AzureRapidAPI.axiosConfig.httpsAgent = new https.Agent({
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
        `https://${AzureRapidAPI.endpoint}/translate`,
        [{ text: encode(valuesForTranslation.join(Translate.sentenceDelimiter)) }],
        AzureRapidAPI.axiosConfig
      )
      .then((response) => {
        const value = (response as AzureTranslateResponse).data[0].translations[0].text;
        this.saveTranslation(decode(value), originalObject, saveTo);
      })
      .catch((error) => this.printAxiosError(error as AxiosError, saveTo));
  };
}
