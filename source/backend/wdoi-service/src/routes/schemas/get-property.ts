import { type FromSchema } from 'json-schema-to-ts';
import { wdClassDescOnlySchema } from './wd-class-schema';
import { wdPropertySchema, wdPropertyDescOnlySchema } from './wd-property-schema';

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
        surroundingClassNames: {
          type: 'array',
          items: wdClassDescOnlySchema,
        },
        surroundingPropertyNames: {
          type: 'array',
          items: wdPropertyDescOnlySchema,
        },
      },
      additionalProperties: false,
      required: ['properties', 'surroundingClassNames', 'surroundingPropertyNames'],
    },
  },
  additionalProperties: false,
  required: ['results'],
} as const;

export type GetPropertyWithSurroundingNamesReplyType = FromSchema<typeof getPropertyWithSurroundingNamesReplySchema>;
