import { addedDiff, deletedDiff } from 'deep-object-diff';
import fs from 'fs';
import { globSync } from 'glob';
import extend from 'just-extend';
import path from 'path';
import { argv } from './cli';
import { JSONObj } from './payload';
import { replaceAll } from './util';

export abstract class Translate {
  public static readonly sentenceDelimiter: string = '\n#__#\n';
  private static readonly skipWordRegex: RegExp =
    /({{([^{}]+)}}|<([^<>]+)>|<\/([^<>]+)>|\{([^{}]+)\})/g;

  private fileForTranslation: JSONObj = {};
  private saveTo: string = '';
  private skippedWords: string[] = [];

  public translate = (): void => {
    if (argv.filePath && argv.dirPath) {
      throw new Error('You should only provide a single file or a directory.');
    }

    if (!argv.filePath && !argv.dirPath) {
      throw new Error('You must provide a single file or a directory.');
    }

    if (argv.dirPath) {
      this.translateFiles(argv.dirPath);
    }

    if (argv.filePath) {
      this.translateFile(argv.filePath);
    }
  };

  private translateFiles = async (dirPath: string): Promise<void> => {
    console.log('Finding files for translation...');
    const filePaths: string[] = globSync(`${dirPath}/**/${argv.from}.json`, {
      ignore: [`${dirPath}/**/node_modules/**`, `${dirPath}/**/dist/**`],
    });
    if (filePaths.length === 0) {
      throw new Error(`0 files found for translation in ${dirPath}`);
    }
    console.log(`${filePaths.length} files found.`);
    for (const filePath of filePaths) {
      this.skippedWords = [];
      await this.translateFile(filePath);
    }
  };

  private translateFile = async (filePath: string): Promise<void> => {
    try {
      this.fileForTranslation = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as JSONObj;
      this.saveTo = path.join(filePath.substring(0, filePath.lastIndexOf('/')), `${argv.to}.json`);
      if (argv.override || !fs.existsSync(this.saveTo)) {
        await this.translationDoesNotExists();
      } else {
        await this.translationAlreadyExists();
      }
    } catch (e) {
      console.log(`${(e as Error).message} at: ${filePath}`);
    }
  };

  private translationDoesNotExists = async (): Promise<void> => {
    if (Object.keys(this.fileForTranslation).length === 0) {
      console.log(`Nothing to translate, file is empty: ${this.saveTo}`);
      return;
    }
    const valuesForTranslation: string[] = this.getValuesForTranslation(this.fileForTranslation);
    await this.translateValues(valuesForTranslation, this.fileForTranslation);
  };

  private translationAlreadyExists = async (): Promise<void> => {
    try {
      const existingTranslation = JSON.parse(fs.readFileSync(this.saveTo, 'utf-8')) as JSONObj;
      this.deleteIfNeeded(existingTranslation);
      await this.translateIfNeeded(existingTranslation);
    } catch (e) {
      console.log(`${(e as Error).message} at: ${this.saveTo}`);
    }
  };

  private deleteIfNeeded = (existingTranslation: JSONObj): void => {
    const diffForDeletion: JSONObj = deletedDiff(
      existingTranslation,
      this.fileForTranslation,
    ) as JSONObj;
    if (Object.keys(diffForDeletion).length !== 0) {
      const content = extend(true, existingTranslation, diffForDeletion) as JSONObj;
      this.writeToFile(content, `Unnecessary lines deleted for: ${this.saveTo}`);
    }
  };

  private translateIfNeeded = async (existingTranslation: JSONObj): Promise<void> => {
    const diffForTranslation: JSONObj = addedDiff(
      existingTranslation,
      this.fileForTranslation,
    ) as JSONObj;
    if (Object.keys(diffForTranslation).length === 0) {
      console.log(`Everything already translated for: ${this.saveTo}`);
      return;
    }
    const valuesForTranslation: string[] = this.getValuesForTranslation(diffForTranslation);
    await this.translateValues(valuesForTranslation, diffForTranslation);
  };

