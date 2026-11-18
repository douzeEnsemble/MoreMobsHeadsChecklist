export async function loadData(fetchFn) {
  const response = await fetchFn('data/heads.json');
  if (!response.ok) throw new Error(`Chargement impossible (${response.status})`);
  return response.json();
}
