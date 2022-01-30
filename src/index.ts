import { Translate } from './app/translate';

try {
  new Translate().start();
} catch (e) {
  if (e instanceof Error) console.log(e.message);
  else console.log(e);
}
