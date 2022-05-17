import yargs from 'yargs';

interface Arguments {
  [x: string]: unknown;
  apiProvider: string;
  key: string;
  region: string;
  filePath?: string;
  dirPath?: string;
  from: string;
  to: string;
  override: boolean;
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
      description: 'Subscription key for the API provider.',
    },
    region: {
      type: 'string',
      alias: 'r',
      description: 'Key region. Used only by the Official Azure API.',
      default: 'global',
    },
    filePath: {
      type: 'string',
      alias: 'p',
      description: 'Path to a single JSON file.',
    },
    dirPath: {
      type: 'string',
      alias: 'd',
      description:
        'Path to a directory in which you will recursively find all JSON files named [from].json (e.g. en.json)',
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
    override: {
      type: 'boolean',
      alias: 'o',
      description: 'Override all created i18n JSON files.',
      default: false,
    },
  })
  .parseSync();
