// Termes séparés par une virgule ou un point-virgule, en minuscules, sans blancs ni termes vides.
export function parseTerms(query) {
  return query
    .toLowerCase()
    .split(/[,;]/)
    .map((term) => term.trim())
    .filter((term) => term !== '');
}

// Texte où chercher : mob, tête, condition, lieu (join écrit les valeurs absentes comme du vide).
function haystack(head) {
  return [head.mob, head.head, head.condition?.text, head.places.text]
    .join(' ')
    .toLowerCase();
}

// Sans terme, tout correspond. « Nom exact » compare au nom du mob ou de la tête entiers.
export function matches(head, terms, exact) {
  if (terms.length === 0) return true;
  if (exact) {
    const names = [head.mob.toLowerCase(), head.head?.toLowerCase()];
    return terms.some((term) => names.includes(term));
  }
  const text = haystack(head);
  return terms.some((term) => text.includes(term));
}

export function viewAllows(view, owned) {
  if (view === 'owned') return owned;
  if (view === 'missing') return !owned;
  return true;
}
