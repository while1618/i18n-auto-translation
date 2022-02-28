import yargs from 'yargs';

interface Arguments {
  [x: string]: unknown;
  key: string;
  location: string;
  filePath?: string;
  dirPath?: string;
  from: string;
  to: string;
}

export const argv: Arguments = yargs(process.argv.slice(2))
  .options({
    key: {
      type: 'string',
      alias: 'k',
      demandOption: true,
      description: 'Subscription key.',
    },
    location: {
      type: 'string',
      alias: 'l',
      description: 'Your region. The default is global.',
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
      description: 'From which language you want to translate. The default is "en".',
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
