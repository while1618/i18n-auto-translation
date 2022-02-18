import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { addedDiff, deletedDiff } from 'deep-object-diff';
import fs from 'fs';
import glob from 'glob';
import extend from 'just-extend';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { argv } from './cli';

type JSONValue = string | { [x: string]: JSONValue };

interface JSON {
  [x: string]: JSONValue;
}

interface TranslateResponse {
  data: [{ translations: TranslateResponseValue[] }];
}

interface TranslateResponseValue {
  text: string;
}

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
      to: argv.to,
    },
    responseType: 'json',
  };

  private fileForTranslation: JSON = {};
  private existingTranslation: JSON = {};
  private translatedFilePath: string = '';

  public start = (): void => {
    if (argv.filePath && argv.dirPath)
      throw new Error('You should only provide a single file or a directory.');

    if (!argv.filePath && !argv.dirPath)
      throw new Error('You must provide a single file or a directory.');

    if (argv.dirPath) this.translateFiles(argv.dirPath);
    else if (argv.filePath) this.translateFile(argv.filePath);
  };

  private translateFiles = (dirPath: string): void => {
    const filePaths: string[] = glob.sync(`${dirPath}/**/${argv.from}.json`);
    if (filePaths.length === 0) throw new Error(`0 files found for translation in ${dirPath}`);
    filePaths.forEach((filePath) => this.translateFile(filePath));
  };

  private translateFile = (filePath: string): void => {
    this.fileForTranslation = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as JSON;
    this.translatedFilePath = path.join(
      filePath.substring(0, filePath.lastIndexOf('/')),
      `${argv.to}.json`
    );
    if (fs.existsSync(this.translatedFilePath)) this.translationAlreadyExists();
    else this.translationDoesNotExists();
  };

  private translationAlreadyExists(): void {
    this.existingTranslation = JSON.parse(
      fs.readFileSync(this.translatedFilePath, 'utf-8')
    ) as JSON;
    const diffForTranslation: JSON = addedDiff(
      this.existingTranslation,
      this.fileForTranslation
    ) as JSON;
    const valuesForTranslation: string[] = this.getValuesForTranslation(diffForTranslation);
    this.callTranslateAPI(valuesForTranslation)
      .then((response) => this.onSuccess(response, diffForTranslation))
      .catch((error) => console.log(error));
  }

  private translationDoesNotExists(): void {
    const valuesForTranslation: string[] = this.getValuesForTranslation(this.fileForTranslation);
    this.callTranslateAPI(valuesForTranslation)
      .then((response) => this.onSuccess(response, this.fileForTranslation))
      .catch((error) => console.log(error));
  }

  private getValuesForTranslation = (object: JSON): string[] => {
    const values: string[] = [];

    (function findValues(json: JSON): void {
      Object.values(json).forEach((value) => {
        if (typeof value === 'object') findValues(value);
        else values.push(value);
      });
    })(object);

    return values;
  };

  private callTranslateAPI = (valuesForTranslation: string[]): Promise<AxiosResponse> =>
    axios.post(
      `${Translate.endpoint}/translate`,
      [{ text: valuesForTranslation.join('\n') }],
      Translate.axiosConfig
    );

  private onSuccess = (response: AxiosResponse, originalObject: JSON): void => {
    Object.values((response as TranslateResponse).data[0].translations).forEach(
      (value: TranslateResponseValue) => this.saveTranslation(value, originalObject)
    );
  };

  private saveTranslation = (value: TranslateResponseValue, originalObject: JSON): void => {
    let content: JSON = this.createTranslatedObject(value.text.split('\n'), originalObject);

    if (fs.existsSync(this.translatedFilePath)) {
      const diffForDeletion: JSON = deletedDiff(
        this.existingTranslation,
        this.fileForTranslation
      ) as JSON;
      content = extend(true, this.existingTranslation, diffForDeletion, content) as JSON;
    }

    this.writeToFile(content);
  };

  private createTranslatedObject = (translations: string[], originalObject: JSON): JSON => {
    const translatedObject: JSON = { ...originalObject };
    let index: number = 0;

    (function addTranslations(json: JSON): void {
      Object.keys(json).forEach((key: string) => {
        if (typeof json[key] === 'object') addTranslations(json[key] as JSON);
        // eslint-disable-next-line no-param-reassign
        else json[key] = translations[index++];
      });
    })(translatedObject);

    return translatedObject;
  };

  private writeToFile = (content: JSON): void => {
    fs.writeFile(this.translatedFilePath, JSON.stringify(content, null, 2), (error) => {
      if (error) console.log(error.message);
      else console.log(`${this.translatedFilePath} file saved.`);
    });
  };
}
