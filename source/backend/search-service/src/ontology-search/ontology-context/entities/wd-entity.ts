import type { InputEntity } from '../loading/input/input-entity.js';
import type { EntityId, Lexicalization } from './common.js';

export abstract class WdEntity {
  readonly id: EntityId;
  readonly lexicalization: Lexicalization;

  constructor(inputEntity: InputEntity) {
    this.id = inputEntity.id;
    this.lexicalization = inputEntity.lexicalization;
  }
}
