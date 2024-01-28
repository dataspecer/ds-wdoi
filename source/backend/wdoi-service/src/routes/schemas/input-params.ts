import { type FromSchema } from 'json-schema-to-ts';

// Path id parameter

export const getEntityInputParamsSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'number',
    },
  },
  additionalProperties: false,
  required: ['id'],
} as const;

export type GetEntityInputParamsType = FromSchema<typeof getEntityInputParamsSchema>;
