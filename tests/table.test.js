import { describe, expect, it } from 'vitest';
import { createRow } from '../js/table.js';
import { HEADS } from './fixtures.js';

const [bee, blaze, camel, rabbit, zombie] = HEADS;

// Le HTML exact de chaque ligne est figé : un attribut, une classe ou un texte qui change fait échouer le test.
const HTML = {
  bee:
    "<tr data-id=\"bee-angry-bee-head\"><td class=\"col-own\"><input class=\"own\" type=\"checkbox\" id=\"own-bee-angry-bee-head\"></td><td class=\"col-img\"><img class=\"preview\" alt=\"\" src=\"img/heads/bee-angry-bee-head.png\" width=\"32\" height=\"32\" loading=\"lazy\"></td><th class=\"col-name\" scope=\"row\"><label for=\"own-bee-angry-bee-head\"><b class=\"mob\">Bee</b><span class=\"head\">Angry Bee Head</span><span class=\"cond\"><span class=\"ic ic-variant\" aria-hidden=\"true\"></span>énervée, sans nectar</span></label></th><td class=\"col-rate\"><span class=\"sr-only\">Sans Looting : </span><span class=\"tier tier-high\">20&nbsp;%</span> <span class=\"arrow\" aria-hidden=\"true\">→</span> <span class=\"sr-only\">Looting III : </span><span class=\"tier tier-high\">26&nbsp;%</span></td><td class=\"col-where\"><p class=\"place\"><span class=\"ic ic-pin\" aria-hidden=\"true\"></span><span><span class=\"sr-only\">Lieu : </span><span class=\"dim dim-overworld\" title=\"Overworld\"><span class=\"ic ic-overworld\" aria-hidden=\"true\"></span><span class=\"sr-only\">Overworld, </span></span><span class=\"dim dim-end\" title=\"End\"><span class=\"ic ic-end\" aria-hidden=\"true\"></span><span class=\"sr-only\">End, </span></span>Nids naturels : prairies, forêts</span></p><p class=\"mating mating-yes\"><span class=\"ic ic-heart\" aria-hidden=\"true\"></span><span><span class=\"sr-only\">Accouplement : </span>Fleurs</span></p></td></tr>",
  blaze:
    "<tr data-id=\"blaze-blaze-head\"><td class=\"col-own\"><input class=\"own\" type=\"checkbox\" id=\"own-blaze-blaze-head\"></td><td class=\"col-img\"><img class=\"preview\" alt=\"\" src=\"img/heads/blaze-blaze-head.png\" width=\"32\" height=\"32\" loading=\"lazy\"></td><th class=\"col-name\" scope=\"row\"><label for=\"own-blaze-blaze-head\"><b class=\"mob\">Blaze</b><span class=\"head\">Blaze Head</span></label></th><td class=\"col-rate\"><span class=\"sr-only\">Sans Looting : </span><span class=\"tier tier-low\">0,5&nbsp;%</span> <span class=\"arrow\" aria-hidden=\"true\">→</span> <span class=\"sr-only\">Looting III : </span><span class=\"tier tier-low\">0,65&nbsp;%</span></td><td class=\"col-where\"><p class=\"place\"><span class=\"ic ic-pin\" aria-hidden=\"true\"></span><span><span class=\"sr-only\">Lieu : </span><span class=\"dim dim-nether\" title=\"Nether\"><span class=\"ic ic-nether\" aria-hidden=\"true\"></span><span class=\"sr-only\">Nether, </span></span>Forteresses du Nether</span></p></td></tr>",
  camel:
    "<tr data-id=\"camel-camel-head\"><td class=\"col-own\"><input class=\"own\" type=\"checkbox\" id=\"own-camel-camel-head\"></td><td class=\"col-img\"><img class=\"preview\" alt=\"\" src=\"img/heads/camel-camel-head.png\" width=\"32\" height=\"32\" loading=\"lazy\"></td><th class=\"col-name\" scope=\"row\"><label for=\"own-camel-camel-head\"><b class=\"mob\">Camel</b><span class=\"head\">Camel Head</span></label></th><td class=\"col-rate\"><span class=\"tier tier-sure\">100&nbsp;%</span></td><td class=\"col-where\"><p class=\"place\"><span class=\"ic ic-pin\" aria-hidden=\"true\"></span><span><span class=\"sr-only\">Lieu : </span>Villages du désert</span></p><p class=\"mating mating-no\"><span class=\"ic ic-heart-off\" aria-hidden=\"true\"></span><span><span class=\"sr-only\">Accouplement : </span>Stérile</span></p></td></tr>",
  rabbit:
    "<tr data-id=\"rabbit-toast-rabbit-head\"><td class=\"col-own\"><input class=\"own\" type=\"checkbox\" id=\"own-rabbit-toast-rabbit-head\"></td><td class=\"col-img\"><img class=\"preview\" alt=\"\" src=\"img/heads/rabbit-toast-rabbit-head.png\" width=\"32\" height=\"32\" loading=\"lazy\"></td><th class=\"col-name\" scope=\"row\"><label for=\"own-rabbit-toast-rabbit-head\"><b class=\"mob\">Rabbit</b><span class=\"head\">Toast Rabbit Head</span><span class=\"cond\"><span class=\"ic ic-tag\" aria-hidden=\"true\"></span>lapin nommé « Toast »</span></label></th><td class=\"col-rate\"><span class=\"sr-only\">Sans Looting : </span><span class=\"tier tier-mid\">5&nbsp;%</span> <span class=\"arrow\" aria-hidden=\"true\">→</span> <span class=\"sr-only\">Looting III : </span><span class=\"tier tier-mid\">8&nbsp;%</span></td><td class=\"col-where\"><p class=\"place\"><span class=\"ic ic-pin\" aria-hidden=\"true\"></span><span><span class=\"sr-only\">Lieu : </span><span class=\"dim dim-overworld\" title=\"Overworld\"><span class=\"ic ic-overworld\" aria-hidden=\"true\"></span><span class=\"sr-only\">Overworld, </span></span>Déserts, forêts</span></p></td></tr>",
  zombie:
    "<tr data-id=\"zombie\"><td class=\"col-own\"><input class=\"own\" type=\"checkbox\" id=\"own-zombie\"></td><td class=\"col-img\"></td><th class=\"col-name\" scope=\"row\"><label for=\"own-zombie\"><b class=\"mob\">Zombie</b><span class=\"cond\"><span class=\"ic ic-bolt\" aria-hidden=\"true\"></span>creeper chargé</span></label></th><td class=\"col-rate\"><span class=\"na\"><span aria-hidden=\"true\">n/a</span><span class=\"sr-only\">non applicable</span></span></td><td class=\"col-where\"><p class=\"place\"><span class=\"ic ic-pin\" aria-hidden=\"true\"></span><span><span class=\"sr-only\">Lieu : </span><span class=\"dim dim-overworld\" title=\"Overworld\"><span class=\"ic ic-overworld\" aria-hidden=\"true\"></span><span class=\"sr-only\">Overworld, </span></span>Surface la nuit</span></p></td></tr>",
};

