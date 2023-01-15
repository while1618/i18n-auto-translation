/* eslint-disable import/first */
process.argv.push('--key=test');
process.argv.push('--filePath=./tests/i18n/en.json');
process.argv.push('--dirPath=./tests/i18n/');
process.argv.push('--to=sr');

import { argv } from '../src/translate/cli';

describe('CLI', () => {
  it('should have all parameters', () => {
    expect(argv.apiProvider).toBe('google-official');
    expect(argv.key).toBe('test');
    expect(argv.region).toBe('global');
    expect(argv.filePath).toBe('./tests/i18n/en.json');
    expect(argv.dirPath).toBe('./tests/i18n/');
    expect(argv.from).toBe('en');
    expect(argv.to).toBe('sr');
    expect(argv.override).toBeFalsy();
    expect(argv.certificatePath).toBeUndefined();
  });
});
