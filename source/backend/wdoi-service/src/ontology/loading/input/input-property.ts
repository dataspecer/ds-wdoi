import type { EntityId, EntityIdsList, ExternalOntologyMapping } from '../../entities/common';
import type { AllowedEntityTypesValue, EmptyTypeConstraint, PropertyScopeValue, StatementAllowanceMap } from '../../entities/constraint';
import type { Datatype, UnderlyingType } from '../../entities/wd-property';
import type { InputEntity } from './input-entity';

export interface InputItemTypeConstraints {
  readonly valueType: InputSubjectValueTypeContraint;
  readonly valueTypeStats: EntityIdsList;
  readonly valueRequiresStatement: StatementAllowanceMap;
  readonly isSymmetric: boolean;
  readonly oneOf: EntityIdsList;
  readonly noneOf: EntityIdsList;
  readonly inverse: null | EntityId;
}

export interface InputSubjectValueTypeContraint {
  readonly subclassOf: EntityIdsList;
  readonly instanceOf: EntityIdsList;
  readonly subclassOfInstanceOf: EntityIdsList;
}

export interface InputProperty extends InputEntity {
  readonly datatype: Datatype;
  readonly underlyingType: UnderlyingType;
  readonly subpropertyOf: EntityIdsList;
  readonly relatedProperty: EntityIdsList;
  readonly inverseProperty: EntityIdsList;
  readonly complementaryProperty: EntityIdsList;
  readonly negatesProperty: EntityIdsList;
  readonly subproperties: EntityIdsList;
  readonly equivalentProperty: ExternalOntologyMapping;
  readonly constraints: InputConstraints;
}

export interface InputConstraints {
  readonly propertyScope: PropertyScopeValue[];
  readonly allowedEntityTypes: AllowedEntityTypesValue[];
  readonly allowedQualifiers: EntityIdsList;
  readonly requiredQualifiers: EntityIdsList;
  readonly conflictsWith: StatementAllowanceMap;
  readonly itemRequiresStatement: StatementAllowanceMap;
  readonly subjectType: InputSubjectValueTypeContraint;
  readonly subjectTypeStats: EntityIdsList;
  readonly typeDependent: InputItemTypeConstraints | EmptyTypeConstraint;
}
