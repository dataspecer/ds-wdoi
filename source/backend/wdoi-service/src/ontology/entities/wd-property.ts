import type { InputItemTypeConstraints, InputProperty } from '../loading/input/input-property.js';
import type { EntityIdsList, ExternalOntologyMapping } from './common.js';
import { type EmptyTypeConstraint, GeneralConstraints, ItemTypeConstraints } from './wd-property-constraint.js';
import { WdEntity } from './wd-entity.js';
import { emptyExternalMappingsListOrSave } from './empty-type-constants.js';

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

export abstract class WdProperty extends WdEntity {
  private static readonly URIType = 'P';
  public static readonly URI_REGEXP = new RegExp('^https?://www.wikidata.org/(entity/P|wiki/Property:P)[1-9][0-9]*$');
  readonly datatype: Datatype;
  readonly underlyingType: UnderlyingType;
  readonly equivalentExternalOntologyProperties: ExternalOntologyMapping;
  readonly generalConstraints: GeneralConstraints;
  // readonly subpropertyOf: EntityIdsList;
  // readonly relatedProperty: EntityIdsList;
  // readonly inverseProperty: EntityIdsList;
  // readonly complementaryProperty: EntityIdsList;
  // readonly negatesProperty: EntityIdsList;
  // readonly subproperties: EntityIdsList;

  static {
    super.entityURITypes.add(this.URIType);
  }

  protected constructor(inputProperty: InputProperty) {
    super(inputProperty);
    this.datatype = inputProperty.datatype;
    this.underlyingType = inputProperty.underlyingType;
    this.equivalentExternalOntologyProperties = emptyExternalMappingsListOrSave(inputProperty.equivalentProperty);
    this.generalConstraints = new GeneralConstraints(inputProperty.constraints);
    // this.subpropertyOf = emptyEntitiesIdsListOrSave(inputProperty.subpropertyOf);
    // this.relatedProperty = emptyEntitiesIdsListOrSave(inputProperty.relatedProperty);
    // this.inverseProperty = emptyEntitiesIdsListOrSave(inputProperty.inverseProperty);
    // this.complementaryProperty = emptyEntitiesIdsListOrSave(inputProperty.complementaryProperty);
    // this.negatesProperty = emptyEntitiesIdsListOrSave(inputProperty.negatesProperty);
    // this.subproperties = emptyEntitiesIdsListOrSave(inputProperty.subproperties);
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

  // canBeUsedAsMainValue(): boolean {
  //   return this.generalConstraints.propertyScope.includes(PropertyScopeValue.AS_MAIN);
  // }

  // canBeUsedOnItems(): boolean {
  //   return this.generalConstraints.allowedEntityTypes.includes(AllowedEntityTypesValue.ITEM);
  // }

  datatypeIsNotLexicographic(): boolean {
    return this.datatype !== Datatype.LEXEME && this.datatype !== Datatype.FORM && this.datatype !== Datatype.SENSE;
  }

  public static isURIType(entityType: string): boolean {
    return entityType === WdProperty.URIType;
  }

  public static isItemProperty(property: WdProperty): property is ItemProperty {
    return property.underlyingType === UnderlyingType.ENTITY;
  }

  public getDomainClassIdsByUsage(): EntityIdsList {
    return this.generalConstraints.subjectTypeStats;
  }

  // public getDomainClassIdsByConstraints(): EntityIdsList {
  //   return this.generalConstraints.subjectType.instanceOf.concat(this.generalConstraints.subjectType.subclassOfInstanceOf);
  // }

  public getRangeClassIdsByUsage(): EntityIdsList {
    return [];
  }
}

export class ItemProperty extends WdProperty {
  readonly itemConstraints: ItemTypeConstraints;

  constructor(inputProperty: InputProperty) {
    super(inputProperty);
    this.itemConstraints = new ItemTypeConstraints(inputProperty.constraints.typeDependent as InputItemTypeConstraints);
  }

  // public getRangeClassIdsByConstraints(): EntityIdsList {
  //   return this.itemConstraints.valueType.instanceOf.concat(this.generalConstraints.subjectType.subclassOfInstanceOf);
  // }

  public getRangeClassIdsByUsage(): EntityIdsList {
    return this.itemConstraints.valueTypeStats;
  }
}

export class StringProperty extends WdProperty {
  readonly stringConstraints: EmptyTypeConstraint;

  constructor(inputProperty: InputProperty) {
    super(inputProperty);
    this.stringConstraints = null;
  }
}

export class QuantityProperty extends WdProperty {
  readonly quantityConstraints: EmptyTypeConstraint;

  constructor(inputProperty: InputProperty) {
    super(inputProperty);
    this.quantityConstraints = null;
  }
}

export class TimeProperty extends WdProperty {
  readonly timeConstraints: EmptyTypeConstraint;

  constructor(inputProperty: InputProperty) {
    super(inputProperty);
    this.timeConstraints = null;
  }
}

export class CoordinatesProperty extends WdProperty {
  readonly coordinatesConstraints: EmptyTypeConstraint;

  constructor(inputProperty: InputProperty) {
    super(inputProperty);
    this.coordinatesConstraints = null;
  }
}
