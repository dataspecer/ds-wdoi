import type { EntityId, EntityIdsList, ExternalOntologyMapping, LanguageMap } from './common';
import type { InputClass } from '../loading/input/input-class';

export const ROOT_CLASS_ID = 35120;

export class WdClass {
  readonly id: EntityId;
  readonly labels: LanguageMap;
  readonly descriptions: LanguageMap;
  readonly instanceOf: EntityIdsList;
  readonly subclassOf: EntityIdsList;
  readonly propertiesForThisType: EntityIdsList;
  readonly equivalentClass: ExternalOntologyMapping;

  readonly children: EntityIdsList;
  readonly subjectOf: EntityIdsList;

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
