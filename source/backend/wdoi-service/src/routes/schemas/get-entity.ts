import { type FromSchema } from 'json-schema-to-ts';
import { wdClassDescOnlySchema, wdClassSchema } from './wd-class-schema';
import { wdPropertyDescOnlySchema, wdPropertySchema } from './wd-property-schema';

// Get class with names of surroundings only

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
      required: ['classes', 'surroundingClassNames', 'surroundingPropertyNames'],
    },
  },
  additionalProperties: false,
  required: ['results'],
} as const;

export type GetClassWithSurroundingNamesReplyType = FromSchema<typeof getClassWithSurroundingNamesReplySchema>;

// Get property with names of surroundings only

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
