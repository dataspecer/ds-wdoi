import { type FromSchema } from 'json-schema-to-ts';
import { wdClassHierarchyDescOnlySchema } from './wd-class-schema.js';

export const getClassHierarchyInputQueryStringSchema = {
  type: 'object',
  properties: {
    part: {
      enum: ['parents', 'children', 'full'],
    },
  },
  additionalProperties: false,
  required: ['part'],
} as const;

export const classHierarchyReplySchema = {
  type: 'object',
  properties: {
    results: {
      type: 'object',
      properties: {
        startClassId: {
          type: 'number',
        },
        parentsIds: {
          type: 'array',
          items: {
            type: 'number',
          },
        },
        childrenIds: {
          type: 'array',
          items: {
            type: 'number',
          },
        },
        classes: {
          type: 'array',
          items: wdClassHierarchyDescOnlySchema,
        },
      },
      additionalProperties: false,
      required: ['startClassId', 'parentsIds', 'childrenIds', 'classes'],
    },
  },
  additionalProperties: false,
  required: ['results'],
} as const;

export type GetClassHierarchyInputQueryStringType = FromSchema<
  typeof getClassHierarchyInputQueryStringSchema
>;
export type HierarchyReplyType = FromSchema<typeof classHierarchyReplySchema>;
