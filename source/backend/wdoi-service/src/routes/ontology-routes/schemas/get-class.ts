import { type FromSchema } from 'json-schema-to-ts';
import { wdClassDescOnlySchema, wdClassSchema } from './wd-class-schema.js';
import { wdPropertyDescOnlySchema } from './wd-property-schema.js';

// Get class with names of surroundings only reply

export const getClassWithSurroundingDescReplySchema = {
  type: 'object',
  properties: {
    results: {
      type: 'object',
      properties: {
        startClass: wdClassSchema,
        parentsIds: {
          type: 'array',
          items: {
            type: 'number',
          },
        },
        subjectOfIds: {
          type: 'array',
          items: {
            type: 'number',
          },
        },
        valueOfIds: {
          type: 'array',
          items: {
            type: 'number',
          },
        },
        surroundingClassesDesc: {
          type: 'array',
          items: wdClassDescOnlySchema,
        },
        surroundingPropertiesDesc: {
          type: 'array',
          items: wdPropertyDescOnlySchema,
        },
      },
      additionalProperties: false,
      required: [
        'startClass',
        'parentsIds',
        'subjectOfIds',
        'valueOfIds',
        'surroundingClassesDesc',
        'surroundingPropertiesDesc',
      ],
    },
  },
  additionalProperties: false,
  required: ['results'],
} as const;

export type GetClassWithSurroundingDescReplyType = FromSchema<
  typeof getClassWithSurroundingDescReplySchema
>;
