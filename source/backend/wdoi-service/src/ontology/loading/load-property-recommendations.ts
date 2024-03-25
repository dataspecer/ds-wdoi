import type { EntityId, PropertyScoreRecord, PropertyScoreRecordMap, RangeStatsScoreMap } from '../entities/common';
import { emptyEntitiesIdsListOrSave, emptyRangeStatsScoreMapOrSave } from '../entities/empty-type-constants';
import { type InputPropertyRangeScoreRecords, type InputPropertyScoreRecordList } from './input/input-class';

export function createPropertyScoreRecordMap(propertyScoreRecordList: InputPropertyScoreRecordList): PropertyScoreRecordMap {
  const propScoreRecordMap = new Map<EntityId, PropertyScoreRecord>();
  for (const propScoreRecord of propertyScoreRecordList) {
    if (!propScoreRecordMap.has(propScoreRecord.property)) {
      propScoreRecordMap.set(propScoreRecord.property, {
        score: propScoreRecord.score,
        rangeStats: emptyEntitiesIdsListOrSave(propScoreRecord.rangeStats),
        rangeStatsScoreMap: emptyRangeStatsScoreMapOrSave(createRangeStatsScoreMap(propScoreRecord.rangeStatsScores)),
      });
    }
  }
  return propScoreRecordMap;
}

function createRangeStatsScoreMap(rangeScoreList: InputPropertyRangeScoreRecords): RangeStatsScoreMap {
  const rangeStatsScoreMap = new Map<EntityId, number>();
  for (const rangeScore of rangeScoreList) {
    if (!rangeStatsScoreMap.has(rangeScore.class)) {
      rangeStatsScoreMap.set(rangeScore.class, rangeScore.score);
    }
  }
  return rangeStatsScoreMap;
}
