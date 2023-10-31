import type { InputProperty } from '../loading/input/input-property';
import type { EntityId, EntityIdsList, ExternalOntologyMapping, LanguageMap } from './common';
import { type EmptyTypeConstraint, GeneralConstraints, type ItemTypeConstraints } from './constraint';

export enum UnderlyingType {
  ENTITY = 0,
  STRING = 1,
  TIME = 2,
  QUANTITY = 3,
  GLOBE_COORDINATE = 4,
}

export enum Datatype {
  ITEM = 0,
  PROPERTY = 1,
  LEXEME = 2,
  SENSE = 3,
  FORM = 4,
  MONOLINGUAL_TEXT = 5,
  STRING = 6,
  EXTERNAL_IDENTIFIER = 7,
  URL = 8,
  COMMONS_MEDIA_FILE = 9,
  GEOGRAPHIC_SHAPE = 10,
  TABULAR_DATA = 11,
  MATHEMATICAL_EXPRESSION = 12,
  MUSICAL_NOTATION = 13,
  QUANTITY = 14,
  POINT_IN_TIME = 15,
  GEOGRAPHIC_COORDINATES = 16,
}

export class Property {
  id: EntityId;
  datatype: Datatype;
  underlyingType: UnderlyingType;
  labels: LanguageMap;
  descriptions: LanguageMap;
  instanceOf: EntityIdsList;
  subpropertyOf: EntityIdsList;
  relatedProperty: EntityIdsList;
  equivalentProperty: ExternalOntologyMapping;

  generalConstraints: GeneralConstraints;

  protected constructor(inputProperty: InputProperty) {
    this.id = inputProperty.id;
    this.datatype = inputProperty.datatype;
    this.underlyingType = inputProperty.underlyingType;
    this.labels = inputProperty.labels;
    this.descriptions = inputProperty.descriptions;
    this.instanceOf = inputProperty.instanceOf;
    this.subpropertyOf = inputProperty.subpropertyOf;
    this.relatedProperty = inputProperty.relatedProperty;
    this.equivalentProperty = inputProperty.equivalentProperty;

    this.generalConstraints = new GeneralConstraints(inputProperty.costraints);
  }
}

export class ItemProperty extends Property {
  itemConstraints: ItemTypeConstraints;

  constructor(inputProperty: InputProperty) {
    super(inputProperty);
    this.itemConstraints = inputProperty.costraints.typeDependent as ItemTypeConstraints;
  }
}

export class StringProperty extends Property {
  stringConstraints: EmptyTypeConstraint;

  constructor(inputProperty: InputProperty) {
    super(inputProperty);
    this.stringConstraints = null;
  }
}

export class QuantityProperty extends Property {
  quantityConstraints: EmptyTypeConstraint;

  constructor(inputProperty: InputProperty) {
    super(inputProperty);
    this.quantityConstraints = null;
  }
}

export class TimeProperty extends Property {
  timeConstraints: EmptyTypeConstraint;

  constructor(inputProperty: InputProperty) {
    super(inputProperty);
    this.timeConstraints = null;
  }
}

export class CoordinatesProperty extends Property {
  coordinatesConstraints: EmptyTypeConstraint;

  constructor(inputProperty: InputProperty) {
    super(inputProperty);
    this.coordinatesConstraints = null;
  }
}
