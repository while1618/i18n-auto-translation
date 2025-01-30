import { addedDiff, deletedDiff } from 'deep-object-diff';
import fs from 'fs';
import { globSync } from 'glob';
import extend from 'just-extend';
import path from 'path';
import yoctoSpinner from 'yocto-spinner';
import { argv } from './cli.js';
import { type JSONObj } from './payload.js';
import { delay, replaceAll } from './util.js';

export abstract class Translate {
  public static readonly sentenceDelimiter: string = '\n#__#\n';
  private static readonly skipWordRegex: RegExp =
    /({{([^{}]+)}}|<([^<>]+)>|<\/([^<>]+)>|\{([^{}]+)\})/g;

  private fileForTranslation: JSONObj = {};
  private saveTo: string = '';
  private skippedWords: string[] = [];

  public translate = async (): Promise<void> => {
    if (argv.filePath && argv.dirPath) {
      throw new Error('You should only provide a single file or a directory.');
    }

    if (!argv.filePath && !argv.dirPath) {
      throw new Error('You must provide a single file or a directory.');
    }

    if (argv.dirPath) {
      if (argv.saveTo) {
        throw new Error('--saveTo should only be used with --filePath');
      }

      await this.translateFiles(argv.dirPath);
    }

    if (argv.filePath) {
      await this.translateFile(argv.filePath);
    }
  };

  private translateFiles = async (dirPath: string): Promise<void> => {
    const spinner = yoctoSpinner({ text: 'Finding files for translation...' }).start();
    const filePaths: string[] = globSync(`${dirPath}/**/${argv.from}.json`, {
      ignore: [`${dirPath}/**/node_modules/**`, `${dirPath}/**/dist/**`],
    });
    if (filePaths.length === 0) {
      spinner.error(`Abort!`);
      throw new Error(`Nothing to translate in directory: ${dirPath}`);
    }
    spinner.success(`${filePaths.length} files found.`);
    for (const filePath of filePaths) {
      this.skippedWords = [];
      await this.translateFile(filePath);
    }
  };

  private translateFile = async (filePath: string): Promise<void> => {
    const spinner = yoctoSpinner({ text: 'Translating...' }).start();
    try {
      this.fileForTranslation = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as JSONObj;
      if (argv.saveTo) {
        this.saveTo = path.join(argv.saveTo, `${argv.to}.json`);
      } else {
        this.saveTo = path.join(
          filePath.substring(0, filePath.lastIndexOf('/')),
          `${argv.to}.json`,
        );
      }
      if (argv.override || !fs.existsSync(this.saveTo)) {
        await this.translationDoesNotExists();
      } else {
        await this.translationAlreadyExists();
      }
      spinner.success('Done!\n');
    } catch (e) {
      this.printError(e, filePath);
      spinner.error('Abort!\n');
    }
  };

  private translationDoesNotExists = async (): Promise<void> => {
    if (Object.keys(this.fileForTranslation).length === 0) {
      console.log(`\nNothing to translate, file is empty: ${this.saveTo}`);
      return;
    }
    const valuesForTranslation: string[] = this.getValuesForTranslation(this.fileForTranslation);
    await this.translateValues(valuesForTranslation, this.fileForTranslation);
  };

