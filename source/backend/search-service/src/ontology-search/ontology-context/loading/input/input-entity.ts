import type {
  DenseVector,
  EntityId,
  LanguageArrayMap,
  LanguageMap,
  Lexicalization,
  SparseVector,
} from '../../entities/common.js';

export interface InputEntity {
  id: EntityId;
  aliases: LanguageArrayMap;
  labels: LanguageMap;
  descriptions: LanguageMap;

  lexicalization: Lexicalization;
  denseVector: DenseVector;
  sparseVector: SparseVector;
}
