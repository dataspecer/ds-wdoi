import { readFileSync } from 'fs';
import type { EntityId } from '../entities/common';
import { GlobalPropertyRecommendations, type PropertyProbabilityHitList, type PropertyProbabilityHitMap } from '../entities/recommendations';

export function createPropertyProbabilityHitMap(probList: PropertyProbabilityHitList): PropertyProbabilityHitMap {
  const probHitMap = new Map<EntityId, number>();
  for (const propHit of probList) {
    if (!probHitMap.has(propHit.property)) {
      probHitMap.set(propHit.property, propHit.probability);
    }
  }
  return probHitMap;
}

export function loadGlobalPropertyRecommendations(globalRecsPath: string): GlobalPropertyRecommendations {
  const probData = readFileSync(globalRecsPath, 'utf-8');
  const propList = JSON.parse(probData) as PropertyProbabilityHitList;
  const propMap = createPropertyProbabilityHitMap(propList);
  return new GlobalPropertyRecommendations(propList, propMap);
}
