import { type FromSchema } from 'json-schema-to-ts';

export const searchInputQueryStringSchema = {
  type: 'object',
  properties: {
    query: {
      type: 'string',
    },
    searchClasses: {
      type: 'boolean',
    },
    searchProperties: {
      type: 'boolean',
    },
    searchInstances: {
      type: 'boolean',
    },
  },
  required: ['query'],
} as const;

export const getEntityInputParamsSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'number',
    },
  },
  required: ['id'],
} as const;

export const getHierarchyInputQueryStringSchema = {
  type: 'object',
  properties: {
    direction: {
      enum: ['parents', 'children', 'both'],
    },
  },
  required: ['direction'],
} as const;

export type SearchInputQueryStringType = FromSchema<typeof searchInputQueryStringSchema>;

export type GetEntityInputParamsType = FromSchema<typeof getEntityInputParamsSchema>;

export type GetHierarchyInputQueryStringType = FromSchema<typeof getHierarchyInputQueryStringSchema>;
