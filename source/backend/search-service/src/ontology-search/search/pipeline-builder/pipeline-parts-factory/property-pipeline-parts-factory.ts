export enum PropertyCandidateSelectorsIds {
  ELASTIC_BM25 = 'elastic_bm25',
  QDRANT_SPARSE = 'qdrant_sparse',
  QDRANT_DENSE = 'qdrant_dense',
}

export enum PropertyFusionCandidateSelectorsIds {
  QDRANT_SPARSE_DENSE = 'qdrant_sparse_dense',
  ELASTIC_BM25_FIELDED_QDRANT_DENSE = 'elastic_bm25_fielded_qdrant_dense',
}

export enum PropertyRerankersIds {
  CROSS_ENCODER = 'cross_encoder',
  FEATURE_USAGE_MAPPINGS = 'feature_usage_mappings',
}
