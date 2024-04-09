import { WdEntityDescOnly, EntityId } from '../entities/wd-entity';

export function buildEntityMap<T extends WdEntityDescOnly>(docsList: T[]): Map<EntityId, T> {
  const newMap = new Map<EntityId, T>();
  docsList.forEach((doc) => {
    if (!newMap.has(doc.id)) {
      newMap.set(doc.id, doc);
    }
  });
  return newMap;
}
