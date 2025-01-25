#!/usr/bin/env node
import { argv } from './translate/cli.js';
import { TranslateSupplier } from './translate/translate-supplier.js';

/**
 * This method suppresses the deprecation warning for the `punycode` module.
 *
 * The warning is caused by `google-gax`, a dependency of `@google-cloud/translate`,
 * which this library uses for translation functionality.
 *
 * Until the `google-gax` makes an update, and remove the use of `punycode`,
 * this deprecation warning will persist. There is an open issue for this in `google-gax` repository:
 *
 * GitHub Issue Tracking the Work:
 * https://github.com/googleapis/gax-nodejs/issues/1568
 *
 * Once the underlying issue is resolved, this workaround can be removed.
 */
const originalStderrWrite = process.stderr.write.bind(process.stderr);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
process.stderr.write = (message: string | Uint8Array, ...args: any[]): boolean => {
  if (typeof message === 'string' && message.includes('punycode')) {
    return true; // Suppress the warning
  }
  return originalStderrWrite(message, ...args);
};

TranslateSupplier.getProvider(argv.apiProvider)
  .translate()
  .catch((e) => {
    if (e instanceof Error) {
      console.error(e.message);
    } else {
      console.error(e);
    }
  });
