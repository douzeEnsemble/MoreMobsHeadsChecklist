import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { init } from '../js/app.js';
import { DATA } from './fixtures.js';

const PAGE = readFileSync('index.html', 'utf8');

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

const okFetch = () =>
  vi.fn().mockResolvedValue({ ok: true, json: async () => DATA });

let doc;
let storage;

// Le vrai index.html, analysé à chaque test : la page et le code ne peuvent pas diverger.
async function start({ stored = {}, fetchFn = okFetch(), store } = {}) {
  doc = new DOMParser().parseFromString(PAGE, 'text/html');
  storage = store === undefined ? fakeStorage(stored) : store;
  await init(doc, { fetchFn, storage });
}

const $ = (id) => doc.getElementById(id);
const ids = () =>
  [...doc.querySelectorAll('#rows tr')].map((row) => row.dataset.id);
const visible = () =>
  [...doc.querySelectorAll('#rows tr')]
    .filter((row) => !row.hidden)
    .map((row) => row.dataset.id);
const box = (id) => $(`own-${id}`);
const fire = (node, type) => node.dispatchEvent(new Event(type, { bubbles: true }));
const type = (value) => {
  $('q').value = value;
  fire($('q'), 'input');
};
const click = (node) => node.dispatchEvent(new MouseEvent('click', { bubbles: true }));
const sortBy = (key) => click(doc.querySelector(`th[data-sort="${key}"] button`));
const savedState = () => JSON.parse(storage.data['mmh-state']);

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function showModal() {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function close() {
    this.removeAttribute('open');
  });
});

describe('affichage', () => {
  it('charge les données et affiche une ligne par tête, dans l’ordre des données', async () => {
    const fetchFn = okFetch();
    await start({ fetchFn });
    expect(fetchFn).toHaveBeenCalledWith('data/heads.json');
    expect(ids()).toEqual(DATA.heads.map((head) => head.id));
    expect(visible()).toEqual(ids());
  });

  it('écrit le sous-titre et le compteur', async () => {
    await start();
    expect($('summary').textContent).toContain('4 têtes sur 4 mobs gérés');
    expect($('count').textContent).toBe('0 / 5 têtes obtenues · 5 affichées');
    expect($('alert').textContent).toBe('');
  });

  it('annonce l’échec du chargement dans la région d’alerte', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    await start({ fetchFn });
    expect($('alert').textContent).toBe(
      'Impossible de charger les données des têtes. Rechargez la page.',
    );
    expect(ids()).toEqual([]);
  });

  it('applique les préférences même si le chargement échoue', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('réseau'));
    await start({ fetchFn, stored: { 'mmh-theme': 'dark' } });
    expect(doc.documentElement.getAttribute('data-theme')).toBe('dark');
    expect($('alert').textContent).not.toBe('');
  });
});

describe('filtre', () => {
  it('masque les lignes qui ne correspondent pas, et met le compteur à jour', async () => {
    await start();
    type('bee');
    expect(visible()).toEqual(['bee-angry-bee-head']);
    expect($('count').textContent).toBe('0 / 5 têtes obtenues · 1 affichées');
    type('');
    expect(visible()).toHaveLength(5);
  });

  it('accepte plusieurs termes', async () => {
    await start();
    type('blaze, camel');
    expect(visible()).toEqual(['blaze-blaze-head', 'camel-camel-head']);
  });

  it('« Nom exact » ne garde que les noms entiers', async () => {
    await start();
    type('bee');
    $('exact').checked = true;
    fire($('exact'), 'change');
    expect(visible()).toEqual(['bee-angry-bee-head']);
    type('angry');
    expect(visible()).toEqual([]);
    $('exact').checked = false;
    fire($('exact'), 'change');
    expect(visible()).toEqual(['bee-angry-bee-head']);
  });

  it('le bouton d’effacement n’apparaît que si le filtre n’est pas vide', async () => {
    await start();
    expect($('reset').hidden).toBe(true);
    type('bee');
    expect($('reset').hidden).toBe(false);
    type('');
    expect($('reset').hidden).toBe(true);
  });

  it('effacer vide le filtre, réaffiche tout et rend le focus au champ', async () => {
    await start();
    const focus = vi.spyOn($('q'), 'focus');
    type('bee');
    click($('reset'));
    expect($('q').value).toBe('');
    expect(visible()).toHaveLength(5);
    expect($('reset').hidden).toBe(true);
    expect(savedState().filter).toBe('');
    expect(focus).toHaveBeenCalledTimes(1);
  });
});

