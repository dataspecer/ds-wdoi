import { type FromSchema } from 'json-schema-to-ts';

export const searchReplySchema = {
  type: 'object',
  properties: {
    results: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
  },
  additionalProperties: false,
  required: ['results'],
} as const;

export type SearchReplyType = FromSchema<typeof searchReplySchema>;
