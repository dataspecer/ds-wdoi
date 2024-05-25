import type { InputEntity } from '../loading/input/input-entity.js';
import type { EntityId } from './common.js';

export abstract class WdEntity {
  readonly id: EntityId;

  constructor(inputEntity: InputEntity) {
    this.id = inputEntity.id;
  }
}
