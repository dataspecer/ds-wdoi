import { type FromSchema } from 'json-schema-to-ts';

export const searchPropertiesQuerySchema = {
  type: 'object',
  properties: {
    query: {
      type: 'string',
    },
  },
  additionalProperties: false,
  required: ['query'],
} as const;

export const propertiesCandidateSelectorConfig = {
  type: 'object',
  properties: {
    id: {
      enum: ['elastic_bm25', 'qdrant_sparse', 'qdrant_dense'],
    },
    maxResults: {
      type: 'number',
    },
  },
  additionalProperties: false,
  required: ['id', 'maxResults'],
} as const;

export const propertiesFusionCandidateSelectorConfig = {
  type: 'object',
  properties: {
    id: {
      enum: ['qdrant_sparse_dense', 'elastic_bm25_qdrant_dense'],
    },
    maxResults: {
      type: 'number',
    },
    fusionWeights: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
    candidateSelectors: {
      type: 'array',
      items: propertiesCandidateSelectorConfig,
    },
  },
  additionalProperties: false,
  required: ['id', 'maxResults', 'fusionWeights', 'candidateSelectors'],
} as const;

export const propertiesRerankerConfig = {
  type: 'object',
  properties: {
    id: {
      enum: ['cross_encoder', 'feature_usage_mappings'],
    },
    maxResults: {
      type: 'number',
    },
    queryWeight: {
      type: 'number',
    },
    featureWeights: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
  },
  additionalProperties: false,
  required: ['id', 'maxResults'],
} as const;

export const searchPropertiesBodySchema = {
  type: 'object',
  properties: {
    query: searchPropertiesQuerySchema,
    candidateSelectorConfig: propertiesCandidateSelectorConfig,
    fusionCandidateSelectorConfig: propertiesFusionCandidateSelectorConfig,
    rerankerConfig: {
      type: 'array',
      items: propertiesRerankerConfig,
    },
  },
  additionalProperties: false,
  required: ['query'],
} as const;

export type SearchPropertiesBodyType = FromSchema<typeof searchPropertiesBodySchema>;
