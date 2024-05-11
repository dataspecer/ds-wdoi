import type { EntityId, EntityIdsList, ExternalOntologyMappings } from '../../entities/common.js';
import type {
  AllowedEntityTypesValue,
  EmptyTypeConstraint,
  PropertyScopeValue,
  StatementAllowanceMap,
} from '../../entities/wd-property-constraint.js';
import type { Datatype, UnderlyingType } from '../../entities/wd-property.js';
import type { InputEntity } from './input-entity.js';

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

// Contains all the contents from the preprocessing phase.
// There is no need to store them all, just extract what is needed.
export interface InputProperty extends InputEntity {
  readonly datatype: Datatype;
  readonly underlyingType: UnderlyingType;
  readonly subpropertyOf: EntityIdsList;
  readonly relatedProperty: EntityIdsList;
  readonly inverseProperty: EntityIdsList;
  readonly complementaryProperty: EntityIdsList;
  readonly negatesProperty: EntityIdsList;
  readonly subproperties: EntityIdsList;
  readonly equivalentProperty: ExternalOntologyMappings;
  readonly constraints: InputConstraints;
  readonly usageCount: number;
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
