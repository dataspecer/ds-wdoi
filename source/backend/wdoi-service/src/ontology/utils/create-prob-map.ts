import type { EntityId, PropertyProbabilityHitList, PropertyProbabilityHitMap } from '../entities/common';

export function createProbMap(probList: PropertyProbabilityHitList): PropertyProbabilityHitMap {
  const probHitMap = new Map<EntityId, number>();
  for (const propHit of probList) {
    if (!(propHit.property in probHitMap)) {
      probHitMap.set(propHit.property, propHit.probability);
    }
  }
  return probHitMap;
}
