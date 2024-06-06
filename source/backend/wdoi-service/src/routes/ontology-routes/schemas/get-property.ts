import { type FromSchema } from 'json-schema-to-ts';
import { wdClassHierarchyDescOnlySchema } from './wd-class-schema.js';
import { wdPropertySchema, wdPropertyDescOnlySchema } from './wd-property-schema.js';

export const getPropertyWithSurroundingDescReplySchema = {
  type: 'object',
  properties: {
    results: {
      type: 'object',
      properties: {
        startProperty: wdPropertySchema,
        surroundingClassesDesc: {
          type: 'array',
          items: wdClassHierarchyDescOnlySchema,
        },
        surroundingPropertiesDesc: {
          type: 'array',
          items: wdPropertyDescOnlySchema,
        },
      },
      additionalProperties: false,
      required: ['startProperty', 'surroundingClassesDesc', 'surroundingPropertiesDesc'],
    },
  },
  additionalProperties: false,
  required: ['results'],
} as const;

export type GetPropertyWithSurroundingDescReplyType = FromSchema<
  typeof getPropertyWithSurroundingDescReplySchema
>;