describe('têtes obtenues', () => {
  it('cocher met le compteur à jour sans masquer la ligne cochée', async () => {
    await start();
    $('view').value = 'missing';
    fire($('view'), 'change');
    box('camel-camel-head').checked = true;
    fire(box('camel-camel-head'), 'change');
    expect($('count').textContent).toBe('1 / 5 têtes obtenues · 5 affichées');
    expect(visible()).toContain('camel-camel-head');
    expect(savedState().own).toEqual(['camel-camel-head']);
  });

  it('décocher retire la tête de la liste', async () => {
    await start({
      stored: { 'mmh-state': JSON.stringify({ own: ['camel-camel-head'] }) },
    });
    expect(box('camel-camel-head').checked).toBe(true);
    box('camel-camel-head').checked = false;
    fire(box('camel-camel-head'), 'change');
    expect($('count').textContent).toBe('0 / 5 têtes obtenues · 5 affichées');
    expect(savedState().own).toEqual([]);
  });

  it('la vue « Obtenues seulement » ne garde que les cochées', async () => {
    await start({
      stored: {
        'mmh-state': JSON.stringify({
          own: ['camel-camel-head', 'zombie'],
          view: 'owned',
        }),
      },
    });
    expect(visible()).toEqual(['camel-camel-head', 'zombie']);
    expect($('view').value).toBe('owned');
  });

  it('la vue « Manquantes seulement » ne garde que les non cochées', async () => {
    await start();
    box('camel-camel-head').checked = true;
    fire(box('camel-camel-head'), 'change');
    $('view').value = 'missing';
    fire($('view'), 'change');
    expect(visible()).toEqual([
      'bee-angry-bee-head',
      'blaze-blaze-head',
      'rabbit-toast-rabbit-head',
      'zombie',
    ]);
    expect(savedState().view).toBe('missing');
  });
});

describe('mémorisation', () => {
  it('retrouve filtre, « nom exact » et vue enregistrés', async () => {
    await start({
      stored: {
        'mmh-state': JSON.stringify({
          filter: 'bee',
          exact: true,
          view: 'all',
        }),
      },
    });
    expect($('q').value).toBe('bee');
    expect($('exact').checked).toBe(true);
    expect(visible()).toEqual(['bee-angry-bee-head']);
    expect($('reset').hidden).toBe(false);
  });

  it('enregistre chaque changement', async () => {
    await start();
    type('cat');
    expect(savedState()).toEqual({
      own: [],
      filter: 'cat',
      exact: false,
      view: 'all',
    });
    $('exact').checked = true;
    fire($('exact'), 'change');
    expect(savedState().exact).toBe(true);
    $('view').value = 'owned';
    fire($('view'), 'change');
    expect(savedState().view).toBe('owned');
  });

  it('fonctionne sans stockage', async () => {
    await start({ store: null });
    type('bee');
    expect(visible()).toEqual(['bee-angry-bee-head']);
  });
});

describe('tri', () => {
  it('trie au clic, puis inverse au second clic', async () => {
    await start();
    sortBy('rate');
    expect(ids()).toEqual([
      'zombie',
      'blaze-blaze-head',
      'rabbit-toast-rabbit-head',
      'bee-angry-bee-head',
      'camel-camel-head',
    ]);
    expect(doc.querySelector('th[data-sort="rate"]').getAttribute('aria-sort')).toBe('ascending');
    sortBy('rate');
    expect(ids()).toEqual([
      'camel-camel-head',
      'bee-angry-bee-head',
      'rabbit-toast-rabbit-head',
      'blaze-blaze-head',
      'zombie',
    ]);
    expect(doc.querySelector('th[data-sort="rate"]').getAttribute('aria-sort')).toBe('descending');
  });

  it('une seule colonne porte aria-sort à la fois', async () => {
    await start();
    sortBy('rate');
    sortBy('name');
    expect(
      [...doc.querySelectorAll('th[aria-sort]')].map((th) => th.dataset.sort),
    ).toEqual(['name']);
    expect(ids()[0]).toBe('bee-angry-bee-head');
  });

  it('trie par case cochée et par lieu', async () => {
    await start();
    box('zombie').checked = true;
    sortBy('owned');
    expect(ids()[4]).toBe('zombie');
    sortBy('where');
    expect(ids()[0]).toBe('rabbit-toast-rabbit-head');
  });

  it('garde le filtre et les cases après le tri', async () => {
    await start();
    box('blaze-blaze-head').checked = true;
    type('blaze, camel');
    sortBy('name');
    expect(visible()).toEqual(['blaze-blaze-head', 'camel-camel-head']);
    expect(box('blaze-blaze-head').checked).toBe(true);
  });
});

