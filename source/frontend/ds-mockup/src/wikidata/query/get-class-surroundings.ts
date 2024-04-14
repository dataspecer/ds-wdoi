import axios from 'axios';
import { WdClassDescOnly, WdClassHierarchySurroundingsDescOnly } from '../entities/wd-class';
import { EntityId, EntityIdsList } from '../entities/wd-entity';
import { WdPropertyDescOnly } from '../entities/wd-property';
import { buildEntityMap } from '../utils/build-entity-map';

interface GetSurroundingsReplyResults {
  startClassId: EntityId;
  parentsIds: EntityIdsList;
  subjectOfIds: EntityIdsList;
  valueOfIds: EntityIdsList;
  classes: WdClassHierarchySurroundingsDescOnly[];
  properties: WdPropertyDescOnly[];
}

interface GetSurroundingsReply {
  results: GetSurroundingsReplyResults;
}

export interface ClassSurroundings {
  startClassId: EntityId;
  parentsIds: EntityIdsList;
  subjectOfIds: EntityIdsList;
  valueOfIds: EntityIdsList;
  classesMap: ReadonlyMap<EntityId, WdClassHierarchySurroundingsDescOnly>;
  propertiesMap: ReadonlyMap<EntityId, WdPropertyDescOnly>;
}

export async function fetchClassSurroundings(cls: WdClassDescOnly): Promise<ClassSurroundings> {
  const reply = (await axios.get(`/api/v3/classes/${cls.id}/surroundings`))
    .data as GetSurroundingsReply;
  const classesMap = buildEntityMap(reply.results.classes);
  const propertyMap = buildEntityMap(reply.results.properties);
  return {
    startClassId: reply.results.startClassId,
    parentsIds: reply.results.parentsIds,
    subjectOfIds: reply.results.subjectOfIds,
    valueOfIds: reply.results.valueOfIds,
    classesMap: classesMap,
    propertiesMap: propertyMap,
  };
}
