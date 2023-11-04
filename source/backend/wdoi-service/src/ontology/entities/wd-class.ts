import type { EntityId, EntityIdsList, ExternalOntologyMapping } from './common';
import type { InputClass } from '../loading/input/input-class';
import type { ModifierClassVisitor, ModifierVisitableClass } from '../post-loading/modifiers';
import { WdEntity } from './wd-entity';

export const ROOT_CLASS_ID = 35120;

export class WdClass extends WdEntity implements ModifierVisitableClass {
  parents: EntityIdsList;
  children: EntityIdsList;
  propertiesForThisType: EntityIdsList;
  equivalentExternalOntologyClasses: ExternalOntologyMapping;
  subjectOfProperty: EntityIdsList;
  valueOfProperty: EntityIdsList;

  constructor(inputClass: InputClass) {
    super(inputClass);
    this.parents = inputClass.subclassOf;
    this.children = [];
    this.equivalentExternalOntologyClasses = inputClass.equivalentClass;
    this.propertiesForThisType = inputClass.propertiesForThisType;
    this.subjectOfProperty = [];
    this.valueOfProperty = [];
  }

  addParent(entityId: EntityId): boolean {
    return this.addIfUnique<EntityId>(entityId, this.parents);
  }

  addChild(entityId: EntityId): boolean {
    return this.addIfUnique<EntityId>(entityId, this.children);
  }

  addSubjectOf(entityId: EntityId): boolean {
    return this.addIfUnique<EntityId>(entityId, this.subjectOfProperty);
  }

  addValueOf(entityId: EntityId): boolean {
    return this.addIfUnique<EntityId>(entityId, this.valueOfProperty);
  }

  accept(visitor: ModifierClassVisitor): void {
    visitor.visitWdClass(this);
  }

  static isRootClass(cls: WdClass): boolean {
    return cls.id === ROOT_CLASS_ID;
  }
}