describe('thème', () => {
  it('le bouton fait tourner Auto, Clair, Sombre', async () => {
    await start();
    const button = $('theme');
    expect(button.getAttribute('aria-label')).toBe('Thème : Auto');
    expect(button.dataset.theme).toBe('system');
    expect(doc.documentElement.hasAttribute('data-theme')).toBe(false);
    click(button);
    expect(button.getAttribute('aria-label')).toBe('Thème : Clair');
    expect(button.dataset.theme).toBe('light');
    expect(doc.documentElement.getAttribute('data-theme')).toBe('light');
    expect(storage.data['mmh-theme']).toBe('light');
    click(button);
    expect(button.getAttribute('aria-label')).toBe('Thème : Sombre');
    expect(doc.documentElement.getAttribute('data-theme')).toBe('dark');
    click(button);
    expect(button.getAttribute('aria-label')).toBe('Thème : Auto');
    expect(doc.documentElement.hasAttribute('data-theme')).toBe(false);
    expect(storage.data['mmh-theme']).toBe('system');
  });

  it('retrouve le thème enregistré', async () => {
    await start({ stored: { 'mmh-theme': 'dark' } });
    expect($('theme').getAttribute('aria-label')).toBe('Thème : Sombre');
    expect(doc.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});

describe('accessibilité', () => {
  const boxes = () =>
    Object.fromEntries(
      [...$('a11y-dialog').querySelectorAll('[data-pref]')].map((input) => [
        input.dataset.pref,
        input.checked,
      ]),
    );

  it('le bouton ouvre la boîte de dialogue', async () => {
    await start();
    click($('a11y'));
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);
    expect($('a11y-dialog').hasAttribute('open')).toBe(true);
  });

  it('un clic sur le fond ferme la boîte, un clic dedans non', async () => {
    await start();
    click($('a11y'));
    click($('a11y-dialog').querySelector('h2'));
    expect(HTMLDialogElement.prototype.close).not.toHaveBeenCalled();
    click($('a11y-dialog'));
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalledTimes(1);
    expect($('a11y-dialog').hasAttribute('open')).toBe(false);
  });

  it('tout est désactivé par défaut', async () => {
    await start();
    expect(boxes()).toEqual({
      largeText: false,
      highContrast: false,
      reduceMotion: false,
    });
    expect(doc.documentElement.getAttributeNames()).toEqual(['lang']);
  });

  it('chaque case applique son réglage tout de suite et l’enregistre', async () => {
    await start();
    const input = (key) => $('a11y-dialog').querySelector(`[data-pref="${key}"]`);
    input('largeText').checked = true;
    fire(input('largeText'), 'change');
    expect(doc.documentElement.hasAttribute('data-large-text')).toBe(true);
    input('highContrast').checked = true;
    fire(input('highContrast'), 'change');
    input('reduceMotion').checked = true;
    fire(input('reduceMotion'), 'change');
    expect(doc.documentElement.hasAttribute('data-high-contrast')).toBe(true);
    expect(doc.documentElement.hasAttribute('data-reduce-motion')).toBe(true);
    expect(JSON.parse(storage.data['mmh-a11y'])).toEqual({
      largeText: true,
      highContrast: true,
      reduceMotion: true,
    });
    input('largeText').checked = false;
    fire(input('largeText'), 'change');
    expect(doc.documentElement.hasAttribute('data-large-text')).toBe(false);
    expect(JSON.parse(storage.data['mmh-a11y']).largeText).toBe(false);
  });

  it('retrouve les réglages enregistrés', async () => {
    await start({
      stored: {
        'mmh-a11y': JSON.stringify({ highContrast: true, reduceMotion: true }),
      },
    });
    expect(boxes()).toEqual({
      largeText: false,
      highContrast: true,
      reduceMotion: true,
    });
    expect(doc.documentElement.hasAttribute('data-high-contrast')).toBe(true);
    expect(doc.documentElement.hasAttribute('data-large-text')).toBe(false);
  });
});