  private getValuesForTranslation = (object: JSONObj): string[] => {
    let values: string[] = [];

    (function findValues(json: JSONObj): void {
      Object.values(json).forEach((value) => {
        if (typeof value === 'object') {
          findValues(value);
        } else {
          values.push(value);
        }
      });
    })(object);

    values = values.map((value) => this.skipWords(value));
    return values;
  };

  private skipWords(value: string): string {
    return value.replace(Translate.skipWordRegex, (match: string) => {
      this.skippedWords.push(match.trim());
      return `{{${this.skippedWords.length - 1}}}`;
    });
  }

  private translateValues = async (
    valuesForTranslation: string[],
    objectBeforeTranslation: JSONObj,
  ): Promise<void> => {
    try {
      if (valuesForTranslation.length > argv.maxLinesPerRequest) {
        const splitted = this.splitValuesForTranslation(valuesForTranslation);
        const promises = splitted.map((values) => this.callTranslateAPI(values));

        const responses = await Promise.all(promises);
        const translated = responses.join(Translate.sentenceDelimiter);
        this.saveTranslation(translated, objectBeforeTranslation);
      } else {
        const translated = await this.callTranslateAPI(valuesForTranslation);
        this.saveTranslation(translated, objectBeforeTranslation);
      }
    } catch (error) {
      this.printError(error);
    }
  };

  private splitValuesForTranslation = (valuesForTranslation: string[]): string[][] => {
    const resultArrays = [];

    for (let i = 0; i < valuesForTranslation.length; i += argv.maxLinesPerRequest) {
      const chunk = valuesForTranslation.slice(i, i + argv.maxLinesPerRequest);
      resultArrays.push(chunk);
    }

    return resultArrays;
  };

  protected abstract callTranslateAPI: (valuesForTranslation: string[]) => Promise<string>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private printError = (error: any): void => {
    const errorFilePath = this.saveTo.replace(`${argv.to}.json`, `${argv.from}.json`);
    console.error(`Request error for file: ${errorFilePath}`);
    console.log(`Status Code: ${error?.response?.status ?? error?.response?.statusCode}`);
    console.log(`Status Text: ${error?.response?.statusText ?? error?.response?.statusMessage}`);
    console.log(
      `Data: ${JSON.stringify(error?.response?.data) ?? JSON.stringify(error?.errors[0].message)}`,
    );
  };

  private saveTranslation = (value: string, objectBeforeTranslation: JSONObj): void => {
    let translations = replaceAll(value, '#__ #', '#__#');
    translations = replaceAll(translations, '# __#', '#__#');
    let content: JSONObj = this.createTranslatedObject(
      translations.split(Translate.sentenceDelimiter.trim()),
      objectBeforeTranslation,
    );
    let message: string = `File saved: ${this.saveTo}`;
    if (fs.existsSync(this.saveTo) && !argv.override) {
      const existingTranslation = JSON.parse(fs.readFileSync(this.saveTo, 'utf-8')) as JSONObj;
      content = extend(true, existingTranslation, content) as JSONObj;
      message = `File updated: ${this.saveTo}`;
    }
    this.writeToFile(content, message);
  };

  private createTranslatedObject = (
    translations: string[],
    objectBeforeTranslation: JSONObj,
  ): JSONObj => {
    translations = translations.map((value) => this.returnSkippedWords(value));
    const translatedObject: JSONObj = { ...objectBeforeTranslation };
    let index: number = 0;

    (function addTranslations(json: JSONObj): void {
      Object.keys(json).forEach((key: string) => {
        if (typeof json[key] === 'object') {
          addTranslations(json[key] as JSONObj);
        } else {
          json[key] = translations[index++]?.trim();
        }
      });
    })(translatedObject);

    return translatedObject;
  };

  private returnSkippedWords(value: string): string {
    return value.replace(Translate.skipWordRegex, () => `${this.skippedWords.shift()}`);
  }

  private writeToFile = (content: JSONObj, message: string): void => {
    try {
      fs.writeFileSync(this.saveTo, JSON.stringify(content, null, argv.spaces));
      console.log(message);
    } catch (e) {
      console.log((e as Error).message);
    }
  };
}
