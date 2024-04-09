import axios from 'axios';
import { EntityId, EntityIdsList } from '../entities/wd-entity';

interface FilterPropertyRecordResults {
  readonly propertyId: EntityId;
  readonly rangeIds: EntityIdsList;
}

interface GetFilterByInstanceResults {
  readonly instanceOfIds: EntityIdsList;
  readonly subjectOfFilterRecords: FilterPropertyRecordResults[];
  readonly valueOfFilterRecords: FilterPropertyRecordResults[];
}

interface GetFilterByInstanceReply {
  results: GetFilterByInstanceResults;
}

export interface FilterByInstance {
  readonly instanceOfIds: EntityIdsList;
  readonly subjectOfFilterRecordsMap: ReadonlyMap<EntityId, EntityIdsList>;
  readonly valueOfFilterRecordsMap: ReadonlyMap<EntityId, EntityIdsList>;
}

function buildFilterPropertyRecordsMap(
  filterByInstaceRecords: FilterPropertyRecordResults[],
): ReadonlyMap<EntityId, EntityIdsList> {
  const newMap = new Map<EntityId, EntityIdsList>();
  filterByInstaceRecords.forEach((record) => {
    if (!newMap.has(record.propertyId)) {
      newMap.set(record.propertyId, record.rangeIds);
    }
  });
  return newMap;
}

export async function fetchFilterByInstance(url: string): Promise<FilterByInstance> {
  const results = (
    (await axios.get(`/api/v3/filter-by-instance?url=${url}`)).data as GetFilterByInstanceReply
  ).results;
  return {
    instanceOfIds: results.instanceOfIds,
    subjectOfFilterRecordsMap: buildFilterPropertyRecordsMap(results.subjectOfFilterRecords),
    valueOfFilterRecordsMap: buildFilterPropertyRecordsMap(results.subjectOfFilterRecords),
  };
}
