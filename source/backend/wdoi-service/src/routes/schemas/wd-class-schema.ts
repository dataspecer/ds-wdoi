import { type FromSchema } from 'json-schema-to-ts';

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
    // 'children',
    'instanceOf',
    'subjectOfProperty',
    'valueOfProperty',
    'equivalentExternalOntologyClasses',
    'propertiesForThisType',
  ],
} as const;

export type WdPropertySchemaType = FromSchema<typeof wdClassSchema>;
