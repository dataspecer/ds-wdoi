import type { EntityId, EntityIdsList, ExternalOntologyMapping, LanguageMap, LanugageArrayMap } from '../../entities/common';

export interface InputClass {
  id: EntityId;
  aliases: LanugageArrayMap;
  labels: LanguageMap;
  descriptions: LanguageMap;
  instanceOf: EntityIdsList;
  subclassOf: EntityIdsList;
  propertiesForThisType: EntityIdsList;
  equivalentClass: ExternalOntologyMapping;
}
