import { type FromSchema } from 'json-schema-to-ts';

export const subjectObjectConstraintSchema = {
  type: 'object',
  properties: {
    subclassOf: {
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
    subclassOfInstanceOf: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
  },
  additionalProperties: false,
  required: ['subclassOf', 'instanceOf', 'subclassOfInstanceOf'],
} as const;

export const generalConstraintsSchema = {
  type: 'object',
  properties: {
    propertyScope: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
    allowedEntityTypes: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
    allowedQualifiers: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
    requiredQualifiers: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
    conflictsWith: {
      type: 'object',
      additionalProperties: true,
    },
    itemRequiresStatement: {
      type: 'object',
      additionalProperties: true,
    },
    subjectType: subjectObjectConstraintSchema,
    // subjectTypeStats: {
    //   type: 'array',
    //   items: {
    //     type: 'number',
    //   },
    // },
  },
  additionalProperties: false,
  required: [
    'propertyScope',
    'allowedEntityTypes',
    'allowedQualifiers',
    'requiredQualifiers',
    'conflictsWith',
    'itemRequiresStatement',
    'subjectType',
    // 'subjectTypeStats'
  ],
} as const;

export const itemConstraintsSchema = {
  type: 'object',
  properties: {
    valueType: subjectObjectConstraintSchema,
    // valueTypeStats: {
    //   type: 'array',
    //   items: {
    //     type: 'number',
    //   },
    // },
    valueRequiresStatement: {
      type: 'object',
      additionalProperties: true,
    },
    isSymmetric: {
      type: 'boolean',
    },
    oneOf: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
    noneOf: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
    inverse: {
      type: 'number',
      nullable: true,
    },
  },
  additionalProperties: false,
  required: ['valueType', 'valueRequiresStatement', 'isSymmetric', 'oneOf', 'noneOf', 'inverse' /** , 'valueTypeStats' */],
} as const;

export const emptyConstraintsSchema = {
  type: 'object',
  additionalProperties: false,
} as const;

export const wdPropertySchema = {
  type: 'object',
  properties: {
    id: {
      type: 'number',
    },
    iri: {
      type: 'string',
    },
    datatype: {
      type: 'number',
    },
    underlyingType: {
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
    instanceOf: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
    subpropertyOf: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
    subproperties: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
    inverseProperty: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
    complementaryProperty: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
    negatesProperty: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
    relatedProperty: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
    equivalentExternalOntologyProperties: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    generalConstraints: generalConstraintsSchema,
    itemConstraints: itemConstraintsSchema,
    stringConstraints: emptyConstraintsSchema,
    quantityConstraints: emptyConstraintsSchema,
    timeConstraints: emptyConstraintsSchema,
    coordinatesConstraints: emptyConstraintsSchema,
  },
  additionalProperties: false,
  required: [
    'id',
    'iri',
    'datatype',
    'underlyingType',
    'labels',
    'descriptions',
    'instanceOf',
    'subpropertyOf',
    'subproperties',
    'relatedProperty',
    'inverseProperty',
    'complementaryProperty',
    'negatesProperty',
    'equivalentExternalOntologyProperties',
    'generalConstraints',
  ],
} as const;

export type WdPropertySchemaType = FromSchema<typeof wdPropertySchema>;

export const wdPropertyDescOnlySchema = {
  type: 'object',
  properties: {
    id: {
      type: 'number',
    },
    iri: {
      type: 'string',
    },
    datatype: {
      type: 'number',
    },
    underlyingType: {
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
  },
  additionalProperties: false,
  required: ['id', 'iri', 'datatype', 'underlyingType', 'labels', 'descriptions'],
} as const;

export type WdPropertyDescOnlySchemaType = FromSchema<typeof wdPropertyDescOnlySchema>;
