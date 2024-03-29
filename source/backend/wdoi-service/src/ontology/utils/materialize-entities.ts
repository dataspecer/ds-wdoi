import type { WdClass } from '../entities/wd-class';
import type { WdProperty } from '../entities/wd-property';
import type { EntityId, EntityIdsList } from '../entities/common';

export function materializeEntities<T extends WdClass | WdProperty>(entityIds: EntityIdsList, entityMap: ReadonlyMap<EntityId, T>): T[] {
  const results: T[] = [];
  entityIds.forEach((id) => {
    const cls = entityMap.get(id);
    if (cls != null) {
      results.push(cls);
    }
  });
  return results;
}

export function materializeEntitiesWithContext<T extends WdClass | WdProperty>(
  entityIds: EntityIdsList,
  entityMap: ReadonlyMap<EntityId, T>,
  context: ReadonlySet<EntityId>,
  contextStorage: T[],
): void {
  entityIds.forEach((id) => {
    if (!context.has(id)) {
      const cls = entityMap.get(id);
      if (cls != null) {
        contextStorage.push(cls);
      }
    }
  });
}
