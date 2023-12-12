import type { EntityId } from './common';

export interface PropertyProbabilityHit {
  readonly property: EntityId;
  readonly probability: number;
}
export type PropertyProbabilityHitList = PropertyProbabilityHit[];
export type PropertyProbabilityHitMap = Map<EntityId, number>;

export class GlobalPropertyRecommendations {
  public readonly propertyProbabilityHitList: PropertyProbabilityHitList;
  public readonly propertyProbabilityHitMap: PropertyProbabilityHitMap;

  constructor(propertyProbabilityHitList: PropertyProbabilityHitList, propertyProbabilityHitMap: PropertyProbabilityHitMap) {
    this.propertyProbabilityHitList = propertyProbabilityHitList;
    this.propertyProbabilityHitMap = propertyProbabilityHitMap;
  }
}
