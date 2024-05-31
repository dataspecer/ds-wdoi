import type { EntityId, Lexicalization } from '../../entities/common.js';

export interface InputEntity {
  id: EntityId;
  lexicalization: Lexicalization;
}
