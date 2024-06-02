import { type FromSchema } from 'json-schema-to-ts';

export const searchClassesQuerySchema = {
  type: 'object',
  properties: {
    text: {
      type: 'string',
    },
    properties: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
  },
  additionalProperties: false,
  required: ['text', 'properties'],
} as const;

export const classesCandidateSelectorConfig = {
  type: 'object',
  properties: {
    id: {
      enum: ['elastic_bm25', 'elastic_bm25_fielded', 'qdrant_sparse', 'qdrant_dense'],
    },
    maxResults: {
      type: 'number',
    },
  },
  additionalProperties: false,
  required: ['id', 'maxResults'],
} as const;

export const classesFusionCandidateSelectorConfig = {
  type: 'object',
  properties: {
    id: {
      enum: ['fusion'],
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
      items: classesCandidateSelectorConfig,
    },
  },
  additionalProperties: false,
  required: ['id', 'maxResults', 'fusionWeights', 'candidateSelectors'],
} as const;

export const classesRerankerConfig = {
  type: 'object',
  properties: {
    id: {
      enum: ['cross_encoder', 'feature_instance_mappings'],
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

export const searchClassesBodySchema = {
  type: 'object',
  properties: {
    query: searchClassesQuerySchema,
    candidateSelectorConfig: classesCandidateSelectorConfig,
    fusionCandidateSelectorConfig: classesFusionCandidateSelectorConfig,
    rerankerConfig: {
      type: 'array',
      items: classesRerankerConfig,
    },
  },
  additionalProperties: false,
  required: ['query'],
} as const;

export type SearchClassesBodyType = FromSchema<typeof searchClassesBodySchema>;
