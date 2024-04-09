import axios from 'axios';
import { WdClass, WdClassDescOnly } from '../entities/wd-class';
import { EntityId } from '../entities/wd-entity';
import { WdPropertyDescOnly } from '../entities/wd-property';
import { buildEntityMap } from '../utils/build-entity-map';

interface GetClassWithSurroundingNamesReplyResults {
  classes: WdClass[];
  surroundingClassesDecs: WdClassDescOnly[];
  surroundingPropertiesDecs: WdPropertyDescOnly[];
}

interface GetClassWithSurroundingNamesReply {
  results: GetClassWithSurroundingNamesReplyResults;
}

export interface ClassWithSurroundingsDesc {
  class: WdClass;
  surroundingClassesDecsMap: Map<EntityId, WdClassDescOnly>;
  surroundingPropertiesDecsMap: Map<EntityId, WdPropertyDescOnly>;
}

export async function fetchClassWithSurroundingsDecs(
  cls: WdClassDescOnly,
): Promise<ClassWithSurroundingsDesc> {
  const reply = (await axios.get(`/api/v3/classes/${cls.id}`))
    .data as GetClassWithSurroundingNamesReply;
  const surroundingClassesDecsMap = buildEntityMap(reply.results.surroundingClassesDecs);
  const surroundingPropertiesDecsMap = buildEntityMap(reply.results.surroundingPropertiesDecs);
  return {
    class: reply.results.classes[0],
    surroundingClassesDecsMap,
    surroundingPropertiesDecsMap,
  };
}
