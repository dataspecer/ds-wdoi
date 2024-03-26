export type LanguageMap = Record<string, string>;

export type LanguageArrayMap = Record<string, string[]>;

export type EntityId = number;
export type EntityIri = string;
export type EntityIdsList = readonly EntityId[];
export type EntityIriList = readonly EntityIri[];

export type ExternalEntityId = string;
export type ExternalOntologyMapping = readonly ExternalEntityId[];

export type RangeScoreMap = ReadonlyMap<EntityId, number>;
export interface PropertyScoreRecord {
  readonly score: number;
  readonly range: EntityIdsList;
  readonly rangeScoreMap: RangeScoreMap;
}
export type PropertyScoreRecordMap = ReadonlyMap<EntityId, PropertyScoreRecord>;
