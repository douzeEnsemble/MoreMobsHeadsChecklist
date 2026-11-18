import { readItem, readJson, writeItem } from './store.js';

const THEME_KEY = 'mmh-theme';
const A11Y_KEY = 'mmh-a11y';

// « system » est le thème par défaut : toute autre valeur y retombe.
const FORCED_THEMES = ['light', 'dark'];
const NEXT_THEME = { system: 'light', light: 'dark', dark: 'system' };
const THEME_LABELS = { system: 'Auto', light: 'Clair', dark: 'Sombre' };

export const A11Y_KEYS = ['largeText', 'highContrast', 'reduceMotion'];

export function readTheme(storage) {
  const stored = readItem(storage, THEME_KEY);
  return FORCED_THEMES.includes(stored) ? stored : 'system';
}

export function nextTheme(theme) {
  return NEXT_THEME[theme];
}

export function themeLabel(theme) {
  return THEME_LABELS[theme];
}

// « Auto » : aucun attribut, la préférence du système décide (prefers-color-scheme).
export function applyTheme(root, theme) {
  if (theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);
}

export function saveTheme(storage, theme) {
  writeItem(storage, THEME_KEY, theme);
}

// Trois réglages indépendants, tous désactivés par défaut.
export function readA11y(storage) {
  const saved = readJson(storage, A11Y_KEY);
  return Object.fromEntries(
    A11Y_KEYS.map((key) => [key, saved?.[key] === true]),
  );
}

// Un attribut booléen par réglage sur <html> (data-large-text, data-high-contrast,
// data-reduce-motion), lus par style.css.
export function applyA11y(root, pref) {
  root.toggleAttribute('data-large-text', pref.largeText);
  root.toggleAttribute('data-high-contrast', pref.highContrast);
  root.toggleAttribute('data-reduce-motion', pref.reduceMotion);
}

export function saveA11y(storage, pref) {
  writeItem(storage, A11Y_KEY, JSON.stringify(pref));
}
