import type { EntityId, EntityIdsList, ExternalOntologyMapping, LanguageMap } from './common';
import type { InputClass } from '../loading/input/input-class';

export class Class {
  id: EntityId;
  labels: LanguageMap;
  descriptions: LanguageMap;
  instanceOf: EntityIdsList;
  subclassOf: EntityIdsList;
  propertiesForThisType: EntityIdsList;
  equivalentClass: ExternalOntologyMapping;

  children: EntityIdsList;
  subjectOf: EntityIdsList;

  constructor(inputClass: InputClass) {
    this.id = inputClass.id;
    this.labels = inputClass.labels;
    this.descriptions = inputClass.descriptions;
    this.instanceOf = inputClass.instanceOf;
    this.subclassOf = inputClass.subclassOf;
    this.propertiesForThisType = inputClass.propertiesForThisType;
    this.equivalentClass = inputClass.equivalentClass;

    this.children = [];
    this.subjectOf = [];
  }
}
