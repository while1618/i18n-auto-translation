process.argv.push('--key=test');
process.argv.push('--to=sr');

import { AzureOfficialAPI } from '../src/translate/providers/azure-official-api';

describe('Translate', () => {
  it('should throw error, filePath or dirPath not provided', () => {
    expect(async () => {
      await new AzureOfficialAPI().translate();
    }).rejects.toThrow('You must provide a single file or a directory.');
  });
});
