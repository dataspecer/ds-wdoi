import { type FromSchema } from 'json-schema-to-ts';

export const wdClassSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'number',
    },
    iri: {
      type: 'string',
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
    // instanceOf: {
    //   type: 'array',
    //   items: {
    //     type: 'number',
    //   },
    // },
    // instances: {
    //   type: 'array',
    //   items: {
    //     type: 'number',
    //   },
    // },
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
    // propertiesForThisType: {
    //   type: 'array',
    //   items: {
    //     type: 'number',
    //   },
    // },
  },
  additionalProperties: false,
  required: [
    'id',
    'iri',
    'labels',
    'descriptions',
    'subclassOf',
    // 'instanceOf',
    // 'instances',
    'subjectOfProperty',
    'valueOfProperty',
    'equivalentExternalOntologyClasses',
    // 'propertiesForThisType',
  ],
} as const;

export type WdClassSchemaType = FromSchema<typeof wdClassSchema>;

export const wdClassDescOnlySchema = {
  type: 'object',
  properties: {
    id: {
      type: 'number',
    },
    iri: {
      type: 'string',
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
  },
  additionalProperties: false,
  required: ['id', 'iri', 'labels', 'descriptions'],
} as const;

export type WdClassDescOnlySchemaType = FromSchema<typeof wdClassDescOnlySchema>;

export const wdClassHierarchyDescOnlySchema = {
  type: 'object',
  properties: {
    id: {
      type: 'number',
    },
    iri: {
      type: 'string',
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
  },
  additionalProperties: false,
  required: ['id', 'iri', 'labels', 'descriptions', 'subclassOf'],
} as const;

export type WdClassHierarchyDescOnlySchema = FromSchema<typeof wdClassHierarchyDescOnlySchema>;

export const wdClassHierarchySurroundingsDescOnlySchema = {
  type: 'object',
  properties: {
    id: {
      type: 'number',
    },
    iri: {
      type: 'string',
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
  },
  additionalProperties: false,
  required: [
    'id',
    'iri',
    'labels',
    'descriptions',
    'subclassOf',
    'subjectOfProperty',
    'valueOfProperty',
  ],
} as const;

export type WdClassHierarchySurroundingsDescOnlySchemaType = FromSchema<
  typeof wdClassHierarchySurroundingsDescOnlySchema
>;
