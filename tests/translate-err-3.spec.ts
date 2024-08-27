process.argv.push('--key=test');
process.argv.push('--to=sr');
process.argv.push('--dirPath=test');

import { AzureOfficialAPI } from '../src/translate/providers/azure-official-api';

describe('Translate', () => {
  it('should throw an error if filePath or dirPath is not provided', async () => {
    await expect(new AzureOfficialAPI().translate()).rejects.toThrow(
      '0 files found for translation in test',
    );
  });
});
