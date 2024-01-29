import { WdEntityDocsOnly, EntityId } from '../../wikidata/entities/wd-entity';

export function buildEntityMap<T extends WdEntityDocsOnly>(docsList: T[]): Map<EntityId, T> {
  const retMap = new Map<EntityId, T>();
  docsList.forEach((doc) => {
    if (!(doc.id in retMap)) {
      retMap.set(doc.id, doc);
    }
  });
  return retMap;
}
