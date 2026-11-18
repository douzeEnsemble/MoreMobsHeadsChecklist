import { loadData } from './data.js';
import { matches, parseTerms, viewAllows } from './filter.js';
import { summary } from './format.js';
import {
  A11Y_KEYS,
  applyA11y,
  applyTheme,
  nextTheme,
  readA11y,
  readTheme,
  saveA11y,
  saveTheme,
  themeLabel,
} from './preferences.js';
import { nextAscending, sortEntries } from './sort.js';
import { readState, writeState } from './store.js';
import { createRow } from './table.js';

// Point d'entrée testable : tout ce qui touche au navigateur (document, fetch, stockage)
// arrive en paramètre.
export async function init(doc, { fetchFn, storage }) {
  const $ = (id) => doc.getElementById(id);
  const root = doc.documentElement;

  initPreferences(doc, root, storage);

  let data;
  try {
    data = await loadData(fetchFn);
  } catch {
    $('alert').textContent =
      'Impossible de charger les données des têtes. Rechargez la page.';
    return;
  }

  const state = readState(storage);
  const own = new Set(state.own);
  const entries = data.heads.map((head) => ({
    head,
    row: createRow(doc, head),
  }));
  for (const { head, row } of entries) {
    row.querySelector('input').checked = own.has(head.id);
  }
  const body = $('rows');
  body.append(...entries.map(({ row }) => row));

  const query = $('q');
  const exact = $('exact');
  const view = $('view');
  const reset = $('reset');
  query.value = state.filter;
  exact.checked = state.exact;
  view.value = state.view;
  $('summary').textContent = summary(data);

  const save = () =>
    writeState(storage, {
      own: [...own],
      filter: query.value,
      exact: exact.checked,
      view: view.value,
    });

  const refreshStatus = () => {
    const shown = entries.filter(({ row }) => !row.hidden).length;
    $('count').textContent =
      `${own.size} / ${entries.length} têtes obtenues · ${shown} affichées`;
  };

  // Les lignes se masquent au changement de filtre ou de vue, pas à chaque case cochée :
  // la ligne qu'on vient de cocher garde le focus au lieu de disparaître sous les doigts.
  const applyFilter = () => {
    const terms = parseTerms(query.value);
    for (const { head, row } of entries) {
      row.hidden = !(
        matches(head, terms, exact.checked) &&
        viewAllows(view.value, own.has(head.id))
      );
    }
    reset.hidden = query.value === '';
    refreshStatus();
  };

  query.addEventListener('input', () => {
    applyFilter();
    save();
  });
  exact.addEventListener('change', () => {
    applyFilter();
    save();
  });
  view.addEventListener('change', () => {
    applyFilter();
    save();
  });
  reset.addEventListener('click', () => {
    query.value = '';
    applyFilter();
    save();
    query.focus();
  });
  body.addEventListener('change', (event) => {
    const id = event.target.closest('tr').dataset.id;
    if (event.target.checked) own.add(id);
    else own.delete(id);
    refreshStatus();
    save();
  });

  for (const header of doc.querySelectorAll('th[data-sort]')) {
    header.querySelector('button').addEventListener('click', () => {
      const ascending = nextAscending(header.getAttribute('aria-sort'));
      for (const other of doc.querySelectorAll('th[data-sort]')) {
        other.removeAttribute('aria-sort');
      }
      header.setAttribute('aria-sort', ascending ? 'ascending' : 'descending');
      const sorted = sortEntries(
        entries.map(({ head, row }) => ({
          head,
          row,
          owned: row.querySelector('input').checked,
        })),
        header.dataset.sort,
        ascending,
      );
      body.append(...sorted.map(({ row }) => row));
    });
  }

  applyFilter();
}

// Thème (Auto / Clair / Sombre) et réglages d'accessibilité (texte plus grand, contraste
// élevé, animations réduites), mémorisés par appareil ; la boîte de dialogue est le
// <dialog> natif de la page (focus piégé, Échap, retour du focus gérés par le navigateur).
function initPreferences(doc, root, storage) {
  const $ = (id) => doc.getElementById(id);

  let theme = readTheme(storage);
  const themeButton = $('theme');
  const showTheme = () => {
    applyTheme(root, theme);
    themeButton.setAttribute('aria-label', `Thème : ${themeLabel(theme)}`);
    themeButton.dataset.theme = theme;
  };
  showTheme();
  themeButton.addEventListener('click', () => {
    theme = nextTheme(theme);
    saveTheme(storage, theme);
    showTheme();
  });

  const pref = readA11y(storage);
  applyA11y(root, pref);
  const dialog = $('a11y-dialog');
  for (const key of A11Y_KEYS) {
    const box = dialog.querySelector(`[data-pref="${key}"]`);
    box.checked = pref[key];
    box.addEventListener('change', () => {
      pref[key] = box.checked;
      saveA11y(storage, pref);
      applyA11y(root, pref);
    });
  }
  $('a11y').addEventListener('click', () => dialog.showModal());
  // Un clic sur le fond (hors de la boîte) ferme le dialogue, comme Échap.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
}
