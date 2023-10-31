import type { EntityId, EntityIdsList, ExternalOntologyMapping, LanguageMap, LanugageArrayMap } from '../../entities/common';
import type {
  AllowedEntityTypesValue,
  EmptyTypeConstraint,
  ItemTypeConstraints,
  PropertyScopeValue,
  StatementAllowanceMap,
  SubjectValueTypeContraint,
} from '../../entities/constraint';
import type { Datatype, UnderlyingType } from '../../entities/wd-property';

export interface InputProperty {
  readonly id: EntityId;
  readonly datatype: Datatype;
  readonly underlyingType: UnderlyingType;
  readonly aliases: LanugageArrayMap;
  readonly labels: LanguageMap;
  readonly descriptions: LanguageMap;
  readonly instanceOf: EntityIdsList;
  readonly subpropertyOf: EntityIdsList;
  readonly relatedProperty: EntityIdsList;
  readonly equivalentProperty: ExternalOntologyMapping;
  readonly constraints: InputConstraints;
}

export interface InputConstraints {
  readonly propertyScope: PropertyScopeValue;
  readonly allowedEntityTypes: AllowedEntityTypesValue;
  readonly allowedQualifiers: EntityIdsList;
  readonly requiredQualifiers: EntityIdsList;
  readonly conflictsWith: StatementAllowanceMap;
  readonly itemRequiresStatement: StatementAllowanceMap;
  readonly subjectType: SubjectValueTypeContraint;
  readonly typeDependent: ItemTypeConstraints | EmptyTypeConstraint;
}
