import axios, { AxiosRequestConfig } from 'axios';
import { decode, encode } from 'html-entities';
import { argv } from '../cli.js';
import { DeepLTranslateResponse } from '../payload.js';
import { Translate } from '../translate.js';
import { addCustomCert } from '../util.js';

export class DeepLFreeAPI extends Translate {
  private static readonly endpoint: string = 'api-free.deepl.com';
  private static readonly axiosConfig: AxiosRequestConfig = {
    headers: {
      Authorization: `DeepL-Auth-Key ${argv.key}`,
    },
    responseType: 'json',
  };

  constructor() {
    super();
    if (argv.certificatePath) {
      DeepLFreeAPI.axiosConfig.httpsAgent = addCustomCert(argv.certificatePath);
    }
  }

  protected callTranslateAPI = async (valuesForTranslation: string[]): Promise<string> => {
    const response = await axios.post(
      `https://${DeepLFreeAPI.endpoint}/v2/translate`,
      {
        text: [valuesForTranslation.join(Translate.sentenceDelimiter)],
        target_lang: argv.to,
        source_lang: argv.from,
        preserve_formatting: true,
        context: argv.context,
        formality: argv.formality,
        glossary_id: argv.glossary,
      },
      DeepLFreeAPI.axiosConfig,
    );
    return (response as DeepLTranslateResponse).data.translations[0].text;
  };
}
