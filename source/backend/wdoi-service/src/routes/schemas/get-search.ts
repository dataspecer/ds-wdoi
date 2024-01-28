// Search

import { type FromSchema } from 'json-schema-to-ts';
import { wdClassSchema } from './wd-class-schema';
import { wdPropertySchema } from './wd-property-schema';

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
    languagePriority: {
      type: 'string',
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
          items: wdClassSchema,
        },
        properties: {
          type: 'array',
          items: wdPropertySchema,
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
