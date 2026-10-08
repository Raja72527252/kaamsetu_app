import { storage } from '../utils/storage';

type SavedKind = 'jobs' | 'workers';
type SavedCollections = Partial<Record<SavedKind, string[]>>;

function storageKey(userId: string) {
  return `kaamsetu_saved_items_${userId}`;
}

export async function getSavedIds(userId: string, kind: SavedKind): Promise<string[]> {
  const raw = await storage.getItem(storageKey(userId));
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Saved items have an invalid format.');
  }
  const saved = (parsed as SavedCollections)[kind] ?? [];
  if (!Array.isArray(saved) || !saved.every((id) => typeof id === 'string')) {
    throw new Error('Saved item identifiers have an invalid format.');
  }
  return saved;
}

export async function toggleSavedItem(
  userId: string,
  kind: SavedKind,
  itemId: string
): Promise<boolean> {
  const key = storageKey(userId);
  const raw = await storage.getItem(key);
  let collections: SavedCollections = {};
  if (raw) {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Saved items have an invalid format.');
    }
    collections = parsed as SavedCollections;
  }

  const current = collections[kind] ?? [];
  const isSaved = current.includes(itemId);
  collections[kind] = isSaved
    ? current.filter((id) => id !== itemId)
    : [itemId, ...current];
  await storage.setItem(key, JSON.stringify(collections));
  return !isSaved;
}
