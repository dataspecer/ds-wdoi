// Get class

import { type FromSchema } from 'json-schema-to-ts';
import { wdClassDescOnlySchema, wdClassSchema } from './wd-class-schema';
import { wdPropertyDescOnlySchema, wdPropertySchema } from './wd-property-schema';

export const getClassReplySchema = {
  type: 'object',
  properties: {
    results: {
      type: 'object',
      properties: {
        classes: {
          type: 'array',
          items: wdClassSchema,
        },
      },
      additionalProperties: false,
      required: ['classes'],
    },
  },
  additionalProperties: false,
  required: ['results'],
} as const;

export type GetClassSchemaReplyType = FromSchema<typeof getClassReplySchema>;

// Get property

export const getPropertyReplySchema = {
  type: 'object',
  properties: {
    results: {
      type: 'object',
      properties: {
        properties: {
          type: 'array',
          items: wdPropertySchema,
        },
      },
      additionalProperties: false,
      required: ['properties'],
    },
  },
  additionalProperties: false,
  required: ['results'],
} as const;

export type GetPropertySchemaReplyType = FromSchema<typeof getPropertyReplySchema>;

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