describe('createRow', () => {
  it('construit une ligne complète : variante, deux taux, dimensions, accouplement possible', () => {
    expect(createRow(document, bee).outerHTML).toBe(HTML.bee);
  });

  it('construit une ligne sans condition ni accouplement', () => {
    expect(createRow(document, blaze).outerHTML).toBe(HTML.blaze);
  });

  it('construit une ligne à taux unique et à accouplement impossible', () => {
    expect(createRow(document, camel).outerHTML).toBe(HTML.camel);
  });

  it('construit une ligne dont la condition est un nom à donner', () => {
    expect(createRow(document, rabbit).outerHTML).toBe(HTML.rabbit);
  });

  it('construit une ligne sans tête, sans image et sans taux', () => {
    expect(createRow(document, zombie).outerHTML).toBe(HTML.zombie);
  });

  it('associe la case à son étiquette', () => {
    const row = createRow(document, bee);
    const box = row.querySelector('input');
    expect(row.querySelector('label').htmlFor).toBe(box.id);
    expect(box.type).toBe('checkbox');
    expect(row.dataset.id).toBe('bee-angry-bee-head');
  });

  it('demande le chargement différé de l’aperçu', () => {
    const image = createRow(document, bee).querySelector('img');
    expect(image.getAttribute('loading')).toBe('lazy');
  });

  it('choisit l’icône de la condition selon son type', () => {
    const icon = (condition) =>
      createRow(document, { ...bee, condition })
        .querySelector('.cond .ic')
        .className;
    expect(icon({ kind: 'variant', text: 'x' })).toBe('ic ic-variant');
    expect(icon({ kind: 'name', text: 'x' })).toBe('ic ic-tag');
    expect(icon({ kind: 'charged', text: 'x' })).toBe('ic ic-bolt');
    expect(icon({ kind: 'other', text: 'x' })).toBe('ic ic-info');
  });

  it('échappe le texte des données (jamais interprété comme du HTML)', () => {
    const row = createRow(document, {
      ...bee,
      mob: '<img src=x onerror=alert(1)>',
    });
    expect(row.querySelector('.mob').textContent).toBe(
      '<img src=x onerror=alert(1)>',
    );
    expect(row.querySelectorAll('img')).toHaveLength(1);
  });
});
