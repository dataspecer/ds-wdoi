import { type FromSchema } from 'json-schema-to-ts';
import { wdPropertyDescOnlySchema } from './wd-property-schema.js';

export const experimentalSearchPropertiesQuerySchema = {
  type: 'object',
  properties: {
    query: {
      type: 'string',
    },
  },
  additionalProperties: false,
  required: ['query'],
} as const;

export const experimentalPropertiesCandidateSelectorConfig = {
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

export const experimentalPropertiesFusionCandidateSelectorConfig = {
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
      items: experimentalPropertiesCandidateSelectorConfig,
    },
  },
  additionalProperties: false,
  required: ['id', 'maxResults', 'fusionWeights', 'candidateSelectors'],
} as const;

export const experimentalPropertiesRerankerConfig = {
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

export const experimentalSearchPropertiesBodySchema = {
  type: 'object',
  properties: {
    query: experimentalSearchPropertiesQuerySchema,
    candidateSelectorConfig: experimentalPropertiesCandidateSelectorConfig,
    fusionCandidateSelectorConfig: experimentalPropertiesFusionCandidateSelectorConfig,
    rerankerConfig: {
      type: 'array',
      items: experimentalPropertiesRerankerConfig,
    },
  },
  additionalProperties: false,
  required: ['query'],
} as const;

export type ExperimentalSearchPropertiesBodyType = FromSchema<
  typeof experimentalSearchPropertiesBodySchema
>;

export const experimentalSearchPropertiesReplySchema = {
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

export type ExperimentalSearchPropertiesReplyType = FromSchema<
  typeof experimentalSearchPropertiesReplySchema
>;
