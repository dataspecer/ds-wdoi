import type {
  EntityIdsList,
  LanguageArrayMap,
  ExternalOntologyMappings,
  EntityId,
  PropertyScoreRecord,
  PropertyScoreRecordMap,
  RangeScoreMap,
  LanguageMap,
} from './common.js';
import { type StatementAllowanceMap } from './wd-property-constraint.js';

export const EMPTY_ENTITY_IDS_LIST: EntityIdsList = [];
export const EMPTY_LANGUAGE_ARRAY_MAP: LanguageArrayMap = {};
export const EMPTY_LANGUAGE_MAP: LanguageMap = {};
export const EMPTY_EXTERNAL_ONTOLOGY_MAPPINGS: ExternalOntologyMappings = [];

export const EMPTY_RANGE_SCORE_MAP: RangeScoreMap = new Map<EntityId, number>();
export const EMPTY_PROPERTY_SCORE_RECORD_MAP: PropertyScoreRecordMap = new Map<EntityId, PropertyScoreRecord>();

// Class

export function emptyEntitiesIdsListOrSave(l: EntityIdsList): EntityIdsList {
  if (l.length !== 0) return l;
  else return EMPTY_ENTITY_IDS_LIST;
}

export function emptyExternalMappingsListOrSave(l: ExternalOntologyMappings): ExternalOntologyMappings {
  if (l.length !== 0) return l;
  else return EMPTY_EXTERNAL_ONTOLOGY_MAPPINGS;
}

export function emptyLanguageArrayMapOrSave(m: LanguageArrayMap): LanguageArrayMap {
  if (Object.keys(m).length !== 0) return m;
  else return EMPTY_LANGUAGE_ARRAY_MAP;
}

export function emptyLanguageMapOrSave(m: LanguageMap): LanguageMap {
  if (Object.keys(m).length !== 0) return m;
  else return EMPTY_LANGUAGE_MAP;
}

export function emptyRangeScoreMapOrSave(m: RangeScoreMap): RangeScoreMap {
  if (m.size !== 0) return m;
  else return EMPTY_RANGE_SCORE_MAP;
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
