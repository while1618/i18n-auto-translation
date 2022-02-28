import { Azure } from './app/azure';

try {
  new Azure().translate();
} catch (e) {
  if (e instanceof Error) console.log(e.message);
  else console.log(e);
}
