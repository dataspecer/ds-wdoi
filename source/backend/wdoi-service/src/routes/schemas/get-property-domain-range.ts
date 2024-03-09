import { type FromSchema } from 'json-schema-to-ts';
import { wdClassSchema } from './wd-class-schema';

export const getPropertyDomainRangeReplySchema = {
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

export type GetPropertyDomainRangeReplyType = FromSchema<typeof getPropertyDomainRangeReplySchema>;
