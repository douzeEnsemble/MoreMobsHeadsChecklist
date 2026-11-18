import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules/', 'coverage/', 'reports/', '.stryker-tmp/', '_site/', 'playwright-report/', 'test-results/'] },
  js.configs.recommended,
  {
    files: ['js/**/*.js'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    // Les fonctions passées à page.evaluate() s'exécutent dans le navigateur.
    files: ['e2e/**/*.js'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    files: ['scripts/**/*.js'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['.github/scripts/**/*.mjs'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['*.config.js'],
    languageOptions: { globals: globals.node },
  },
];
