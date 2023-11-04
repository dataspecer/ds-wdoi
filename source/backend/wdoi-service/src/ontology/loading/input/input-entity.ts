import type { EntityId, EntityIdsList, LanguageMap, LanugageArrayMap } from '../../entities/common';

export interface InputEntity {
  readonly id: EntityId;
  readonly aliases: LanugageArrayMap;
  readonly labels: LanguageMap;
  readonly descriptions: LanguageMap;
  readonly instanceOf: EntityIdsList;
}
