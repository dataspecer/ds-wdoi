import { type FromSchema } from 'json-schema-to-ts';

export const getFilterBySchemaQueryStringSchema = {
  type: 'object',
  properties: {
    url: {
      type: 'string',
      format: 'url',
    },
  },
  additionalProperties: false,
  required: ['url'],
} as const;

export type GetFilterBySchemaQueryStringType = FromSchema<typeof getFilterBySchemaQueryStringSchema>;

export const filterPropertyRecordSchema = {
  type: 'object',
  properties: {
    propertyId: {
      type: 'number',
    },
    rangeIds: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
  },
  additionalProperties: false,
  required: ['propertyId', 'rangeIds'],
} as const;

export type FilterPropertyRecordType = FromSchema<typeof filterPropertyRecordSchema>;

export const getFilterByInstanceReplySchema = {
  type: 'object',
  properties: {
    results: {
      type: 'object',
      properties: {
        instanceOfIds: {
          type: 'array',
          items: {
            type: 'number',
          },
        },
        subjectOfFilterRecords: {
          type: 'array',
          items: filterPropertyRecordSchema,
        },
        valueOfFilterRecords: {
          type: 'array',
          items: filterPropertyRecordSchema,
        },
      },
    },
  },
  additionalProperties: false,
  required: ['results'],
} as const;

export type GetFilterByInstanceReplyType = FromSchema<typeof getFilterByInstanceReplySchema>;
