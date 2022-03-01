import yargs from 'yargs';

interface Arguments {
  [x: string]: unknown;
  apiProvider: string;
  key: string;
  location: string;
  filePath?: string;
  dirPath?: string;
  from: string;
  to: string;
}

export const argv: Arguments = yargs(process.argv.slice(2))
  .options({
    apiProvider: {
      type: 'string',
      alias: 'a',
      description: 'API Provider.',
      choices: [
        'google-official',
        'azure-official',
        'azure-rapid',
        'aws-official',
        'deep-rapid',
        'just-rapid',
        'lecto-rapid',
        'lingvanex-rapid',
        'nlp-rapid',
      ],
      default: 'google-official',
    },
    key: {
      type: 'string',
      alias: 'k',
      demandOption: true,
      description: 'Subscription key.',
    },
    location: {
      type: 'string',
      alias: 'l',
      description: 'Your region. Used only by Official Azure API.',
      default: 'global',
    },
    filePath: {
      type: 'string',
      alias: 'p',
      description: 'Path to the single JSON file you want to translate.',
    },
    dirPath: {
      type: 'string',
      alias: 'd',
      description:
        'Path to the directory in which you want to translate all JSON files recursively.',
    },
    from: {
      type: 'string',
      alias: 'f',
      description: 'From which language you want to translate.',
      default: 'en',
    },
    to: {
      type: 'string',
      alias: 't',
      demandOption: true,
      description: 'To which language you want to translate.',
    },
  })
  .parseSync();
