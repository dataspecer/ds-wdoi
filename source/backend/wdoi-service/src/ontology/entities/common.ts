export type LanguageMap = Record<string, string>;

export type LanugageArrayMap = Record<string, string[]>;

export type EntityId = number;
export type EntityIri = string;
export type EntityIdsList = readonly EntityId[];
export type EntityIriList = readonly EntityIri[];

export type ExternalEntityId = string;
export type ExternalOntologyMapping = readonly ExternalEntityId[];

export interface PropertyProbabilityHit {
  readonly property: EntityId;
  readonly probability: number;
}
export type PropertyProbabilityHitList = PropertyProbabilityHit[];
