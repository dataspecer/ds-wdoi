import axios from 'axios';
import { WdClass, WdClassDocsOnly } from '../entities/wd-class';
import { EntityId, EntityIdsList } from '../entities/wd-entity';
import { WdProperty } from '../entities/wd-property';
import { buildEntityMap } from '../../editor/utils/build-entity-map';

interface GetSurroundingsReplyResults {
  startClass: EntityId;
  parents: EntityIdsList;
  propertyEndpoints: EntityIdsList;
  subjectOf: EntityIdsList;
  valueOf: EntityIdsList;
  classes: WdClass[];
  properties: WdProperty[];
}

interface GetSurroundingsReply {
  results: GetSurroundingsReplyResults;
}

export interface ClassSurroundings {
  startClassId: EntityId;
  parentsIds: EntityIdsList;
  propertyEndpointsIds: EntityIdsList;
  subjectOfIds: EntityIdsList;
  valueOfIds: EntityIdsList;
  properties: WdProperty[];
  classesMap: ReadonlyMap<EntityId, WdClass>;
  propertiesMap: ReadonlyMap<EntityId, WdProperty>;
}

export async function fetchClassSurroundings(cls: WdClassDocsOnly): Promise<ClassSurroundings> {
  const reply = (await axios.get(`/api/v2/classes/${cls.id}/surroundings`))
    .data as GetSurroundingsReply;
  const classesMap = buildEntityMap(reply.results.classes);
  const propertyMap = buildEntityMap(reply.results.properties);
  return {
    startClassId: reply.results.startClass,
    parentsIds: reply.results.parents,
    propertyEndpointsIds: reply.results.propertyEndpoints,
    subjectOfIds: reply.results.subjectOf,
    valueOfIds: reply.results.valueOf,
    properties: reply.results.properties,
    classesMap: classesMap,
    propertiesMap: propertyMap,
  };
}