  private translationAlreadyExists = async (): Promise<void> => {
    const existingTranslation = JSON.parse(fs.readFileSync(this.saveTo, 'utf-8')) as JSONObj;
    this.deleteIfNeeded(existingTranslation);
    await this.translateIfNeeded(existingTranslation);
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
      console.log(`\nEverything already translated for: ${this.saveTo}`);
      return;
    }
    const valuesForTranslation: string[] = this.getValuesForTranslation(diffForTranslation);
    await this.translateValues(valuesForTranslation, diffForTranslation);
  };

  private getValuesForTranslation = (objectBeforeTranslation: JSONObj): string[] => {
    let values: string[] = [];

    (function findValues(json: JSONObj): void {
      Object.values(json).forEach((value) => {
        if (typeof value === 'object') {
          findValues(value);
        } else {
          values.push(value);
        }
      });
    })(objectBeforeTranslation);

    values = values.map((value) => this.skipWords(value));
    return values;
  };

  private skipWords(value: string): string {
    return value.replace(Translate.skipWordRegex, (match: string) => {
      this.skippedWords.push(match);
      return `{{${this.skippedWords.length - 1}}}`;
    });
  }

  private translateValues = async (
    valuesForTranslation: string[],
    objectBeforeTranslation: JSONObj,
  ): Promise<void> => {
    if (valuesForTranslation.length > argv.maxLinesPerRequest) {
      const splitted = this.splitValuesForTranslation(valuesForTranslation);
      const responses: string[] = [];
      for (const values of splitted) {
        const response = await this.callTranslateAPI(values);
        responses.push(response);
        await delay(argv.delay);
      }
      const translated = responses.join(Translate.sentenceDelimiter);
      this.saveTranslation(this.cleanUpTranslations(translated), objectBeforeTranslation);
    } else {
      const translated = await this.callTranslateAPI(valuesForTranslation);
      this.saveTranslation(this.cleanUpTranslations(translated), objectBeforeTranslation);
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

  private cleanUpTranslations = (value: string): string => {
    // This is needed because of weird bugs:
    // https://github.com/while1618/i18n-auto-translation/issues/12
    // https://github.com/while1618/i18n-auto-translation/issues/53
    const patterns: [string, string][] = [
      ['#___#', '#__#'],
      ['#__ #', '#__#'],
      ['# __#', '#__#'],
      ['# __ #', '#__#'],
    ];
    return replaceAll(value, patterns);
  };

  protected abstract callTranslateAPI: (valuesForTranslation: string[]) => Promise<string>;

  private printError = (error: unknown, filePath: string): void => {
    console.error(`\nError for a file: ${filePath}`);

    if (error && typeof error === 'object' && 'response' in error) {
      const response = (error as { response: unknown }).response;
      if (response && typeof response === 'object') {
        console.log(
          `Status Code: ${'status' in response ? response.status : 'statusCode' in response ? response.statusCode : 'N/A'}`,
        );
        console.log(
          `Status Text: ${'statusText' in response ? response.statusText : 'statusMessage' in response ? response.statusMessage : 'N/A'}`,
        );
        console.log(
          `Data: ${'data' in response ? JSON.stringify(response.data) : 'errors' in error && Array.isArray(error.errors) && error.errors[0] && 'message' in error.errors[0] ? JSON.stringify(error.errors[0].message) : 'N/A'}`,
        );
      }
    } else {
      console.log(`${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  private saveTranslation = (translations: string, objectBeforeTranslation: JSONObj): void => {
    let objectAfterTranslation: JSONObj = this.createTranslatedObject(
      translations.split(Translate.sentenceDelimiter),
      objectBeforeTranslation,
    );
    if (fs.existsSync(this.saveTo) && !argv.override) {
      const existingTranslation = JSON.parse(fs.readFileSync(this.saveTo, 'utf-8')) as JSONObj;
      objectAfterTranslation = extend(true, existingTranslation, objectAfterTranslation) as JSONObj;
      objectAfterTranslation = this.reorderJSONKeys(
        this.fileForTranslation,
        objectAfterTranslation,
      );
    }
    this.writeToFile(objectAfterTranslation, this.getSaveMessage());
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
          json[key] = argv.trim ? translations[index++]?.trim() : translations[index++];
        }
      });
    })(translatedObject);

    return translatedObject;
  };

  private returnSkippedWords(value: string): string {
    return value.replace(Translate.skipWordRegex, () => `${this.skippedWords.shift()}`);
  }

  private reorderJSONKeys(reference: JSONObj, target: JSONObj): JSONObj {
    const reordered: JSONObj = {};

    Object.keys(reference).forEach((key) => {
      if (key in target) {
        const refValue = reference[key];
        const targetValue = target[key];

        if (typeof refValue === 'object' && typeof targetValue === 'object') {
          reordered[key] = this.reorderJSONKeys(refValue, targetValue);
        } else {
          reordered[key] = targetValue;
        }
      }
    });

    return reordered;
  }

  private getSaveMessage = (): string => {
    return fs.existsSync(this.saveTo) && !argv.override
      ? `File updated: ${this.saveTo}`
      : `File saved: ${this.saveTo}`;
  };

  private writeToFile = (content: JSONObj, message: string): void => {
    try {
      fs.writeFileSync(this.saveTo, JSON.stringify(content, null, argv.spaces));
      console.log(`\n${message}`);
    } catch (e) {
      console.log((e as Error).message);
    }
  };
}
