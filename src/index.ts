#!/usr/bin/env node
import { argv } from './translate/cli';
import { TranslateSupplier } from './translate/translate-supplier';

const main = async () => {
  try {
    await TranslateSupplier.getProvider(argv.apiProvider).translate();
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.message);
    } else {
      console.log(e);
    }
  }
};

main();
