import type { EntityIdsList, ExternalOntologyMapping } from './common';
import type { InputClass } from '../loading/input/input-class';
import type { ModifierClassVisitor, ModifierVisitableClass } from '../post-loading/modifiers';
import { WdEntity } from './wd-entity';

export const ROOT_CLASS_ID = 35120;

export class WdClass extends WdEntity implements ModifierVisitableClass {
  private static readonly URIType = 'Q';
  readonly subclassOf: EntityIdsList;
  readonly children: EntityIdsList;
  readonly propertiesForThisType: EntityIdsList;
  readonly equivalentExternalOntologyClasses: ExternalOntologyMapping;
  readonly subjectOfProperty: EntityIdsList;
  readonly valueOfProperty: EntityIdsList;

  static {
    super.entityURITypes.add(this.URIType);
  }

  constructor(inputClass: InputClass) {
    super(inputClass);
    this.subclassOf = inputClass.subclassOf;
    this.children = inputClass.children;
    this.equivalentExternalOntologyClasses = inputClass.equivalentClass;
    this.propertiesForThisType = inputClass.propertiesForThisType;
    this.subjectOfProperty = inputClass.subjectOf;
    this.valueOfProperty = inputClass.valueOf;
  }

  accept(visitor: ModifierClassVisitor): void {
    visitor.visitWdClass(this);
  }

  static isRootClass(cls: WdClass): boolean {
    return cls.id === ROOT_CLASS_ID;
  }

  public static isURIType(entityType: string): boolean {
    return entityType === WdClass.URIType;
  }
}
