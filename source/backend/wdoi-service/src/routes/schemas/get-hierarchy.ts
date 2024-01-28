import { type FromSchema } from 'json-schema-to-ts';
import { wdClassSchema } from './wd-class-schema';

export const getHierarchyInputQueryStringSchema = {
  type: 'object',
  properties: {
    part: {
      enum: ['parents', 'children', 'full'],
    },
  },
  additionalProperties: false,
  required: ['part'],
} as const;

export const hierarchyReplySchema = {
  type: 'object',
  properties: {
    results: {
      type: 'object',
      properties: {
        root: wdClassSchema,
        parents: {
          type: 'array',
          items: wdClassSchema,
        },
        children: {
          type: 'array',
          items: wdClassSchema,
        },
      },
      additionalProperties: false,
      required: ['root', 'parents', 'children'],
    },
  },
  additionalProperties: false,
  required: ['results'],
} as const;

export type GetHierarchyInputQueryStringType = FromSchema<typeof getHierarchyInputQueryStringSchema>;
export type HierarchyReplyType = FromSchema<typeof hierarchyReplySchema>;
