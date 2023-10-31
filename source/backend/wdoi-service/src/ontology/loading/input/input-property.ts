import type { EntityId, EntityIdsList, ExternalOntologyMapping, LanguageMap, LanugageArrayMap } from '../../entities/common';
import type {
  AllowedEntityTypesValue,
  EmptyTypeConstraint,
  ItemTypeConstraints,
  PropertyScopeValue,
  StatementAllowanceMap,
  SubjectValueTypeContraint,
} from '../../entities/constraint';
import type { Datatype, UnderlyingType } from '../../entities/property';

export interface InputProperty {
  id: EntityId;
  datatype: Datatype;
  underlyingType: UnderlyingType;
  aliases: LanugageArrayMap;
  labels: LanguageMap;
  descriptions: LanguageMap;
  instanceOf: EntityIdsList;
  subpropertyOf: EntityIdsList;
  relatedProperty: EntityIdsList;
  equivalentProperty: ExternalOntologyMapping;
  costraints: InputConstraints;
}

export interface InputConstraints {
  propertyScope: PropertyScopeValue;
  allowedEntityTypes: AllowedEntityTypesValue;
  allowedQualifiers: EntityIdsList;
  requiredQualifiers: EntityIdsList;
  conflictsWith: StatementAllowanceMap;
  itemRequiresStatement: StatementAllowanceMap;
  subjectType: SubjectValueTypeContraint;
  typeDependent: ItemTypeConstraints | EmptyTypeConstraint;
}
