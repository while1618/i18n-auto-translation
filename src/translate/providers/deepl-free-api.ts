import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { decode, encode } from 'html-entities';
import { argv } from '../cli';
import { DeepLTranslateResponse, JSONObj } from '../payload';
import { Translate } from '../translate';
import { addCustomCert } from '../util';

export class DeepLFreeAPI extends Translate {
  private static readonly endpoint: string = 'api-free.deepl.com';
  private static readonly axiosConfig: AxiosRequestConfig = {
    headers: {
      Authorization: `DeepL-Auth-Key ${argv.key}`,
      //'Content-type': 'application/x-www-form-urlencoded',
    },
    responseType: 'json',
  };

  constructor() {
    super();
    if (argv.certificatePath)
      DeepLFreeAPI.axiosConfig.httpsAgent = addCustomCert(argv.certificatePath);
  }

  protected callTranslateAPI = (
    valuesForTranslation: string[],
    originalObject: JSONObj,
    saveTo: string,
  ): void => {
    axios
      .post(
        `https://${DeepLFreeAPI.endpoint}/v2/translate`,
        {
          text: [encode(valuesForTranslation.join(Translate.sentenceDelimiter))],
          target_lang: argv.to,
          source_lang: argv.from,
          preserve_formatting: true,
        },
        DeepLFreeAPI.axiosConfig,
      )
      .then((response) => {
        const translations = (response as DeepLTranslateResponse).data.translations;
        translations.map((t) => {
          //there is only one translation, so we could just take the first one
          this.saveTranslation(decode(t.text), originalObject, saveTo);
        });
      })
      .catch((error) => this.printAxiosError(error as AxiosError, saveTo));
  };
}
