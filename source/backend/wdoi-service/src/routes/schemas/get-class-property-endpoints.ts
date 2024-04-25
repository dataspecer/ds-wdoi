import { type FromSchema } from 'json-schema-to-ts';
import { wdClassHierarchyDescOnlySchema } from './wd-class-schema.js';

export const getClassPropertyEndpointsReplySchema = {
  type: 'object',
  properties: {
    results: {
      type: 'object',
      properties: {
        classes: {
          type: 'array',
          items: wdClassHierarchyDescOnlySchema,
        },
      },
      additionalProperties: false,
      required: ['classes'],
    },
  },
  additionalProperties: false,
  required: ['results'],
} as const;

export type GetClassPropertyEndpointsReplyType = FromSchema<typeof getClassPropertyEndpointsReplySchema>;

export const getClassPropertyEndpointsInputQueryStringSchema = {
  type: 'object',
  properties: {
    order: {
      enum: ['base', 'inherit'],
    },
  },
  additionalProperties: false,
  required: ['order'],
} as const;

export type GetClassPropertyEndpointsInputQueryStringType = FromSchema<typeof getClassPropertyEndpointsInputQueryStringSchema>;
