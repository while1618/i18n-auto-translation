/* eslint-disable import/first */
process.argv.push('--key=test');
process.argv.push('--to=sr');
process.argv.push('--filePath=test');
process.argv.push('--dirPath=test');

import { AzureOfficialAPI } from '../src/translate/providers/azure-official-api';

describe('Translate', () => {
  it('should throw error, filePath or dirPath not provided', () => {
    expect(() => {
      new AzureOfficialAPI().translate();
    }).toThrowError('You should only provide a single file or a directory.');
  });
});
