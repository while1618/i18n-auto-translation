import fs from 'fs';
import https from 'https';
import { exit } from 'process';

export function addCustomCert(certificatePath: string): https.Agent {
  try {
    return new https.Agent({
      ca: fs.readFileSync(certificatePath),
    });
  } catch (e) {
    console.log(`Certificate not fount at: ${certificatePath}`);
    return exit(1);
  }
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export function replaceAll(str: string, find: string, replace: string) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}
