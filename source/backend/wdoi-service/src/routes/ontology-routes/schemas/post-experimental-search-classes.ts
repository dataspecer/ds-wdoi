import { type FromSchema } from 'json-schema-to-ts';
import { wdClassHierarchyDescOnlySchema } from './wd-class-schema.js';

export const experimentalSearchClassesQuerySchema = {
  type: 'object',
  properties: {
    query: {
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
  required: ['query', 'properties'],
} as const;

export const experimentalClassesCandidateSelectorConfig = {
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

export const experimentalClassesFusionCandidateSelectorConfig = {
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
      items: experimentalClassesCandidateSelectorConfig,
    },
  },
  additionalProperties: false,
  required: ['id', 'maxResults', 'fusionWeights', 'candidateSelectors'],
} as const;

export const experimentalClassesRerankerConfig = {
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

export const experimentalSearchClassesBodySchema = {
  type: 'object',
  properties: {
    query: experimentalSearchClassesQuerySchema,
    candidateSelectorConfig: experimentalClassesCandidateSelectorConfig,
    fusionCandidateSelectorConfig: experimentalClassesFusionCandidateSelectorConfig,
    rerankerConfig: {
      type: 'array',
      items: experimentalClassesRerankerConfig,
    },
  },
  additionalProperties: false,
  required: ['query'],
} as const;

export type ExperimentalSearchClassesBodyType = FromSchema<
  typeof experimentalSearchClassesBodySchema
>;

export const experimentalSearchClassesReplySchema = {
  type: 'object',
  properties: {
    results: {
      type: 'array',
      items: wdClassHierarchyDescOnlySchema,
    },
  },
  additionalProperties: false,
  required: ['results'],
} as const;

export type ExperimentalSearchClassesReplyType = FromSchema<
  typeof experimentalSearchClassesReplySchema
>;
