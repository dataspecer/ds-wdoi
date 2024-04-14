import axios from 'axios';
import { WdClass, WdClassDescOnly } from '../entities/wd-class';
import { EntityId } from '../entities/wd-entity';
import { WdPropertyDescOnly } from '../entities/wd-property';
import { buildEntityMap } from '../utils/build-entity-map';

interface GetClassWithSurroundingNamesReplyResults {
  class: WdClass;
  surroundingClassesDesc: WdClassDescOnly[];
  surroundingPropertiesDesc: WdPropertyDescOnly[];
}

interface GetClassWithSurroundingNamesReply {
  results: GetClassWithSurroundingNamesReplyResults;
}

export interface ClassWithSurroundingsDesc {
  class: WdClass;
  surroundingClassesDescMap: Map<EntityId, WdClassDescOnly>;
  surroundingPropertiesDescMap: Map<EntityId, WdPropertyDescOnly>;
}

export async function fetchClassWithSurroundingsDecs(
  cls: WdClassDescOnly,
): Promise<ClassWithSurroundingsDesc> {
  const reply = (await axios.get(`/api/v3/classes/${cls.id}`))
    .data as GetClassWithSurroundingNamesReply;
  const surroundingClassesDescMap = buildEntityMap(reply.results.surroundingClassesDesc);
  const surroundingPropertiesDescMap = buildEntityMap(reply.results.surroundingPropertiesDesc);
  return {
    class: reply.results.class,
    surroundingClassesDescMap,
    surroundingPropertiesDescMap,
  };
}
