import axios from 'axios';
import { buildEntityMap } from '../../editor/utils/build-entity-map';
import { WdClass, WdClassDescOnly } from '../entities/wd-class';
import { EntityId } from '../entities/wd-entity';
import { WdProperty, WdPropertyDescOnly } from '../entities/wd-property';

// Get Class

interface GetClassWithSurroundingNamesReplyResults {
  classes: WdClass[];
  surroundingClassNames: WdClassDescOnly[];
  surroundingPropertyNames: WdPropertyDescOnly[];
}

interface GetClassWithSurroundingNamesReply {
  results: GetClassWithSurroundingNamesReplyResults;
}

export interface ClassWithSurroundingDocs {
  entity: WdClass;
  classesDocsMap: Map<EntityId, WdClassDescOnly>;
  propertyDocsMap: Map<EntityId, WdPropertyDescOnly>;
}

export async function fetchClassWithSurroundingsDocs(
  cls: WdClassDescOnly,
): Promise<ClassWithSurroundingDocs> {
  const reply = (await axios.get(`/api/v3/classes/${cls.id}`))
    .data as GetClassWithSurroundingNamesReply;
  const classesDocsMap = buildEntityMap(reply.results.surroundingClassNames);
  const propertyDocsMap = buildEntityMap(reply.results.surroundingPropertyNames);
  return { entity: reply.results.classes[0], classesDocsMap, propertyDocsMap };
}

// Get Property

interface GetPropertyWithSurroundingNamesReplyResults {
  properties: WdProperty[];
  surroundingClassNames: WdClassDescOnly[];
  surroundingPropertyNames: WdPropertyDescOnly[];
}

interface GetPropertyWithSurroundingNamesReply {
  results: GetPropertyWithSurroundingNamesReplyResults;
}

export interface PropertyWithSurroundingDocs {
  entity: WdProperty;
  classesDocsMap: Map<EntityId, WdClassDescOnly>;
  propertyDocsMap: Map<EntityId, WdPropertyDescOnly>;
}

export async function fetchPropertyWithSurroundingsNames(
  property: WdPropertyDescOnly,
): Promise<PropertyWithSurroundingDocs> {
  const reply = (await axios.get(`/api/v3/properties/${property.id}`))
    .data as GetPropertyWithSurroundingNamesReply;
  const classesDocsMap = buildEntityMap(reply.results.surroundingClassNames);
  const propertyDocsMap = buildEntityMap(reply.results.surroundingPropertyNames);
  return { entity: reply.results.properties[0], classesDocsMap, propertyDocsMap };
}
