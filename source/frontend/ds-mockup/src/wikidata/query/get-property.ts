import axios from 'axios';
import { WdClassDescOnly } from '../entities/wd-class';
import { EntityId } from '../entities/wd-entity';
import { WdProperty, WdPropertyDescOnly } from '../entities/wd-property';
import { buildEntityMap } from '../utils/build-entity-map';

interface GetPropertyWithSurroundingNamesReplyResults {
  properties: WdProperty[];
  surroundingClassesDecs: WdClassDescOnly[];
  surroundingPropertiesDecs: WdPropertyDescOnly[];
}

interface GetPropertyWithSurroundingNamesReply {
  results: GetPropertyWithSurroundingNamesReplyResults;
}

export interface PropertyWithSurroundingDecs {
  property: WdProperty;
  surroundingClassesDecsMap: Map<EntityId, WdClassDescOnly>;
  surroundingPropertiesDecsMap: Map<EntityId, WdPropertyDescOnly>;
}

export async function fetchPropertyWithSurroundingsDecs(
  property: WdPropertyDescOnly,
): Promise<PropertyWithSurroundingDecs> {
  const reply = (await axios.get(`/api/v3/properties/${property.id}`))
    .data as GetPropertyWithSurroundingNamesReply;
  const surroundingClassesDecsMap = buildEntityMap(reply.results.surroundingClassesDecs);
  const surroundingPropertiesDecsMap = buildEntityMap(reply.results.surroundingPropertiesDecs);
  return {
    property: reply.results.properties[0],
    surroundingClassesDecsMap,
    surroundingPropertiesDecsMap,
  };
}
