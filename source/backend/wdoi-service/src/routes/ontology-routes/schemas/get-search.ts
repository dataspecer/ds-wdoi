// Search

import { type FromSchema } from 'json-schema-to-ts';
import { wdClassHierarchyDescOnlySchema } from './wd-class-schema.js';
import { wdPropertyDescOnlySchema } from './wd-property-schema.js';

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
  },
  additionalProperties: false,
  required: ['query'],
} as const;

export const searchReplySchema = {
  type: 'object',
  properties: {
    results: {
      type: 'object',
      properties: {
        classes: {
          type: 'array',
          items: wdClassHierarchyDescOnlySchema,
        },
        properties: {
          type: 'array',
          items: wdPropertyDescOnlySchema,
        },
      },
      additionalProperties: false,
      required: ['classes', 'properties'],
    },
  },
  additionalProperties: false,
  required: ['results'],
} as const;

export type SearchInputQueryStringType = FromSchema<typeof searchInputQueryStringSchema>;
export type SearchReplyType = FromSchema<typeof searchReplySchema>;
