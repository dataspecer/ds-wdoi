export type LanguageMap = Record<string, string>;
export type LanguageArrayMap = Record<string, string[]>;

export type EntityIdsList = readonly EntityId[];
export type EntityId = number;

export type Lexicalization = string;

export type DenseVector = readonly number[];

export type SparseVectorValues = readonly number[];
export type SparseVectorIndices = readonly number[];

export interface SparseVector {
  readonly indices: SparseVectorIndices;
  readonly values: SparseVectorValues;
}

export type NumberFeature = number;
