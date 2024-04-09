import { type FromSchema } from 'json-schema-to-ts';
import { wdClassDescOnlySchema, wdClassSchema } from './wd-class-schema.js';
import { wdPropertyDescOnlySchema } from './wd-property-schema.js';

// Get class with names of surroundings only reply

export const getClassWithSurroundingNamesReplySchema = {
  type: 'object',
  properties: {
    results: {
      type: 'object',
      properties: {
        classes: {
          type: 'array',
          items: wdClassSchema,
        },
        surroundingClassesDecs: {
          type: 'array',
          items: wdClassDescOnlySchema,
        },
        surroundingPropertiesDecs: {
          type: 'array',
          items: wdPropertyDescOnlySchema,
        },
      },
      additionalProperties: false,
      required: ['classes', 'surroundingClassesDecs', 'surroundingPropertiesDecs'],
    },
  },
  additionalProperties: false,
  required: ['results'],
} as const;

export type GetClassWithSurroundingNamesReplyType = FromSchema<typeof getClassWithSurroundingNamesReplySchema>;
