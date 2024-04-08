import { type FromSchema } from 'json-schema-to-ts';
import { wdClassHierarchySurroundingsDescOnlySchema } from './wd-class-schema.js';
import { wdPropertyDescOnlySchema } from './wd-property-schema.js';

// Surroundings with Recommendations

export const surroundingsReplySchema = {
  type: 'object',
  properties: {
    results: {
      type: 'object',
      properties: {
        startClass: {
          type: 'number',
        },
        parents: {
          type: 'array',
          items: {
            type: 'number',
          },
        },
        subjectOf: {
          type: 'array',
          items: {
            type: 'number',
          },
        },
        valueOf: {
          type: 'array',
          items: {
            type: 'number',
          },
        },
        classes: {
          type: 'array',
          items: wdClassHierarchySurroundingsDescOnlySchema,
        },
        properties: {
          type: 'array',
          items: wdPropertyDescOnlySchema,
        },
      },
      additionalProperties: false,
      required: ['startClass', 'parents', 'subjectOf', 'valueOf', 'classes', 'properties'],
    },
  },
  additionalProperties: false,
  required: ['results'],
} as const;

export type SurroundingsWithRecsReplyType = FromSchema<typeof surroundingsReplySchema>;
