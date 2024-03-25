import type {
  EntityIdsList,
  LanguageArrayMap,
  ExternalOntologyMapping,
  EntityId,
  PropertyScoreRecord,
  PropertyScoreRecordMap,
  RangeStatsScoreMap,
  LanguageMap,
} from './common';
import { type StatementAllowanceMap } from './constraint';

export const EMPTY_ENTITY_IDS_LIST: EntityIdsList = [];
export const EMPTY_LANGUAGE_ARRAY_MAP: LanguageArrayMap = {};
export const EMPTY_LANGUAGE_MAP: LanguageMap = {};
export const EMPTY_EXTERNAL_ONTOLOGY_MAPPING: ExternalOntologyMapping = [];

export const EMPTY_RANGE_STATS_SCORE_MAP: RangeStatsScoreMap = new Map<EntityId, number>();
export const EMPTY_PROPERTY_SCORE_RECORD_MAP: PropertyScoreRecordMap = new Map<EntityId, PropertyScoreRecord>();

// Class

export function emptyEntitiesIdsListOrSave(l: EntityIdsList): EntityIdsList {
  if (l.length !== 0) return l;
  else return EMPTY_ENTITY_IDS_LIST;
}

export function emptyExternalMappingsListOrSave(l: ExternalOntologyMapping): ExternalOntologyMapping {
  if (l.length !== 0) return l;
  else return EMPTY_EXTERNAL_ONTOLOGY_MAPPING;
}

export function emptyLanguageArrayMapOrSave(m: LanguageArrayMap): LanguageArrayMap {
  if (Object.keys(m).length !== 0) return m;
  else return EMPTY_LANGUAGE_ARRAY_MAP;
}

export function emptyLanguageMapOrSave(m: LanguageMap): LanguageMap {
  if (Object.keys(m).length !== 0) return m;
  else return EMPTY_LANGUAGE_MAP;
}

export function emptyRangeStatsScoreMapOrSave(m: RangeStatsScoreMap): RangeStatsScoreMap {
  if (m.size !== 0) return m;
  else return EMPTY_RANGE_STATS_SCORE_MAP;
}

export function emptyPropertyScoreRecordMapOrSave(m: PropertyScoreRecordMap): PropertyScoreRecordMap {
  if (m.size !== 0) return m;
  else return EMPTY_PROPERTY_SCORE_RECORD_MAP;
}

// Property

export const EMPTY_STATEMENT_ALLOWANCE_MAP: StatementAllowanceMap = {};

export function emptyAllowanceMapOrSave(m: StatementAllowanceMap): StatementAllowanceMap {
  if (Object.keys(m).length !== 0) return m;
  else return EMPTY_STATEMENT_ALLOWANCE_MAP;
}
