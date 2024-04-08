import { type FromSchema } from 'json-schema-to-ts';
import { wdClassHierarchyDescOnlySchema } from './wd-class-schema.js';

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
        startClass: wdClassHierarchyDescOnlySchema,
        parents: {
          type: 'array',
          items: wdClassHierarchyDescOnlySchema,
        },
        children: {
          type: 'array',
          items: wdClassHierarchyDescOnlySchema,
        },
      },
      additionalProperties: false,
      required: ['startClass', 'parents', 'children'],
    },
  },
  additionalProperties: false,
  required: ['results'],
} as const;

export type GetHierarchyInputQueryStringType = FromSchema<typeof getHierarchyInputQueryStringSchema>;
export type HierarchyReplyType = FromSchema<typeof hierarchyReplySchema>;
