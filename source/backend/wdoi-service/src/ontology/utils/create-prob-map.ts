import type { EntityId, PropertyProbabilityHitList } from '../entities/common';

export function createProbMap(probList: PropertyProbabilityHitList): Map<EntityId, number> {
  const probHitMap = new Map<EntityId, number>();
  for (const propHit of probList) {
    if (!(propHit.property in probHitMap)) {
      probHitMap.set(propHit.property, propHit.probability);
    }
  }
  return probHitMap;
}
