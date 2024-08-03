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
  private static readonly maxLinesPerRequest = 200;
  private skippedWords: string[] = [];

  public translate = (): void => {
    if (argv.filePath && argv.dirPath)
      throw new Error('You should only provide a single file or a directory.');

    if (!argv.filePath && !argv.dirPath)
      throw new Error('You must provide a single file or a directory.');

    if (argv.dirPath) this.translateFiles(argv.dirPath);
    else if (argv.filePath) this.translateFile(argv.filePath);
  };

  private translateFiles = (dirPath: string): void => {
    console.log('Finding files for translation...');
    const filePaths: string[] = globSync(`${dirPath}/**/${argv.from}.json`, {
      ignore: [`${dirPath}/**/node_modules/**`, `${dirPath}/**/dist/**`],
    });
    if (filePaths.length === 0) throw new Error(`0 files found for translation in ${dirPath}`);
    console.log(`${filePaths.length} files found.`);
    filePaths.forEach((filePath) => this.translateFile(filePath));
  };

  private translateFile = (filePath: string): void => {
    try {
      const fileForTranslation = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as JSONObj;
      const saveTo: string = path.join(
        filePath.substring(0, filePath.lastIndexOf('/')),
        `${argv.to}.json`,
      );
      if (argv.override || !fs.existsSync(saveTo))
        this.translationDoesNotExists(fileForTranslation, saveTo);
      else this.translationAlreadyExists(fileForTranslation, saveTo);
    } catch (e) {
      console.log(`${(e as Error).message} at: ${filePath}`);
    }
  };

  private translationAlreadyExists = (fileForTranslation: JSONObj, saveTo: string): void => {
    try {
      const existingTranslation = JSON.parse(fs.readFileSync(saveTo, 'utf-8')) as JSONObj;
      this.deleteIfNeeded(fileForTranslation, existingTranslation, saveTo);
      this.translateIfNeeded(fileForTranslation, existingTranslation, saveTo);
    } catch (e) {
      console.log(`${(e as Error).message} at: ${saveTo}`);
    }
  };

  private deleteIfNeeded = (
    fileForTranslation: JSONObj,
    existingTranslation: JSONObj,
    saveTo: string,
  ): void => {
    const diffForDeletion: JSONObj = deletedDiff(
      existingTranslation,
      fileForTranslation,
    ) as JSONObj;
    if (Object.keys(diffForDeletion).length !== 0) {
      const content = extend(true, existingTranslation, diffForDeletion) as JSONObj;
      this.writeToFile(content, saveTo, `Unnecessary lines deleted for: ${saveTo}`);
    }
  };

  private translateIfNeeded = (
    fileForTranslation: JSONObj,
    existingTranslation: JSONObj,
    saveTo: string,
  ): void => {
    const diffForTranslation: JSONObj = addedDiff(
      existingTranslation,
      fileForTranslation,
    ) as JSONObj;
    if (Object.keys(diffForTranslation).length === 0) {
      console.log(`Everything already translated for: ${saveTo}`);
      return;
    }
    const valuesForTranslation: string[] = this.getValuesForTranslation(diffForTranslation);
    this.translateValues(valuesForTranslation, diffForTranslation, saveTo);
  };

  private translationDoesNotExists = (fileForTranslation: JSONObj, saveTo: string): void => {
    if (Object.keys(fileForTranslation).length === 0) {
      console.log(`Nothing to translate, file is empty: ${saveTo}`);
      return;
    }
    const valuesForTranslation: string[] = this.getValuesForTranslation(fileForTranslation);
    this.translateValues(valuesForTranslation, fileForTranslation, saveTo);
  };

  private getValuesForTranslation = (object: JSONObj): string[] => {
    let values: string[] = [];

    (function findValues(json: JSONObj): void {
      Object.values(json).forEach((value) => {
        if (typeof value === 'object') findValues(value);
        else values.push(value);
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

  private translateValues = (
    valuesForTranslation: string[],
    originalObject: JSONObj,
    saveTo: string,
  ): void => {
    if (valuesForTranslation.length > Translate.maxLinesPerRequest) {
      const splitted = this.splitValuesForTranslation(valuesForTranslation);
      const promises: Promise<string>[] = [];
      splitted.forEach((values) => {
        promises.push(this.callTranslateAPI(values));
      });
      Promise.all(promises)
        .then((response) => {
          let translated = '';
          response.forEach((value) => {
            translated += value + Translate.sentenceDelimiter;
          });
          this.saveTranslation(translated, originalObject, saveTo);
        })
        .catch((error) => {
          this.printError(error, saveTo);
        });
    } else {
      this.callTranslateAPI(valuesForTranslation)
        .then((response) => {
          this.saveTranslation(response, originalObject, saveTo);
        })
        .catch((error) => {
          this.printError(error, saveTo);
        });
    }
  };

  private splitValuesForTranslation = (valuesForTranslation: string[]): string[][] => {
    const resultArrays = [];

    for (let i = 0; i < valuesForTranslation.length; i += Translate.maxLinesPerRequest) {
      const chunk = valuesForTranslation.slice(i, i + Translate.maxLinesPerRequest);
      resultArrays.push(chunk);
    }

    return resultArrays;
  };

  protected abstract callTranslateAPI: (valuesForTranslation: string[]) => Promise<string>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private printError = (error: any, saveTo: string): void => {
    const errorFilePath = saveTo.replace(`${argv.to}.json`, `${argv.from}.json`);
    console.error(`Request error for file: ${errorFilePath}`);
    console.log(`Status Code: ${error?.response?.status ?? error?.response?.statusCode}`);
    console.log(`Status Text: ${error?.response?.statusText ?? error?.response?.statusMessage}`);
    console.log(
      `Data: ${JSON.stringify(error?.response?.data) ?? JSON.stringify(error?.errors[0].message)}`,
    );
  };

  private saveTranslation = (value: string, originalObject: JSONObj, saveTo: string): void => {
    // replaceAll() is used because of weird bug that sometimes happens
    // when translate api return delimiter with space in between
    let translations = replaceAll(value, '#__ #', '#__#');
    translations = replaceAll(translations, '# __#', '#__#');
    let content: JSONObj = this.createTranslatedObject(
      translations.split(Translate.sentenceDelimiter.trim()),
      originalObject,
    );
    let message: string = `File saved: ${saveTo}`;
    if (fs.existsSync(saveTo) && !argv.override) {
      const existingTranslation = JSON.parse(fs.readFileSync(saveTo, 'utf-8')) as JSONObj;
      content = extend(true, existingTranslation, content) as JSONObj;
      message = `File updated: ${saveTo}`;
    }
    this.writeToFile(content, saveTo, message);
  };

  private createTranslatedObject = (translations: string[], originalObject: JSONObj): JSONObj => {
    translations = translations.map((value) => this.returnSkippedWords(value));
    const translatedObject: JSONObj = { ...originalObject };
    let index: number = 0;

    (function addTranslations(json: JSONObj): void {
      Object.keys(json).forEach((key: string) => {
        if (typeof json[key] === 'object') addTranslations(json[key] as JSONObj);
        else json[key] = translations[index++]?.trim();
      });
    })(translatedObject);

    return translatedObject;
  };

  private returnSkippedWords(value: string): string {
    return value.replace(Translate.skipWordRegex, () => `${this.skippedWords.shift()}`);
  }

  private writeToFile = (content: JSONObj, saveTo: string, message: string): void => {
    try {
      fs.writeFileSync(saveTo, JSON.stringify(content, null, argv.spaces));
      console.log(message);
    } catch (e) {
      console.log((e as Error).message);
    }
  };
}
