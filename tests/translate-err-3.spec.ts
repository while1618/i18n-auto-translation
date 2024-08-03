process.argv.push('--key=test');
process.argv.push('--to=sr');
process.argv.push('--dirPath=test');

import { AzureOfficialAPI } from '../src/translate/providers/azure-official-api';

describe('Translate', () => {
  it('should throw error, filePath or dirPath not provided', () => {
    expect(() => {
      new AzureOfficialAPI().translate();
    }).toThrow('0 files found for translation in test');
  });
});
