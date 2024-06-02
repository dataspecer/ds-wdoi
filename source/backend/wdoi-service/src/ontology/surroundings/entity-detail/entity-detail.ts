import { type EntityIdsList, type EntityId } from '../../entities/common.js';
import { type WdClass } from '../../entities/wd-class.js';
import type { WdEntity } from '../../entities/wd-entity.js';
import { type WdProperty } from '../../entities/wd-property.js';

export class EntityDetail {
  protected readonly contextClasses: ReadonlyMap<EntityId, WdClass>;
  protected readonly contextProperties: ReadonlyMap<EntityId, WdProperty>;

  protected collectToDoubleContext<T extends WdEntity>(
    entityIds: EntityIdsList,
    entityMap: ReadonlyMap<EntityId, T>,
    contextEntity: Set<EntityId>,
    contextEntityStorage: T[],
    contextId: Set<EntityId>,
    contextIdStorage: EntityId[],
  ): void {
    entityIds.forEach((id) => {
      const entity = entityMap.get(id);
      if (entity != null) {
        if (!contextEntity.has(id)) {
          contextEntityStorage.push(entity);
          contextEntity.add(id);
        }
        if (!contextId.has(id)) {
          contextIdStorage.push(id);
          contextId.add(id);
        }
      }
    });
  }

  protected collectToContext<T extends WdEntity>(
    entityIds: EntityIdsList,
    entityMap: ReadonlyMap<EntityId, T>,
    context: Set<EntityId>,
    contextStorage: T[],
  ): void {
    entityIds.forEach((id) => {
      if (!context.has(id)) {
        const cls = entityMap.get(id);
        if (cls != null) {
          contextStorage.push(cls);
          context.add(id);
        }
      }
    });
  }

  constructor(
    contextClasses: ReadonlyMap<EntityId, WdClass>,
    contextProperties: ReadonlyMap<EntityId, WdProperty>,
  ) {
    this.contextClasses = contextClasses;
    this.contextProperties = contextProperties;
  }
}
