import axios from 'axios';
import { buildEntityMap } from '../../editor/utils/build-entity-map';
import { WdClass, WdClassDocsOnly } from '../entities/wd-class';
import { EntityId } from '../entities/wd-entity';
import { WdProperty, WdPropertyDocsOnly } from '../entities/wd-property';

// Get Class

interface GetClassWithSurroundingNamesReplyResults {
  classes: WdClass[];
  surroundingClassNames: WdClassDocsOnly[];
  surroundingPropertyNames: WdPropertyDocsOnly[];
}

interface GetClassWithSurroundingNamesReply {
  results: GetClassWithSurroundingNamesReplyResults;
}

export interface ClassWithSurroundingDocs {
  entity: WdClass;
  classesDocsMap: Map<EntityId, WdClassDocsOnly>;
  propertyDocsMap: Map<EntityId, WdPropertyDocsOnly>;
}

export async function fetchClassWithSurroundingsDocs(
  cls: WdClassDocsOnly,
): Promise<ClassWithSurroundingDocs> {
  const reply = (await axios.get(`/api/v2/classes/${cls.id}`))
    .data as GetClassWithSurroundingNamesReply;
  const classesDocsMap = buildEntityMap(reply.results.surroundingClassNames);
  const propertyDocsMap = buildEntityMap(reply.results.surroundingPropertyNames);
  return { entity: reply.results.classes[0], classesDocsMap, propertyDocsMap };
}

// Get Property

interface GetPropertyWithSurroundingNamesReplyResults {
  properties: WdProperty[];
  surroundingClassNames: WdClassDocsOnly[];
  surroundingPropertyNames: WdPropertyDocsOnly[];
}

interface GetPropertyWithSurroundingNamesReply {
  results: GetPropertyWithSurroundingNamesReplyResults;
}

export interface PropertyWithSurroundingDocs {
  entity: WdProperty;
  classesDocsMap: Map<EntityId, WdClassDocsOnly>;
  propertyDocsMap: Map<EntityId, WdPropertyDocsOnly>;
}

export async function fetchPropertyWithSurroundingsNames(
  property: WdPropertyDocsOnly,
): Promise<PropertyWithSurroundingDocs> {
  const reply = (await axios.get(`/api/v2/properties/${property.id}`))
    .data as GetPropertyWithSurroundingNamesReply;
  const classesDocsMap = buildEntityMap(reply.results.surroundingClassNames);
  const propertyDocsMap = buildEntityMap(reply.results.surroundingPropertyNames);
  return { entity: reply.results.properties[0], classesDocsMap, propertyDocsMap };
}
