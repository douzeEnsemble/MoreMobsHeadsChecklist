import { describe, expect, it } from 'vitest';
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
} from '../js/preferences.js';

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

describe('thème', () => {
  it('lit le thème enregistré, sinon « system »', () => {
    expect(readTheme(fakeStorage({ 'mmh-theme': 'dark' }))).toBe('dark');
    expect(readTheme(fakeStorage({ 'mmh-theme': 'light' }))).toBe('light');
    expect(readTheme(fakeStorage({ 'mmh-theme': 'system' }))).toBe('system');
    expect(readTheme(fakeStorage({ 'mmh-theme': 'rose' }))).toBe('system');
    expect(readTheme(fakeStorage())).toBe('system');
    expect(readTheme(null)).toBe('system');
  });

  it('passe de Auto à Clair, Sombre, puis Auto', () => {
    expect(nextTheme('system')).toBe('light');
    expect(nextTheme('light')).toBe('dark');
    expect(nextTheme('dark')).toBe('system');
  });

  it('nomme chaque thème', () => {
    expect(themeLabel('system')).toBe('Auto');
    expect(themeLabel('light')).toBe('Clair');
    expect(themeLabel('dark')).toBe('Sombre');
  });

  it('pose data-theme, sauf en Auto', () => {
    const root = document.createElement('html');
    applyTheme(root, 'dark');
    expect(root.getAttribute('data-theme')).toBe('dark');
    applyTheme(root, 'light');
    expect(root.getAttribute('data-theme')).toBe('light');
    applyTheme(root, 'system');
    expect(root.hasAttribute('data-theme')).toBe(false);
  });

  it('enregistre le thème', () => {
    const storage = fakeStorage();
    saveTheme(storage, 'dark');
    expect(storage.data).toEqual({ 'mmh-theme': 'dark' });
  });
});

describe('réglages d’accessibilité', () => {
  const OFF = { largeText: false, highContrast: false, reduceMotion: false };

  it('liste les trois réglages', () => {
    expect(A11Y_KEYS).toEqual(['largeText', 'highContrast', 'reduceMotion']);
  });

  it('lit les réglages enregistrés, tout désactivé par défaut', () => {
    expect(readA11y(fakeStorage())).toEqual(OFF);
    expect(readA11y(null)).toEqual(OFF);
    expect(readA11y(fakeStorage({ 'mmh-a11y': 'pas du json' }))).toEqual(OFF);
    expect(readA11y(fakeStorage({ 'mmh-a11y': 'null' }))).toEqual(OFF);
    expect(
      readA11y(
        fakeStorage({
          'mmh-a11y': JSON.stringify({ largeText: true, highContrast: 'oui' }),
        }),
      ),
    ).toEqual({ ...OFF, largeText: true });
    expect(
      readA11y(
        fakeStorage({
          'mmh-a11y': JSON.stringify({ highContrast: true, reduceMotion: true }),
        }),
      ),
    ).toEqual({ largeText: false, highContrast: true, reduceMotion: true });
  });

  it('pose un attribut booléen par réglage actif', () => {
    const root = document.createElement('html');
    applyA11y(root, { largeText: true, highContrast: false, reduceMotion: true });
    expect(root.hasAttribute('data-large-text')).toBe(true);
    expect(root.hasAttribute('data-high-contrast')).toBe(false);
    expect(root.hasAttribute('data-reduce-motion')).toBe(true);
    applyA11y(root, OFF);
    expect(root.getAttributeNames()).toEqual([]);
    applyA11y(root, { largeText: false, highContrast: true, reduceMotion: false });
    expect(root.getAttributeNames()).toEqual(['data-high-contrast']);
  });

  it('enregistre les réglages', () => {
    const storage = fakeStorage();
    const pref = { largeText: true, highContrast: false, reduceMotion: false };
    saveA11y(storage, pref);
    expect(storage.data).toEqual({ 'mmh-a11y': JSON.stringify(pref) });
  });
});
