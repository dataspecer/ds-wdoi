import axios from 'axios';
import { EntityId, EntityIdsList } from '../entities/wd-entity';

export interface FilterPropertyRecord {
  readonly propertyId: EntityId;
  readonly rangeIds: EntityId[];
}

export interface GetFilterByInstanceResults {
  readonly instanceOfIds: EntityIdsList;
  readonly subjectOfFilterRecords: FilterPropertyRecord[];
  readonly valueOfFilterRecords: FilterPropertyRecord[];
}

export interface GetFilterByInstanceReply {
  results: GetFilterByInstanceResults;
}

export async function fetchFilterByInstance(url: string): Promise<GetFilterByInstanceResults> {
  return (
    (await axios.get(`/api/v3/filter-by-instance?url=${url}`)).data as GetFilterByInstanceReply
  ).results;
}
