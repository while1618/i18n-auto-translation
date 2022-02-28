import { AxiosError, AxiosResponse } from 'axios';
import { addedDiff, deletedDiff } from 'deep-object-diff';
import fs from 'fs';
import glob from 'glob';
import extend from 'just-extend';
import path from 'path';
import { argv } from './cli';
import { JSONObj } from './payload';

export abstract class Translate {
  private fileForTranslation: JSONObj = {};
  private existingTranslation: JSONObj = {};
  private translatedFilePath: string = '';

  public translate = (): void => {
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
    this.fileForTranslation = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as JSONObj;
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
    ) as JSONObj;
    const diffForTranslation: JSONObj = addedDiff(
      this.existingTranslation,
      this.fileForTranslation
    ) as JSONObj;
    const valuesForTranslation: string[] = this.getValuesForTranslation(diffForTranslation);
    this.callTranslateAPI(valuesForTranslation)
      .then((response) => this.onSuccess(response, diffForTranslation))
      .catch((error) => this.printError(error as AxiosError));
  }

  private translationDoesNotExists(): void {
    const valuesForTranslation: string[] = this.getValuesForTranslation(this.fileForTranslation);
    this.callTranslateAPI(valuesForTranslation)
      .then((response) => this.onSuccess(response, this.fileForTranslation))
      .catch((error) => this.printError(error as AxiosError));
  }

  private printError = (error: AxiosError) => {
    console.error('Request Error!');
    console.log(`Status Code: ${error.response?.status}`);
    console.log(`Status Text: ${error.response?.statusText}`);
    console.log(`Data: ${JSON.stringify(error.response?.data)}`);
  };

  private getValuesForTranslation = (object: JSONObj): string[] => {
    const values: string[] = [];

    (function findValues(json: JSONObj): void {
      Object.values(json).forEach((value) => {
        if (typeof value === 'object') findValues(value);
        else values.push(value);
      });
    })(object);

    return values;
  };

  protected abstract callTranslateAPI: (valuesForTranslation: string[]) => Promise<AxiosResponse>;

  protected abstract onSuccess: (response: AxiosResponse, originalObject: JSONObj) => void;

  protected saveTranslation = (value: string, originalObject: JSONObj): void => {
    let content: JSONObj = this.createTranslatedObject(value.split('\n'), originalObject);

    if (fs.existsSync(this.translatedFilePath)) {
      const diffForDeletion: JSONObj = deletedDiff(
        this.existingTranslation,
        this.fileForTranslation
      ) as JSONObj;
      content = extend(true, this.existingTranslation, diffForDeletion, content) as JSONObj;
    }

    this.writeToFile(content);
  };

  private createTranslatedObject = (translations: string[], originalObject: JSONObj): JSONObj => {
    const translatedObject: JSONObj = { ...originalObject };
    let index: number = 0;

    (function addTranslations(json: JSONObj): void {
      Object.keys(json).forEach((key: string) => {
        if (typeof json[key] === 'object') addTranslations(json[key] as JSONObj);
        // eslint-disable-next-line no-param-reassign
        else json[key] = translations[index++];
      });
    })(translatedObject);

    return translatedObject;
  };

  private writeToFile = (content: JSONObj): void => {
    fs.writeFile(this.translatedFilePath, JSON.stringify(content, null, 2), (error) => {
      if (error) console.log(error.message);
      else console.log(`${this.translatedFilePath} file saved.`);
    });
  };
}
