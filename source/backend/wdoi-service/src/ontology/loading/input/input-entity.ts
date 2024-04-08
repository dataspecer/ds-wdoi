import type { EntityId, EntityIdsList, EntityIri, LanguageMap, LanguageArrayMap } from '../../entities/common.js';

export interface InputEntity {
  readonly id: EntityId;
  readonly iri: EntityIri;
  readonly aliases: LanguageArrayMap;
  readonly labels: LanguageMap;
  readonly descriptions: LanguageMap;
  readonly instanceOf: EntityIdsList;
}
