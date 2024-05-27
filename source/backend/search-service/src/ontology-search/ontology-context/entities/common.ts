export type LanguageMap = Record<string, string>;
export type LanguageArrayMap = Record<string, string[]>;

export type EntityIdsList = readonly EntityId[];
export type EntityId = number;

export type EntityIdsListStrings = readonly string[];
export type EntityIdString = string;

export type Lexicalization = string;

export type DenseVector = number[];

export type SparseVectorValues = number[];
export type SparseVectorIndices = number[];

export interface SparseVector {
  readonly indices: SparseVectorIndices;
  readonly values: SparseVectorValues;
}

export type NumberFeature = number;
