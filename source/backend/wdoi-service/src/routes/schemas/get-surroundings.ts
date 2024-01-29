import { type FromSchema } from 'json-schema-to-ts';
import { wdClassSchema } from './wd-class-schema';
import { wdPropertySchema } from './wd-property-schema';

export const surroundingsReplySchema = {
  type: 'object',
  properties: {
    results: {
      type: 'object',
      properties: {
        startClass: wdClassSchema,
        parents: {
          type: 'array',
          items: wdClassSchema,
        },
        children: {
          type: 'array',
          items: wdClassSchema,
        },
        subjectOf: {
          type: 'array',
          items: wdPropertySchema,
        },
        valueOf: {
          type: 'array',
          items: wdPropertySchema,
        },
        propertyEndpoints: {
          type: 'array',
          items: wdClassSchema,
        },
      },
      additionalProperties: false,
      required: ['startClass', 'parents', 'children', 'subjectOf', 'valueOf', 'propertyEndpoints'],
    },
  },
  additionalProperties: false,
  required: ['results'],
} as const;

export type SurroundingsReplyType = FromSchema<typeof surroundingsReplySchema>;

// Surroundings with Recommendations

export const surroundingsWithRecsReplySchema = {
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
        propertyEndpoints: {
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
      required: ['startClass', 'parents', 'propertyEndpoints', 'subjectOf', 'valueOf', 'classes', 'properties'],
    },
  },
  additionalProperties: false,
  required: ['results'],
} as const;

export type SurroundingsWithRecsReplyType = FromSchema<typeof surroundingsWithRecsReplySchema>;
