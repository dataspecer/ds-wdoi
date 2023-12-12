import { wdClassSchema } from './wd-class-schema';
import { wdPropertySchema } from './wd-property-schema';
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

// Search

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
    languagePriority: {
      type: 'string',
    },
  },
  additionalProperties: false,
  required: ['query'],
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

export type SearchInputQueryStringType = FromSchema<typeof searchInputQueryStringSchema>;
export type SearchReplyType = FromSchema<typeof searchReplySchema>;

// Hierarchy

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

// Get class

export const getClassReplySchema = {
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

export type GetClassSchemaReplyType = FromSchema<typeof getClassReplySchema>;

// Surroundings

export const surroundingsReplySchema = {
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
        subjectOf: {
          type: 'array',
          items: wdPropertySchema,
        },
        valueOf: {
          type: 'array',
          items: wdPropertySchema,
        },
        propertyEndpoints: {
          type: 'array',
          items: wdClassSchema,
        },
      },
      additionalProperties: false,
      required: ['root', 'parents', 'children', 'subjectOf', 'valueOf', 'propertyEndpoints'],
    },
  },
  additionalProperties: false,
  required: ['results'],
} as const;

export type SurroundingsReplyType = FromSchema<typeof surroundingsReplySchema>;

// Surroundings with Recommendations

// Surroundings

export const surroundingsWithRecsReplySchema = {
  type: 'object',
  properties: {
    results: {
      type: 'object',
      properties: {
        root: {
          type: 'number',
        },
        parents: {
          type: 'array',
          items: {
            type: 'number',
          },
        },
        propertyEndpoints: {
          type: 'array',
          items: {
            type: 'number',
          },
        },
        subjectOf: {
          type: 'array',
          items: {
            type: 'number',
          },
        },
        valueOf: {
          type: 'array',
          items: {
            type: 'number',
          },
        },
        classes: {
          type: 'array',
          items: wdClassSchema,
        },
        properties: {
          type: 'array',
          items: wdPropertySchema,
        },
      },
      additionalProperties: false,
      required: ['root', 'parents', 'propertyEndpoints', 'subjectOf', 'valueOf', 'classes', 'properties'],
    },
  },
  additionalProperties: false,
  required: ['results'],
} as const;

export type SurroundingsWithRecsReplyType = FromSchema<typeof surroundingsWithRecsReplySchema>;
