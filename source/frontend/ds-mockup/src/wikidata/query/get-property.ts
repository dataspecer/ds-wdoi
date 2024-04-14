import axios from 'axios';
import { WdClassDescOnly } from '../entities/wd-class';
import { EntityId } from '../entities/wd-entity';
import { WdProperty, WdPropertyDescOnly } from '../entities/wd-property';
import { buildEntityMap } from '../utils/build-entity-map';

interface GetPropertyWithSurroundingNamesReplyResults {
  property: WdProperty;
  surroundingClassesDesc: WdClassDescOnly[];
  surroundingPropertiesDesc: WdPropertyDescOnly[];
}

interface GetPropertyWithSurroundingNamesReply {
  results: GetPropertyWithSurroundingNamesReplyResults;
}

export interface PropertyWithSurroundingDecs {
  property: WdProperty;
  surroundingClassesDescMap: Map<EntityId, WdClassDescOnly>;
  surroundingPropertiesDescMap: Map<EntityId, WdPropertyDescOnly>;
}

export async function fetchPropertyWithSurroundingsDecs(
  property: WdPropertyDescOnly,
): Promise<PropertyWithSurroundingDecs> {
  const reply = (await axios.get(`/api/v3/properties/${property.id}`))
    .data as GetPropertyWithSurroundingNamesReply;
  const surroundingClassesDescMap = buildEntityMap(reply.results.surroundingClassesDesc);
  const surroundingPropertiesDescMap = buildEntityMap(reply.results.surroundingPropertiesDesc);
  return {
    property: reply.results.property,
    surroundingClassesDescMap,
    surroundingPropertiesDescMap,
  };
}
