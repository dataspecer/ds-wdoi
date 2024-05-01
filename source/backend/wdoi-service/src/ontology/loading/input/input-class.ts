import type { EntityId, EntityIdsList, ExternalOntologyMappings } from '../../entities/common.js';
import type { InputEntity } from './input-entity.js';

export interface InputPropertyRangeScoreRecord {
  class: EntityId;
  score: number;
}
export type InputPropertyRangeScoreRecords = readonly InputPropertyRangeScoreRecord[];

export interface InputPropertyScoreRecord {
  readonly property: EntityId;
  readonly score: number;
  readonly rangeStats: EntityIdsList;
  readonly rangeStatsScores: InputPropertyRangeScoreRecords;
}
export type InputPropertyScoreRecordList = readonly InputPropertyScoreRecord[];

export interface InputClass extends InputEntity {
  readonly subclassOf: EntityIdsList;
  readonly propertiesForThisType: EntityIdsList;
  readonly equivalentClass: ExternalOntologyMappings;
  readonly children: EntityIdsList;
  readonly subjectOf: EntityIdsList;
  readonly valueOf: EntityIdsList;
  readonly subjectOfStats: EntityIdsList;
  readonly subjectOfStatsScores: InputPropertyScoreRecordList;
  readonly valueOfStats: EntityIdsList;
  readonly valueOfStatsScores: InputPropertyScoreRecordList;
  readonly instances: EntityIdsList;
}
