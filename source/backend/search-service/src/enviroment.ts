import dotenv from 'dotenv';

dotenv.config();

export const envVars = {
  ES_NODE: process.env.ES_NODE ?? '',
  QDRANT_NODE: process.env.QDRANT_NODE ?? '',

  CROSS_RERANKER_NODE: process.env.CROSS_RERANKER_NODE ?? '',
  DENSE_EMBED_NODE: process.env.DENSE_EMBED_NODE ?? '',
  SPARSE_EMBED_NODE: process.env.SPARSE_EMBED_NODE ?? '',

  CLASSES_PATH: process.env.CLASSES_PATH ?? '',
  PROPERTIES_PATH: process.env.PROPERTIES_PATH ?? '',

  RESTART_KEY: process.env.RESTART_KEY ?? '1234567',

  ENVIROMENT: process.env.NODE_ENV ?? 'development',
};
