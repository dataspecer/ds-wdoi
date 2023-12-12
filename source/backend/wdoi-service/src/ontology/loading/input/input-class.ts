import type { EntityIdsList, ExternalOntologyMapping, PropertyProbabilityList } from '../../entities/common';
import type { InputEntity } from './input-entity';

export interface InputClass extends InputEntity {
  readonly subclassOf: EntityIdsList;
  readonly propertiesForThisType: EntityIdsList;
  readonly equivalentClass: ExternalOntologyMapping;
  readonly children: EntityIdsList;
  readonly subjectOf: EntityIdsList;
  readonly subjectOfProbs: PropertyProbabilityList;
  readonly valueOf: EntityIdsList;
}
