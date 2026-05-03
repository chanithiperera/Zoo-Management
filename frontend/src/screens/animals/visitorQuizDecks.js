import { resolveUploadsFileUri } from '../../api/getApiBaseUrl';

export const DEFAULT_QUIZ_COVER =
  'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?q=80&w=800&auto=format&fit=crop';

function resolveAnimalCover(animal) {
  if (!animal?.imageUrl) return null;
  const u = String(animal.imageUrl).trim();
  if (!u) return null;
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  return resolveUploadsFileUri(u) || null;
}

/** Group API quiz rows into one playable deck per animal (Education hub + My Quizzes). */
export function buildVisitorQuizDecks(rows) {
  const map = new Map();
  for (const row of rows || []) {
    const animal = row.animal;
    const aid = animal?._id ?? row.animal;
    if (!aid) continue;
    const id = String(aid);
    if (!map.has(id)) map.set(id, { animalId: id, animal, items: [] });
    map.get(id).items.push(row);
  }
  return [...map.values()].map(({ animalId, animal, items }) => {
    const cover = resolveAnimalCover(animal);
    return {
      animalId,
      title: `${animal?.name || 'Animal'} quiz`,
      subtitle: `${items.length} question${items.length !== 1 ? 's' : ''}`,
      imageUri: cover || DEFAULT_QUIZ_COVER,
    };
  });
}
