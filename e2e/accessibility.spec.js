import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Chaque test tourne dans les deux projets (thème clair puis sombre du système, A11Y-05).
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function violations(page) {
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  return results.violations;
}

async function ready(page) {
  await page.goto('/');
  await expect(page.getByRole('status')).toContainText('têtes obtenues');
}

test('axe : aucune violation sur la page', async ({ page }) => {
  await ready(page);
  expect(await violations(page)).toEqual([]);
});

test('axe : aucune violation avec le thème forcé clair puis sombre', async ({ page }) => {
  await ready(page);
  await page.getByRole('button', { name: 'Thème : Auto' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(await violations(page)).toEqual([]);
  await page.getByRole('button', { name: 'Thème : Clair' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await violations(page)).toEqual([]);
});

test('axe : aucune violation avec contraste élevé et texte plus grand', async ({ page }) => {
  await ready(page);
  await page.getByRole('button', { name: 'Accessibilité' }).click();
  const dialog = page.getByRole('dialog', { name: 'Accessibilité' });
  await dialog.getByRole('checkbox', { name: /Contraste élevé/ }).check();
  await dialog.getByRole('checkbox', { name: /Texte plus grand/ }).check();
  expect(await violations(page)).toEqual([]);
  await page.keyboard.press('Escape');
  expect(await violations(page)).toEqual([]);
});

test('axe : aucune violation avec la boîte de dialogue ouverte', async ({ page }) => {
  await ready(page);
  await page.getByRole('button', { name: 'Accessibilité' }).click();
  await expect(page.getByRole('dialog', { name: 'Accessibilité' })).toBeVisible();
  expect(await violations(page)).toEqual([]);
});

test('clavier : le lien d’évitement mène au tableau', async ({ page }) => {
  await ready(page);
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Aller au tableau' });
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('region', { name: 'Tableau des têtes' })).toBeInViewport();
});

test('clavier : la boîte de dialogue garde le focus, se ferme avec Échap et le rend', async ({ page }) => {
  // Le reste de la page est inerte : le focus reste dans la boîte ou sort vers le navigateur
  // (document.body), jamais sur un contrôle de la page derrière.
  await ready(page);
  const trigger = page.getByRole('button', { name: 'Accessibilité' });
  await trigger.focus();
  await page.keyboard.press('Enter');

  const dialog = page.getByRole('dialog', { name: 'Accessibilité' });
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 8; i += 1) {
    await page.keyboard.press('Tab');
    expect(
      await dialog.evaluate(
        (node) => node.contains(document.activeElement) || document.activeElement === document.body,
      ),
    ).toBe(true);
  }

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('clavier : le bouton Fermer et un clic sur le fond ferment la boîte', async ({ page }) => {
  await ready(page);
  const trigger = page.getByRole('button', { name: 'Accessibilité' });
  const dialog = page.getByRole('dialog', { name: 'Accessibilité' });
  await trigger.click();
  await dialog.getByRole('button', { name: 'Fermer' }).click();
  await expect(dialog).toBeHidden();
  await trigger.click();
  await page.mouse.click(5, 5);
  await expect(dialog).toBeHidden();
});

test('clavier : tout le filtre se manie sans souris', async ({ page }) => {
  await ready(page);
  const filter = page.getByRole('searchbox', { name: 'Filtrer' });
  await filter.focus();
  await page.keyboard.type('allay');
  await expect(page.getByRole('status')).toContainText('1 affichées');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Effacer le filtre' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(filter).toBeFocused();
  await expect(filter).toHaveValue('');
});

test('noms accessibles : les cases se retrouvent par rôle et nom, et se mémorisent', async ({ page }) => {
  await ready(page);
  const allay = page.getByRole('checkbox', { name: /Allay Head/ });
  await allay.check();
  await expect(page.getByRole('status')).toContainText('1 /');
  await page.reload();
  await expect(page.getByRole('checkbox', { name: /Allay Head/ })).toBeChecked();
});

test('statut : le compteur est une région annoncée, présente dès le chargement', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('status')).toBeAttached();
  await expect(page.getByRole('status')).toContainText('têtes obtenues');
  await page.getByRole('searchbox', { name: 'Filtrer' }).fill('xyz-aucun');
  await expect(page.getByRole('status')).toContainText('0 affichées');
});

test('tri : un clic trie, un second inverse, aria-sort le dit', async ({ page }) => {
  await ready(page);
  const header = page.getByRole('columnheader', { name: /Taux/ });
  await header.getByRole('button').click();
  await expect(header).toHaveAttribute('aria-sort', 'ascending');
  await header.getByRole('button').click();
  await expect(header).toHaveAttribute('aria-sort', 'descending');
  const first = page.locator('#rows tr').first();
  await expect(first.locator('.tier').first()).toContainText('100');
});

test('reflow : aucun défilement horizontal de la page à 320 px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await ready(page);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
  expect(await violations(page)).toEqual([]);
});

test('reflow : texte plus grand à 320 px, la page ne défile toujours pas en horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await ready(page);
  await page.getByRole('button', { name: 'Accessibilité' }).click();
  await page.getByRole('checkbox', { name: /Texte plus grand/ }).check();
  await page.keyboard.press('Escape');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test('cibles : les boutons principaux font au moins 44 px', async ({ page }) => {
  await ready(page);
  for (const name of ['Accessibilité', 'Thème : Auto']) {
    const box = await page.getByRole('button', { name }).boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
  const check = await page.getByRole('checkbox', { name: /Allay Head/ }).boundingBox();
  expect(check.width).toBeGreaterThanOrEqual(24);
  expect(check.height).toBeGreaterThanOrEqual(24);
});

test('mouvement : « réduire les animations » coupe les transitions', async ({ page }) => {
  await ready(page);
  await page.getByRole('button', { name: 'Accessibilité' }).click();
  await page.getByRole('checkbox', { name: /Réduire les animations/ }).check();
  await expect(page.locator('html')).toHaveAttribute('data-reduce-motion', '');
  const duration = await page
    .getByRole('button', { name: 'Thème : Auto' })
    .evaluate((node) => getComputedStyle(node).transitionDuration);
  expect(duration).toBe('0s');
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
});

test('structure : une langue, un titre de page, un seul h1, des repères', async ({ page }) => {
  await ready(page);
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page).toHaveTitle(/More Mob Heads/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('banner')).toHaveCount(1);
  await expect(page.getByRole('main')).toHaveCount(1);
  await expect(page.getByRole('contentinfo')).toHaveCount(1);
});
