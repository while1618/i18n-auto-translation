import { Just } from './translate/providers/just';

try {
  new Just().translate();
} catch (e) {
  if (e instanceof Error) console.log(e.message);
  else console.log(e);
}
