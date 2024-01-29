import { EntityId } from './wd-entity';

export interface PropertyProbabilityHit {
  readonly property: EntityId;
  readonly probability: number;
}
export type PropertyProbabilityHitList = PropertyProbabilityHit[];
export type PropertyProbabilityHitMap = Map<EntityId, number>;

export interface GlobalPropertyRecommendations {
  readonly propertyProbabilityHitList: PropertyProbabilityHitList;
  readonly propertyProbabilityHitMap: PropertyProbabilityHitMap;
}
