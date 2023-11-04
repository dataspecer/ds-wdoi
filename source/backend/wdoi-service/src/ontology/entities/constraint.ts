import type { InputConstraints } from '../loading/input/input-property';
import type { EntityId, EntityIdsList } from './common';

export enum PropertyScopeValue {
  AS_MAIN = 0,
  AS_QUALIFIER = 1,
  AS_REFERENCE = 2,
}

export enum AllowedEntityTypesValue {
  ITEM = 0,
  PROPERTY = 1,
  LEXEME = 2,
  FORM = 3,
  SENSE = 4,
  MEDIA_INFO = 5,
}

export type StatementAllowanceMap = Record<string, EntityIdsList>;

export interface SubjectValueTypeContraint {
  subclassOf: EntityIdsList;
  instanceOf: EntityIdsList;
  subclassOfInstanceOf: EntityIdsList;
}
export class GeneralConstraints {
  propertyScope: PropertyScopeValue;
  allowedEntityTypes: AllowedEntityTypesValue;
  allowedQualifiers: EntityIdsList;
  requiredQualifiers: EntityIdsList;
  conflictsWith: StatementAllowanceMap;
  itemRequiresStatement: StatementAllowanceMap;
  subjectType: SubjectValueTypeContraint;

  constructor(inputConstraints: InputConstraints) {
    this.propertyScope = inputConstraints.propertyScope;
    this.allowedEntityTypes = inputConstraints.allowedEntityTypes;
    this.allowedQualifiers = inputConstraints.allowedQualifiers;
    this.requiredQualifiers = inputConstraints.requiredQualifiers;
    this.conflictsWith = inputConstraints.conflictsWith;
    this.itemRequiresStatement = inputConstraints.itemRequiresStatement;
    this.subjectType = inputConstraints.subjectType;
  }
}

export interface ItemTypeConstraints {
  valueType: SubjectValueTypeContraint;
  valueRequiresStatement: StatementAllowanceMap;
  isSymmetric: boolean;
  oneOf: EntityIdsList;
  noneOf: EntityIdsList;
  inverse: null | EntityId;
}

export type EmptyTypeConstraint = null;
