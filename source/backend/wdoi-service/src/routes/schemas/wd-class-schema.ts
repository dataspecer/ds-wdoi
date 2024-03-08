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
    // children: {
    //   type: 'array',
    //   items: {
    //     type: 'number',
    //   },
    // },
    instanceOf: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
    instances: {
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
    subjectOfPropertyStats: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
    valueOfPropertyStats: {
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
    'iri',
    'labels',
    'descriptions',
    'subclassOf',
    // 'children',
    'instanceOf',
    'instances',
    'subjectOfProperty',
    'valueOfProperty',
    'subjectOfPropertyStats',
    'valueOfPropertyStats',
    'equivalentExternalOntologyClasses',
    'propertiesForThisType',
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
