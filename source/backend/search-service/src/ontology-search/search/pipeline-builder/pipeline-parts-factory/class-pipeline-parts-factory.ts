export enum ClassCandidateSelectorsIds {
  ELASTIC_BM25 = 'elastic_bm25',
  ELASTIC_BM25_Fielded = 'elastic_bm25_fielded',
  QDRANT_SPARSE = 'qdrant_sparse',
  QDRANT_DENSE = 'qdrant_dense',
}

export enum ClassFusionCandidateSelectorsIds {
  QDRANT_SPARSE_DENSE = 'qdrant_sparse_dense',
  ELASTIC_BM25_QDRANT_DENSE = 'elastic_bm25_qdrant_dense',
  ELASTIC_BM25_FIELDED_QDRANT_DENSE = 'elastic_bm25_fielded_qdrant_dense',
}

export enum ClassRerankersIds {
  CROSS_ENCODER = 'cross_encoder',
  FEATURE_INSTANCE_MAPPINGS = 'feature_instance_mappings',
}
