import { argv } from './translate/cli';
import { Translate } from './translate/translate';
import { TranslateSupplier } from './translate/translate-supplier';

try {
  (TranslateSupplier.getProvider(argv.apiProvider) as Translate).translate();
} catch (e) {
  if (e instanceof Error) console.log(e.message);
  else console.log(e);
}
