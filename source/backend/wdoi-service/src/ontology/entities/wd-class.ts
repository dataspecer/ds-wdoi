import type { EntityIdsList, ExternalOntologyMapping, PropertyProbabilityHitList, PropertyProbabilityHitMap } from './common';
import type { InputClass } from '../loading/input/input-class';
import type { ModifierClassVisitor, ModifierVisitableClass } from '../post-loading/modifiers';
import { WdEntity } from './wd-entity';
import { createProbMap } from '../utils/create-prob-map';

export const ROOT_CLASS_ID = 35120;

export class WdClass extends WdEntity implements ModifierVisitableClass {
  private static readonly URIType = 'Q';
  readonly subclassOf: EntityIdsList;
  readonly children: EntityIdsList;
  readonly propertiesForThisType: EntityIdsList;
  readonly equivalentExternalOntologyClasses: ExternalOntologyMapping;
  readonly valueOfProperty: EntityIdsList;
  readonly subjectOfProperty: EntityIdsList;
  readonly subjectOfProbabilities: PropertyProbabilityHitList;
  readonly subjectOfProbabilitiesMap: PropertyProbabilityHitMap;

  static {
    super.entityURITypes.add(this.URIType);
  }

  constructor(inputClass: InputClass) {
    super(inputClass);
    this.subclassOf = inputClass.subclassOf;
    this.children = inputClass.children;
    this.equivalentExternalOntologyClasses = inputClass.equivalentClass;
    this.propertiesForThisType = inputClass.propertiesForThisType;
    this.valueOfProperty = inputClass.valueOf;
    this.subjectOfProperty = inputClass.subjectOf;
    this.subjectOfProbabilities = inputClass.subjectOfProbs;
    this.subjectOfProbabilitiesMap = createProbMap(inputClass.subjectOfProbs);
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
