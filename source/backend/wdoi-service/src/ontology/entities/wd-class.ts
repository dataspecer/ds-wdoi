import type { EntityIdsList, ExternalOntologyMapping } from './common';
import type { InputClass } from '../loading/input/input-class';
import type { ModifierClassVisitor, ModifierVisitableClass } from '../post-loading/modifiers';
import { WdEntity } from './wd-entity';

export const ROOT_CLASS_ID = 35120;

export class WdClass extends WdEntity implements ModifierVisitableClass {
  readonly subclassOf: EntityIdsList;
  readonly children: EntityIdsList;
  readonly propertiesForThisType: EntityIdsList;
  readonly equivalentExternalOntologyClasses: ExternalOntologyMapping;
  readonly subjectOfProperty: EntityIdsList;
  readonly valueOfProperty: EntityIdsList;

  constructor(inputClass: InputClass) {
    super(inputClass);
    this.subclassOf = inputClass.subclassOf;
    this.children = [];
    this.equivalentExternalOntologyClasses = inputClass.equivalentClass;
    this.propertiesForThisType = inputClass.propertiesForThisType;
    this.subjectOfProperty = [];
    this.valueOfProperty = [];
  }

  accept(visitor: ModifierClassVisitor): void {
    visitor.visitWdClass(this);
  }

  static isRootClass(cls: WdClass): boolean {
    return cls.id === ROOT_CLASS_ID;
  }
}
