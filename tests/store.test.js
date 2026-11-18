import { describe, expect, it, vi } from 'vitest';
import {
  getStorage,
  readItem,
  readJson,
  readState,
  writeItem,
  writeState,
} from '../js/store.js';

const fakeStorage = (initial = {}) => {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value;
    },
  };
};

const broken = {
  getItem: () => {
    throw new Error('bloqué');
  },
  setItem: () => {
    throw new Error('bloqué');
  },
};

const DEFAULT = { own: [], filter: '', exact: false, view: 'all' };

describe('getStorage', () => {
  it('renvoie localStorage', () => {
    const localStorage = fakeStorage();
    expect(getStorage({ localStorage })).toBe(localStorage);
  });

  it('renvoie null quand l’accès au stockage lève', () => {
    const win = {
      get localStorage() {
        throw new Error('bloqué');
      },
    };
    expect(getStorage(win)).toBeNull();
  });
});

describe('readItem / writeItem', () => {
  it('lit et écrit une valeur', () => {
    const storage = fakeStorage();
    writeItem(storage, 'k', 'v');
    expect(storage.data).toEqual({ k: 'v' });
    expect(readItem(storage, 'k')).toBe('v');
  });

  it('lit null si absent', () => {
    expect(readItem(fakeStorage(), 'k')).toBeNull();
  });

  it('ne lève jamais, même sans stockage', () => {
    expect(readItem(broken, 'k')).toBeNull();
    expect(readItem(null, 'k')).toBeNull();
    expect(() => writeItem(broken, 'k', 'v')).not.toThrow();
    expect(() => writeItem(null, 'k', 'v')).not.toThrow();
  });
});

describe('readJson', () => {
  it('lit un JSON enregistré', () => {
    expect(readJson(fakeStorage({ k: '{"a":1}' }), 'k')).toEqual({ a: 1 });
  });

  it('renvoie null si la valeur est absente, illisible ou le stockage bloqué', () => {
    expect(readJson(fakeStorage(), 'k')).toBeNull();
    expect(readJson(fakeStorage({ k: '{pas du json' }), 'k')).toBeNull();
    expect(readJson(broken, 'k')).toBeNull();
    expect(readJson(null, 'k')).toBeNull();
  });
});

describe('readState', () => {
  it('lit un état valide', () => {
    const state = { own: ['a', 'b'], filter: 'cat', exact: true, view: 'owned' };
    const storage = fakeStorage({ 'mmh-state': JSON.stringify(state) });
    expect(readState(storage)).toEqual(state);
  });

  it('revient à l’état par défaut sans valeur, avec un JSON invalide ou sans stockage', () => {
    expect(readState(fakeStorage())).toEqual(DEFAULT);
    expect(readState(fakeStorage({ 'mmh-state': '{pas du json' }))).toEqual(
      DEFAULT,
    );
    expect(readState(fakeStorage({ 'mmh-state': '42' }))).toEqual(DEFAULT);
    expect(readState(broken)).toEqual(DEFAULT);
    expect(readState(null)).toEqual(DEFAULT);
  });

  it('corrige chaque champ invalide sans toucher aux autres', () => {
    const storage = fakeStorage({
      'mmh-state': JSON.stringify({
        own: 'a',
        filter: 3,
        exact: 'oui',
        view: 'autre',
      }),
    });
    expect(readState(storage)).toEqual(DEFAULT);
    const partial = fakeStorage({
      'mmh-state': JSON.stringify({ own: ['a', 2, 'b'], view: 'missing' }),
    });
    expect(readState(partial)).toEqual({
      ...DEFAULT,
      own: ['a', 'b'],
      view: 'missing',
    });
  });

  it('accepte chacune des trois vues', () => {
    for (const view of ['all', 'owned', 'missing']) {
      const storage = fakeStorage({ 'mmh-state': JSON.stringify({ view }) });
      expect(readState(storage).view).toBe(view);
    }
  });
});

describe('writeState', () => {
  it('écrit l’état en JSON sous la clé mmh-state', () => {
    const storage = fakeStorage();
    const state = { own: ['a'], filter: 'x', exact: true, view: 'missing' };
    writeState(storage, state);
    expect(storage.data).toEqual({ 'mmh-state': JSON.stringify(state) });
  });

  it('ne lève pas si le stockage est bloqué', () => {
    const spy = vi.spyOn(broken, 'setItem');
    expect(() => writeState(broken, DEFAULT)).not.toThrow();
    expect(spy).toHaveBeenCalled();
  });
});
