import type { EntityIdsList, ExternalOntologyMapping } from '../../entities/common';
import type {
  AllowedEntityTypesValue,
  EmptyTypeConstraint,
  ItemTypeConstraints,
  PropertyScopeValue,
  StatementAllowanceMap,
  SubjectValueTypeContraint,
} from '../../entities/constraint';
import type { Datatype, UnderlyingType } from '../../entities/wd-property';
import type { InputEntity } from './input-entity';

export interface InputProperty extends InputEntity {
  readonly datatype: Datatype;
  readonly underlyingType: UnderlyingType;
  readonly subpropertyOf: EntityIdsList;
  readonly relatedProperty: EntityIdsList;
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
  readonly subjectType: SubjectValueTypeContraint;
  readonly typeDependent: ItemTypeConstraints | EmptyTypeConstraint;
}
