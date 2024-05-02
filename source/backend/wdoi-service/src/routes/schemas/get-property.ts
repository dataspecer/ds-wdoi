import { type FromSchema } from 'json-schema-to-ts';
import { wdClassDescOnlySchema } from './wd-class-schema.js';
import { wdPropertySchema, wdPropertyDescOnlySchema } from './wd-property-schema.js';

export const getPropertyWithSurroundingDescReplySchema = {
  type: 'object',
  properties: {
    results: {
      type: 'object',
      properties: {
        property: wdPropertySchema,
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
      required: ['property', 'surroundingClassesDesc', 'surroundingPropertiesDesc'],
    },
  },
  additionalProperties: false,
  required: ['results'],
} as const;

export type GetPropertyWithSurroundingDescReplyType = FromSchema<
  typeof getPropertyWithSurroundingDescReplySchema
>;
