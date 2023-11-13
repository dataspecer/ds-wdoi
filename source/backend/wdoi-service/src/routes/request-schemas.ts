import { type FromSchema } from 'json-schema-to-ts';

export const searchInputQueryStringSchema = {
  type: 'object',
  properties: {
    query: {
      type: 'string',
    },
    searchClasses: {
      type: 'boolean',
    },
    searchProperties: {
      type: 'boolean',
    },
    searchInstances: {
      type: 'boolean',
    },
  },
  additionalProperties: false,
  required: ['query'],
} as const;

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

export const wdClassSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'number',
    },
    labels: {
      type: 'object',
      additionalProperties: {
        type: 'string',
      },
    },
    descriptions: {
      type: 'object',
      additionalProperties: {
        type: 'string',
      },
    },
    subclassOf: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
    children: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
    instanceOf: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
    subjectOfProperty: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
    valueOfProperty: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
    equivalentExternalOntologyClasses: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    propertiesForThisType: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
  },
  additionalProperties: false,
  required: [
    'id',
    'labels',
    'descriptions',
    'subclassOf',
    'children',
    'instanceOf',
    'subjectOfProperty',
    'valueOfProperty',
    'equivalentExternalOntologyClasses',
    'propertiesForThisType',
  ],
} as const;

export const searchReplySchema = {
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

export const replySchema = {
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

export type SearchInputQueryStringType = FromSchema<typeof searchInputQueryStringSchema>;

export type GetEntityInputParamsType = FromSchema<typeof getEntityInputParamsSchema>;

export type GetHierarchyInputQueryStringType = FromSchema<typeof getHierarchyInputQueryStringSchema>;

export type SearchReplyType = FromSchema<typeof searchReplySchema>;
export type ReplyType = FromSchema<typeof replySchema>;

export type HierarchyReplyType = FromSchema<typeof hierarchyReplySchema>;
