import axios, { AxiosRequestConfig } from 'axios';
import { decode, encode } from 'html-entities';
import { argv } from '../cli.js';
import { DeepLTranslateResponse } from '../payload.js';
import { Translate } from '../translate.js';
import { addCustomCert } from '../util.js';

export class DeepLProAPI extends Translate {
  private static readonly endpoint: string = 'api.deepl.com';
  private static readonly axiosConfig: AxiosRequestConfig = {
    headers: {
      Authorization: `DeepL-Auth-Key ${argv.key}`,
    },
    responseType: 'json',
  };

  constructor() {
    super();
    if (argv.certificatePath) {
      DeepLProAPI.axiosConfig.httpsAgent = addCustomCert(argv.certificatePath);
    }
  }

  protected callTranslateAPI = async (valuesForTranslation: string[]): Promise<string> => {
    const response = await axios.post(
      `https://${DeepLProAPI.endpoint}/v2/translate`,
      {
        text: [encode(valuesForTranslation.join(Translate.sentenceDelimiter))],
        target_lang: argv.to,
        source_lang: argv.from,
        preserve_formatting: true,
        context: argv.context,
        formality: argv.formality,
        glossary_id: argv.glossary,
      },
      DeepLProAPI.axiosConfig,
    );
    return decode((response as DeepLTranslateResponse).data.translations[0].text);
  };
}
