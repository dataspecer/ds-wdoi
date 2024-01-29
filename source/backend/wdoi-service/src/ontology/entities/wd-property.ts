import type { InputProperty } from '../loading/input/input-property';
import type { ModifierPropertyVisitor, ModifierVisitableProperty } from '../post-loading/modifiers';
import type { EntityIdsList, ExternalOntologyMapping } from './common';
import { type EmptyTypeConstraint, GeneralConstraints, type ItemTypeConstraints, PropertyScopeValue, AllowedEntityTypesValue } from './constraint';
import { WdEntity } from './wd-entity';

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

export abstract class WdProperty extends WdEntity implements ModifierVisitableProperty {
  private static readonly URIType = 'P';
  readonly datatype: Datatype;
  readonly underlyingType: UnderlyingType;
  readonly subpropertyOf: EntityIdsList;
  readonly relatedProperty: EntityIdsList;
  readonly inverseProperty: EntityIdsList;
  readonly complementaryProperty: EntityIdsList;
  readonly negatesProperty: EntityIdsList;
  readonly subproperties: EntityIdsList;
  readonly equivalentExternalOntologyProperties: ExternalOntologyMapping;
  readonly generalConstraints: GeneralConstraints;

  static {
    super.entityURITypes.add(this.URIType);
  }

  protected constructor(inputProperty: InputProperty) {
    super(inputProperty);
    this.datatype = inputProperty.datatype;
    this.underlyingType = inputProperty.underlyingType;
    this.subpropertyOf = inputProperty.subpropertyOf;
    this.relatedProperty = inputProperty.relatedProperty;
    this.inverseProperty = inputProperty.inverseProperty;
    this.complementaryProperty = inputProperty.complementaryProperty;
    this.negatesProperty = inputProperty.negatesProperty;
    this.subproperties = inputProperty.subproperties;
    this.equivalentExternalOntologyProperties = inputProperty.equivalentProperty;
    this.generalConstraints = new GeneralConstraints(inputProperty.constraints);
  }

  static factory(inputProperty: InputProperty): WdProperty | never {
    if (inputProperty.underlyingType === UnderlyingType.ENTITY) {
      return new ItemProperty(inputProperty);
    } else if (inputProperty.underlyingType === UnderlyingType.STRING) {
      return new StringProperty(inputProperty);
    } else if (inputProperty.underlyingType === UnderlyingType.QUANTITY) {
      return new QuantityProperty(inputProperty);
    } else if (inputProperty.underlyingType === UnderlyingType.TIME) {
      return new TimeProperty(inputProperty);
    } else if (inputProperty.underlyingType === UnderlyingType.GLOBE_COORDINATE) {
      return new CoordinatesProperty(inputProperty);
    } else {
      throw new Error('Missing constructor for a property type.');
    }
  }
  abstract accept(visitor: ModifierPropertyVisitor): void;

  canBeUsedAsMainValue(): boolean {
    return this.generalConstraints.propertyScope.includes(PropertyScopeValue.AS_MAIN);
  }

  canBeUsedOnItems(): boolean {
    return this.generalConstraints.allowedEntityTypes.includes(AllowedEntityTypesValue.ITEM);
  }

  datatypeIsNotLexicographic(): boolean {
    return this.datatype !== Datatype.LEXEME && this.datatype !== Datatype.FORM && this.datatype !== Datatype.SENSE;
  }

  public static isURIType(entityType: string): boolean {
    return entityType === WdProperty.URIType;
  }

  public static isItemProperty(property: WdProperty): property is ItemProperty {
    return property.underlyingType === UnderlyingType.ENTITY;
  }
}

export class ItemProperty extends WdProperty {
  readonly itemConstraints: ItemTypeConstraints;

  constructor(inputProperty: InputProperty) {
    super(inputProperty);
    this.itemConstraints = inputProperty.constraints.typeDependent as ItemTypeConstraints;
  }

  accept(visitor: ModifierPropertyVisitor): void {
    visitor.visitItemProperty(this);
  }
}

export class StringProperty extends WdProperty {
  readonly stringConstraints: EmptyTypeConstraint;

  constructor(inputProperty: InputProperty) {
    super(inputProperty);
    this.stringConstraints = null;
  }

  accept(visitor: ModifierPropertyVisitor): void {
    visitor.visitStringProperty(this);
  }
}

export class QuantityProperty extends WdProperty {
  readonly quantityConstraints: EmptyTypeConstraint;

  constructor(inputProperty: InputProperty) {
    super(inputProperty);
    this.quantityConstraints = null;
  }

  accept(visitor: ModifierPropertyVisitor): void {
    visitor.visitQuantityProperty(this);
  }
}

export class TimeProperty extends WdProperty {
  readonly timeConstraints: EmptyTypeConstraint;

  constructor(inputProperty: InputProperty) {
    super(inputProperty);
    this.timeConstraints = null;
  }

  accept(visitor: ModifierPropertyVisitor): void {
    visitor.visitTimeProperty(this);
  }
}

export class CoordinatesProperty extends WdProperty {
  readonly coordinatesConstraints: EmptyTypeConstraint;

  constructor(inputProperty: InputProperty) {
    super(inputProperty);
    this.coordinatesConstraints = null;
  }

  accept(visitor: ModifierPropertyVisitor): void {
    visitor.visitCoordinateProperty(this);
  }
}
