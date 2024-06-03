import { type FromSchema } from 'json-schema-to-ts';
import { wdPropertyDescOnlySchema } from './wd-property-schema.js';

export const searchPropertiesQuerySchema = {
  type: 'object',
  properties: {
    text: {
      type: 'string',
    },
  },
  additionalProperties: false,
  required: ['text'],
} as const;

export const searchPropertiesCandidateSelectorConfig = {
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

export const searchPropertiesFusionCandidateSelectorConfig = {
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
      items: searchPropertiesCandidateSelectorConfig,
    },
  },
  additionalProperties: false,
  required: ['id', 'maxResults', 'fusionWeights', 'candidateSelectors'],
} as const;

export const searchPropertiesRerankerConfig = {
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
    candidateSelectorConfig: searchPropertiesCandidateSelectorConfig,
    fusionCandidateSelectorConfig: searchPropertiesFusionCandidateSelectorConfig,
    rerankerConfig: {
      type: 'array',
      items: searchPropertiesRerankerConfig,
    },
  },
  additionalProperties: false,
  required: ['query'],
} as const;

export type SearchPropertiesBodyType = FromSchema<typeof searchPropertiesBodySchema>;

export const searchPropertiesReplySchema = {
  type: 'object',
  properties: {
    results: {
      type: 'array',
      items: wdPropertyDescOnlySchema,
    },
  },
  additionalProperties: false,
  required: ['results'],
} as const;

export type SearchPropertiesReplyType = FromSchema<typeof searchPropertiesReplySchema>;
