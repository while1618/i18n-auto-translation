#!/usr/bin/env node
import { argv } from './translate/cli';
import { TranslateSupplier } from './translate/translate-supplier';

TranslateSupplier.getProvider(argv.apiProvider)
  .translate()
  .catch((e) => {
    if (e instanceof Error) {
      console.error(e.message);
    } else {
      console.error(e);
    }
  });
