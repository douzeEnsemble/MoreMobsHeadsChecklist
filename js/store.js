const STATE_KEY = 'mmh-state';
// « all » est la vue par défaut : toute autre valeur y retombe.
const FILTERED_VIEWS = ['owned', 'missing'];

// localStorage peut lever (navigation privée, données bloquées) : null alors.
export function getStorage(win) {
  try {
    return win.localStorage;
  } catch {
    return null;
  }
}

export function readItem(storage, key) {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

export function writeItem(storage, key, value) {
  try {
    storage.setItem(key, value);
  } catch {
    // stockage indisponible : le réglage ne survivra simplement pas au rechargement
  }
}

// JSON enregistré, ou null si la valeur est absente, illisible ou si le stockage est bloqué.
export function readJson(storage, key) {
  try {
    return JSON.parse(readItem(storage, key));
  } catch {
    return null;
  }
}

// État de la page : têtes obtenues, filtre, « nom exact » et vue. Toute valeur invalide
// retombe sur la valeur par défaut, le reste de l'état est conservé.
export function readState(storage) {
  const saved = readJson(storage, STATE_KEY) ?? {};
  return {
    own: Array.isArray(saved.own)
      ? saved.own.filter((id) => typeof id === 'string')
      : [],
    filter: typeof saved.filter === 'string' ? saved.filter : '',
    exact: saved.exact === true,
    view: FILTERED_VIEWS.includes(saved.view) ? saved.view : 'all',
  };
}

export function writeState(storage, state) {
  writeItem(storage, STATE_KEY, JSON.stringify(state));
}
