import { formatPercent, tier } from './format.js';

const CONDITION_ICONS = {
  variant: 'variant',
  name: 'tag',
  charged: 'bolt',
  other: 'info',
};

const DIMENSION_LABELS = {
  overworld: 'Overworld',
  nether: 'Nether',
  end: 'End',
};

// Élément avec classe (facultative) et enfants (textes ou nœuds) ; les textes passent par
// textContent, jamais par innerHTML (SEC-05).
function el(doc, tag, className, ...children) {
  const node = doc.createElement(tag);
  if (className) node.className = className;
  node.append(...children);
  return node;
}

// Icône décorative : le sens est toujours porté par un texte voisin (A11Y-04).
function icon(doc, name) {
  const node = el(doc, 'span', `ic ic-${name}`);
  node.setAttribute('aria-hidden', 'true');
  return node;
}

// Texte réservé aux lecteurs d'écran.
function hiddenText(doc, text) {
  return el(doc, 'span', 'sr-only', text);
}

function rateValue(doc, fraction) {
  return el(doc, 'span', `tier tier-${tier(fraction)}`, formatPercent(fraction));
}

function rateCell(doc, rate) {
  const cell = el(doc, 'td', 'col-rate');
  if (!rate) {
    const unavailable = el(doc, 'span', 'na', el(doc, 'span', '', 'n/a'));
    unavailable.firstChild.setAttribute('aria-hidden', 'true');
    unavailable.append(hiddenText(doc, 'non applicable'));
    cell.append(unavailable);
  } else if (rate.looting === undefined) {
    cell.append(rateValue(doc, rate.base));
  } else {
    const arrow = el(doc, 'span', 'arrow', '→');
    arrow.setAttribute('aria-hidden', 'true');
    cell.append(
      hiddenText(doc, 'Sans Looting : '),
      rateValue(doc, rate.base),
      ' ',
      arrow,
      ' ',
      hiddenText(doc, 'Looting III : '),
      rateValue(doc, rate.looting),
    );
  }
  return cell;
}

function nameCell(doc, head) {
  const label = el(doc, 'label', '', el(doc, 'b', 'mob', head.mob));
  label.htmlFor = `own-${head.id}`;
  if (head.head) label.append(el(doc, 'span', 'head', head.head));
  if (head.condition) {
    label.append(
      el(
        doc,
        'span',
        'cond',
        icon(doc, CONDITION_ICONS[head.condition.kind]),
        head.condition.text,
      ),
    );
  }
  const cell = el(doc, 'th', 'col-name', label);
  cell.scope = 'row';
  return cell;
}

function dimension(doc, name) {
  const node = el(
    doc,
    'span',
    `dim dim-${name}`,
    icon(doc, name),
    hiddenText(doc, `${DIMENSION_LABELS[name]}, `),
  );
  node.title = DIMENSION_LABELS[name];
  return node;
}

function whereCell(doc, head) {
  const place = el(
    doc,
    'p',
    'place',
    icon(doc, 'pin'),
    el(
      doc,
      'span',
      '',
      hiddenText(doc, 'Lieu : '),
      ...head.places.dimensions.map((name) => dimension(doc, name)),
      head.places.text,
    ),
  );
  const cell = el(doc, 'td', 'col-where', place);
  if (head.mating) {
    cell.append(
      el(
        doc,
        'p',
        `mating ${head.mating.possible ? 'mating-yes' : 'mating-no'}`,
        icon(doc, head.mating.possible ? 'heart' : 'heart-off'),
        el(doc, 'span', '', hiddenText(doc, 'Accouplement : '), head.mating.text),
      ),
    );
  }
  return cell;
}

// Une ligne par tête : case « obtenue », aperçu, nom (étiquette de la case), taux, lieu.
export function createRow(doc, head) {
  const checkbox = el(doc, 'input', 'own');
  checkbox.type = 'checkbox';
  checkbox.id = `own-${head.id}`;

  const preview = el(doc, 'td', 'col-img');
  if (head.image) {
    const image = el(doc, 'img', 'preview');
    image.alt = '';
    image.src = head.image;
    image.width = 32;
    image.height = 32;
    image.setAttribute('loading', 'lazy');
    preview.append(image);
  }

  const row = el(
    doc,
    'tr',
    '',
    el(doc, 'td', 'col-own', checkbox),
    preview,
    nameCell(doc, head),
    rateCell(doc, head.rate),
    whereCell(doc, head),
  );
  row.dataset.id = head.id;
  return row;
}
