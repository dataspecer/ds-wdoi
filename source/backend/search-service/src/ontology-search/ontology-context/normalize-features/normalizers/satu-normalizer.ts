import type { EntityId } from '../../entities/common.js';
import type { WdEntity } from '../../entities/wd-entity.js';

export function normalizeFeatureSatu<T extends WdEntity>(
  pivot: number,
  getFeature: (entity: T) => number,
  storeFeature: (entity: T, value: number) => void,
  entities: ReadonlyMap<EntityId, T>,
): void {
  for (const entity of entities.values()) {
    let value = getFeature(entity);
    value = value / (value + pivot);
    storeFeature(entity, value);
  }
}
