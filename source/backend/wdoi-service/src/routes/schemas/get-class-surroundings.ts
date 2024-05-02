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
        startClassId: {
          type: 'number',
        },
        parentsIds: {
          type: 'array',
          items: {
            type: 'number',
          },
        },
        subjectOfIds: {
          type: 'array',
          items: {
            type: 'number',
          },
        },
        valueOfIds: {
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
      required: [
        'startClassId',
        'parentsIds',
        'subjectOfIds',
        'valueOfIds',
        'classes',
        'properties',
      ],
    },
  },
  additionalProperties: false,
  required: ['results'],
} as const;

export type SurroundingsWithRecsReplyType = FromSchema<typeof surroundingsReplySchema>;
