import type { EntityId, EntityIdsList, EntityIri, LanguageMap, LanugageArrayMap } from '../../entities/common';

export interface InputEntity {
  readonly id: EntityId;
  readonly iri: EntityIri;
  readonly aliases: LanugageArrayMap;
  readonly labels: LanguageMap;
  readonly descriptions: LanguageMap;
  readonly instanceOf: EntityIdsList;
}
