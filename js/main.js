import { init } from './app.js';
import { getStorage } from './store.js';

init(document, {
  fetchFn: (url) => fetch(url),
  storage: getStorage(window),
});
