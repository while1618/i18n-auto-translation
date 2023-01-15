/* eslint-disable import/first */
process.argv.push('--key=test');
process.argv.push('--to=sr');

import { GoogleOfficialAPI } from '../src/translate/providers/google-official-api';
import { Translate } from '../src/translate/translate';
import { TranslateSupplier } from '../src/translate/translate-supplier';

describe('Translate Supplier', () => {
  it('should get right translate provider based on string', () => {
    const provider: Translate = TranslateSupplier.getProvider('google-official');
    expect(provider).toBeInstanceOf(GoogleOfficialAPI);
  });
});
