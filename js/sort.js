// Valeur de tri d'une entrée { head, owned } selon la colonne (localeCompare ignore la casse
// aux premiers niveaux : inutile de passer en minuscules).
function value({ head, owned }, key) {
  if (key === 'owned') return owned ? 1 : 0;
  if (key === 'rate') return head.rate ? head.rate.base : -1;
  if (key === 'where') return head.places.text;
  return [head.mob, head.head].join(' ');
}

function compareValues(a, b) {
  return typeof a === 'number' ? a - b : a.localeCompare(b, 'fr');
}

// Nouveau tableau trié ; à égalité l'ordre d'origine est conservé (tri stable), dans les deux sens.
export function sortEntries(entries, key, ascending) {
  const sign = ascending ? 1 : -1;
  return [...entries].sort(
    (x, y) => sign * compareValues(value(x, key), value(y, key)),
  );
}

// Un second clic sur la colonne triée inverse le sens.
export function nextAscending(ariaSort) {
  return ariaSort !== 'ascending';
}
