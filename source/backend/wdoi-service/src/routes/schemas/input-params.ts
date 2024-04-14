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

export const getClassPropertyEndpointsInputParamsSchema = {
  type: 'object',
  properties: {
    classId: {
      type: 'number',
    },
    propertyId: {
      type: 'number',
    },
  },
  additionalProperties: false,
  required: ['classId', 'propertyId'],
} as const;

export type GetClassPropertyEndpointsInputParamsType = FromSchema<typeof getClassPropertyEndpointsInputParamsSchema>;
