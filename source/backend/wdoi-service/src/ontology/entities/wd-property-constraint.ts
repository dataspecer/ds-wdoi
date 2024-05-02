import type {
  InputConstraints,
  InputItemTypeConstraints,
  InputSubjectValueTypeContraint,
} from '../loading/input/input-property.js';
import type { EntityIdsList } from './common.js';
import { emptyEntitiesIdsListOrSave } from './wd-property-empty-type-constants.js';

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

export class SubjectValueTypeConstraint {
  readonly subclassOf: EntityIdsList;
  readonly instanceOf: EntityIdsList;
  readonly subclassOfInstanceOf: EntityIdsList;

  constructor(inputSubjectValueConst: InputSubjectValueTypeContraint) {
    this.subclassOf = emptyEntitiesIdsListOrSave(inputSubjectValueConst.subclassOf);
    this.instanceOf = emptyEntitiesIdsListOrSave(inputSubjectValueConst.instanceOf);
    this.subclassOfInstanceOf = emptyEntitiesIdsListOrSave(
      inputSubjectValueConst.subclassOfInstanceOf,
    );
  }
}

export class GeneralConstraints {
  readonly subjectTypeStats: EntityIdsList;
  // readonly propertyScope: readonly PropertyScopeValue[];
  // readonly allowedEntityTypes: readonly AllowedEntityTypesValue[];
  // readonly allowedQualifiers: EntityIdsList;
  // readonly requiredQualifiers: EntityIdsList;
  // readonly conflictsWith: StatementAllowanceMap;
  // readonly itemRequiresStatement: StatementAllowanceMap;
  // readonly subjectType: SubjectValueTypeConstraint;

  constructor(inputConstraints: InputConstraints) {
    this.subjectTypeStats = emptyEntitiesIdsListOrSave(inputConstraints.subjectTypeStats);
    // this.propertyScope = inputConstraints.propertyScope;
    // this.allowedEntityTypes = inputConstraints.allowedEntityTypes;
    // this.allowedQualifiers = emptyEntitiesIdsListOrSave(inputConstraints.allowedQualifiers);
    // this.requiredQualifiers = emptyEntitiesIdsListOrSave(inputConstraints.requiredQualifiers);
    // this.conflictsWith = emptyAllowanceMapOrSave(inputConstraints.conflictsWith);
    // this.itemRequiresStatement = emptyAllowanceMapOrSave(inputConstraints.itemRequiresStatement);
    // this.subjectType = new SubjectValueTypeConstraint(inputConstraints.subjectType);
  }
}

export class ItemTypeConstraints {
  readonly valueTypeStats: EntityIdsList;
  // readonly valueType: InputSubjectValueTypeContraint;
  // readonly valueRequiresStatement: StatementAllowanceMap;
  // readonly isSymmetric: boolean;
  // readonly oneOf: EntityIdsList;
  // readonly noneOf: EntityIdsList;
  // readonly inverse: null | EntityId;

  constructor(inputItemConst: InputItemTypeConstraints) {
    this.valueTypeStats = emptyEntitiesIdsListOrSave(inputItemConst.valueTypeStats);
    // this.valueType = new SubjectValueTypeConstraint(inputItemConst.valueType);
    // this.valueRequiresStatement = emptyAllowanceMapOrSave(inputItemConst.valueRequiresStatement);
    // this.isSymmetric = inputItemConst.isSymmetric;
    // this.oneOf = emptyEntitiesIdsListOrSave(inputItemConst.oneOf);
    // this.noneOf = emptyEntitiesIdsListOrSave(inputItemConst.noneOf);
    // this.inverse = inputItemConst.inverse;
  }
}

export type EmptyTypeConstraint = null;
