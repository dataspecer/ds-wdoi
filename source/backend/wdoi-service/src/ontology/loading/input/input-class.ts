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

// Contains all the contents from the preprocessing phase.
// There is no need to store them all, just extract what is needed.
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

  readonly instanceCount: number;
  readonly sitelinksCount: number;
  readonly inlinksCount: number;
  readonly instanceInlinksCount: number;
  readonly statementCount: number;
  readonly instanceStatementCount: number;

  readonly hasEffect: EntityIdsList;
  readonly hasCause: EntityIdsList;
  readonly hasCharacteristics: EntityIdsList;
  readonly hasParts: EntityIdsList;
  readonly partOf: EntityIdsList;
  readonly hasUse: EntityIdsList;
}
