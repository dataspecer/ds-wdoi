import { type FromSchema } from 'json-schema-to-ts';

export const getRestartInputQueryStringSchema = {
  type: 'object',
  properties: {
    restartKey: {
      type: 'string',
    },
  },
  additionalProperties: false,
  required: ['restartKey'],
} as const;

export type GetRestartQueryStringType = FromSchema<typeof getRestartInputQueryStringSchema>;

export const getRestartReplySchema = {
  type: 'object',
  properties: {
    ok: {
      type: 'boolean',
    },
  },
  additionalProperties: false,
  required: ['ok'],
} as const;

export type GetRestartReplySchemaType = FromSchema<typeof getRestartReplySchema>;
