import type { EntityId, EntityIdsList, ExternalOntologyMapping, LanguageMap, LanugageArrayMap } from '../../entities/common';

export interface InputClass {
  readonly id: EntityId;
  readonly aliases: LanugageArrayMap;
  readonly labels: LanguageMap;
  readonly descriptions: LanguageMap;
  readonly instanceOf: EntityIdsList;
  readonly subclassOf: EntityIdsList;
  readonly propertiesForThisType: EntityIdsList;
  readonly equivalentClass: ExternalOntologyMapping;
}
