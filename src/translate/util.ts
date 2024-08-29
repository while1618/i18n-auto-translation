import fs from 'fs';
import https from 'https';
import { exit } from 'process';

export const addCustomCert = (certificatePath: string): https.Agent => {
  try {
    return new https.Agent({
      ca: fs.readFileSync(certificatePath),
    });
  } catch (_) {
    console.log(`Certificate not fount at: ${certificatePath}`);
    return exit(1);
  }
};

const escapeRegExp = (string: string): string => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const replaceAll = (str: string, patterns: [string, string][]): string => {
  return patterns.reduce(
    (acc, [find, replace]) => acc.replace(new RegExp(escapeRegExp(find), 'g'), replace),
    str,
  );
};
