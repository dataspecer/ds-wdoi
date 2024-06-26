import type {
  EntityId,
  PropertyScoreRecord,
  PropertyScoreRecordMap,
  RangeScoreMap,
} from '../entities/common.js';
import {
  emptyEntitiesIdsListOrSave,
  emptyRangeScoreMapOrSave,
} from '../entities/wd-property-empty-type-constants.js';
import {
  type InputPropertyRangeScoreRecords,
  type InputPropertyScoreRecordList,
} from './input/input-class.js';

export function createPropertyScoreRecordMap(
  propertyScoreRecordList: InputPropertyScoreRecordList,
): PropertyScoreRecordMap {
  const propScoreRecordMap = new Map<EntityId, PropertyScoreRecord>();
  for (const propScoreRecord of propertyScoreRecordList) {
    if (!propScoreRecordMap.has(propScoreRecord.property)) {
      propScoreRecordMap.set(propScoreRecord.property, {
        score: propScoreRecord.score,
        range: emptyEntitiesIdsListOrSave(propScoreRecord.rangeStats),
        rangeScoreMap: emptyRangeScoreMapOrSave(
          createRangeScoreMap(propScoreRecord.rangeStatsScores),
        ),
      });
    }
  }
  return propScoreRecordMap;
}

function createRangeScoreMap(rangeScoreList: InputPropertyRangeScoreRecords): RangeScoreMap {
  const rangeScoreMap = new Map<EntityId, number>();
  for (const rangeScore of rangeScoreList) {
    if (!rangeScoreMap.has(rangeScore.class)) {
      rangeScoreMap.set(rangeScore.class, rangeScore.score);
    }
  }
  return rangeScoreMap;
}
