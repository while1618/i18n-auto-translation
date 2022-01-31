import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import fs from 'fs';
import glob from 'glob';
import { diff } from 'json-diff';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { argv } from './cli';

export class Translate {
  private static readonly endpoint: string = 'https://api.cognitive.microsofttranslator.com';
  private static readonly axiosConfig: AxiosRequestConfig = {
    headers: {
      'Ocp-Apim-Subscription-Key': argv.key,
      'Ocp-Apim-Subscription-Region': argv.location,
      'Content-type': 'application/json',
      'X-ClientTraceId': uuid(),
    },
    params: {
      'api-version': '3.0',
      from: argv.from,
      to: argv.to.split(','),
    },
    responseType: 'json',
  };

  public start = (): void => {
    if (argv.filePath && argv.dirPath)
      throw new Error('You should only provide a single file or a directory.');

    if (!argv.filePath && !argv.dirPath)
      throw new Error('You must provide a single file or a directory.');

    if (argv.filePath) this.translateFile(argv.filePath);
    else if (argv.dirPath) this.translateFiles(argv.dirPath);
  };

  private translateFile = (filePath: string): void => {
    const fileForTranslation: Record<string, string | object> = JSON.parse(
      fs.readFileSync(filePath, 'utf-8')
    ) as Record<string, string | object>;
    const valuesForTranslation: string[] = this.getValuesForTranslation(fileForTranslation);
    const writeToLocation = filePath.substring(0, filePath.lastIndexOf('/'));
    this.callTranslateAPI(fileForTranslation, valuesForTranslation, writeToLocation);
  };

  private translateFiles = (dirPath: string): void => {
    const filePaths = glob.sync(`${dirPath}/**/${argv.from}.json`);
    if (filePaths.length === 0) throw new Error(`0 files found for translation in ${dirPath}`);
    filePaths.forEach((filePath) => this.translateFile(filePath));
  };

  private getValuesForTranslation = (object: Record<string, string | object>): string[] => {
    const values: string[] = [];

    (function findValues(json: Record<string, string | object>): void {
      Object.values(json).forEach((value: string | object) => {
        if (typeof value === 'object') findValues(value as Record<string, string | object>);
        else values.push(value);
      });
    })(object);

    return values;
  };

  private callTranslateAPI = (
    fileForTranslation: Record<string, string | object>,
    valuesForTranslation: string[],
    writeToLocation: string
  ): void => {
    axios
      .post(
        `${Translate.endpoint}/translate`,
        [{ text: valuesForTranslation.join('\n') }],
        Translate.axiosConfig
      )
      .then((response) => this.onSuccess(response, fileForTranslation, writeToLocation))
      .catch((error) => console.log(error));
  };

  private onSuccess = (
    response: AxiosResponse,
    fileForTranslation: Record<string, string | object>,
    writeToLocation: string
  ): void => {
    Object.values((response as TranslateResponse).data[0].translations).forEach(
      (value: TranslateResponseValue) => {
        let content = this.createTranslatedObject(value.text.split('\n'), fileForTranslation);
        const filePath = path.join(writeToLocation, `${value.to}.json`);
        if (fs.existsSync(filePath)) content = this.modifyContentIfNeeded(filePath, content);
        this.writeToFile(filePath, content);
      }
    );
  };

  private createTranslatedObject = (
    translations: string[],
    fileForTranslation: Record<string, string | object>
  ): Record<string, string | object> => {
    const translatedObject = { ...fileForTranslation };
    let index = 0;

    (function addTranslations(json: Record<string, string | object>): void {
      Object.keys(json).forEach((key: string) => {
        if (typeof json[key] === 'object')
          addTranslations(json[key] as Record<string, string | object>);
        // eslint-disable-next-line no-param-reassign
        else json[key] = translations[index++];
      });
    })(translatedObject);

    return translatedObject;
  };

  private modifyContentIfNeeded = (
    filePath: string,
    content: Record<string, string | object>
  ): Record<string, string | object> => {
    const contentCopy: Record<string, string | object> = { ...content };

    const existingTranslation: Record<string, string | object> = JSON.parse(
      fs.readFileSync(filePath, 'utf-8')
    ) as Record<string, string | object>;
    const contentDiff: JsonDiff = diff(existingTranslation, content) as JsonDiff;
    Object.keys(contentDiff).forEach((key: string) => {
      if (typeof contentDiff[key] !== 'string' && (contentDiff[key] as JsonDiffValue).__old)
        contentCopy[key] = (contentDiff[key] as JsonDiffValue).__old;
    });

    return contentCopy;
  };

  private writeToFile = (filePath: string, content: Record<string, string | object>): void => {
    fs.writeFile(filePath, JSON.stringify(content, null, 2), (error) => {
      if (error) console.log(error.message);
      else console.log(`${filePath} file saved.`);
    });
  };
}

interface TranslateResponse {
  data: [{ translations: TranslateResponseValue[] }];
}

interface TranslateResponseValue {
  text: string;
  to: string;
}

interface JsonDiff {
  [key: string]: string | JsonDiffValue;
}

interface JsonDiffValue {
  __old: string;
  __new: string;
}
