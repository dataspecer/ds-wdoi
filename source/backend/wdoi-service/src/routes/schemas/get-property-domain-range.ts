import { type FromSchema } from 'json-schema-to-ts';
import { wdClassDescOnlySchema } from './wd-class-schema.js';

export const getClassPropertyDomainRangeReplySchema = {
  type: 'object',
  properties: {
    results: {
      type: 'object',
      properties: {
        classes: {
          type: 'array',
          items: wdClassDescOnlySchema,
        },
      },
      additionalProperties: false,
      required: ['classes'],
    },
  },
  additionalProperties: false,
  required: ['results'],
} as const;

export type GetClassPropertyDomainRangeReplyType = FromSchema<typeof getClassPropertyDomainRangeReplySchema>;

export const getClassPropertyDomainRangeInputQueryStringSchema = {
  type: 'object',
  properties: {
    part: {
      enum: ['own', 'inherited'],
    },
  },
  additionalProperties: false,
  required: ['part'],
} as const;

export type GetClassPropertyDomainRangeInputQueryStringType = FromSchema<typeof getClassPropertyDomainRangeInputQueryStringSchema>;
