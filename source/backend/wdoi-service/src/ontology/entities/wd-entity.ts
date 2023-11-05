import type { InputEntity } from '../loading/input/input-entity';
import type { EntityId, EntityIdsList, LanguageMap } from './common';

export abstract class WdEntity {
  readonly id: EntityId;
  readonly labels: LanguageMap;
  readonly descriptions: LanguageMap;
  readonly instanceOf: EntityIdsList;

  constructor(inputEntity: InputEntity) {
    this.id = inputEntity.id;
    this.labels = inputEntity.labels;
    this.descriptions = inputEntity.descriptions;
    this.instanceOf = inputEntity.instanceOf;
  }
}
