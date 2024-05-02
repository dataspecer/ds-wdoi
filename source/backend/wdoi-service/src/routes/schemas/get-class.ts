import { type FromSchema } from 'json-schema-to-ts';
import { wdClassDescOnlySchema, wdClassSchema } from './wd-class-schema.js';
import { wdPropertyDescOnlySchema } from './wd-property-schema.js';

// Get class with names of surroundings only reply

export const getClassWithSurroundingDescReplySchema = {
  type: 'object',
  properties: {
    results: {
      type: 'object',
      properties: {
        class: wdClassSchema,
        surroundingClassesDesc: {
          type: 'array',
          items: wdClassDescOnlySchema,
        },
        surroundingPropertiesDesc: {
          type: 'array',
          items: wdPropertyDescOnlySchema,
        },
      },
      additionalProperties: false,
      required: ['class', 'surroundingClassesDesc', 'surroundingPropertiesDesc'],
    },
  },
  additionalProperties: false,
  required: ['results'],
} as const;

export type GetClassWithSurroundingDescReplyType = FromSchema<
  typeof getClassWithSurroundingDescReplySchema
>;
