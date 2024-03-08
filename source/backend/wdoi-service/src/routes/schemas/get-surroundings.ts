import { type FromSchema } from 'json-schema-to-ts';
import { wdClassSchema } from './wd-class-schema';
import { wdPropertySchema } from './wd-property-schema';

// Surroundings with Recommendations

export const getSurroundingsInputQueryStringSchema = {
  type: 'object',
  properties: {
    part: {
      enum: ['constraints', 'usage'],
    },
  },
  additionalProperties: false,
  required: ['part'],
} as const;

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
          items: wdClassSchema,
        },
        properties: {
          type: 'array',
          items: wdPropertySchema,
        },
      },
      additionalProperties: false,
      required: ['startClass', 'parents', 'subjectOf', 'valueOf', 'classes', 'properties'],
    },
  },
  additionalProperties: false,
  required: ['results'],
} as const;

export type GetSurroundingsInputQueryStringType = FromSchema<typeof getSurroundingsInputQueryStringSchema>;
export type SurroundingsWithRecsReplyType = FromSchema<typeof surroundingsReplySchema>;
