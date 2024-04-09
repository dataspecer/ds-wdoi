import { type FromSchema } from 'json-schema-to-ts';
import { wdClassDescOnlySchema } from './wd-class-schema.js';
import { wdPropertySchema, wdPropertyDescOnlySchema } from './wd-property-schema.js';

export const getPropertyWithSurroundingNamesReplySchema = {
  type: 'object',
  properties: {
    results: {
      type: 'object',
      properties: {
        properties: {
          type: 'array',
          items: wdPropertySchema,
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
      required: ['properties', 'surroundingClassesDecs', 'surroundingPropertiesDecs'],
    },
  },
  additionalProperties: false,
  required: ['results'],
} as const;

export type GetPropertyWithSurroundingNamesReplyType = FromSchema<typeof getPropertyWithSurroundingNamesReplySchema>;
