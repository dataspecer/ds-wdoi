import type { EntityIdsList, ExternalOntologyMapping, PropertyScoreRecordMap } from './common';
import type { InputClass } from '../loading/input/input-class';
import type { ModifierClassVisitor, ModifierVisitableClass } from '../post-loading/modifiers';
import { WdEntity } from './wd-entity';
import { createPropertyScoreRecordMap } from '../loading/load-property-recommendations';
import { emptyEntitiesIdsListOrSave, emptyExternalMappingsListOrSave, emptyPropertyScoreRecordMapOrSave } from './empty-type-constants';

export const ROOT_CLASS_ID = 35120;

export class WdClass extends WdEntity implements ModifierVisitableClass {
  private static readonly URIType = 'Q';
  readonly subclassOf: EntityIdsList;
  readonly children: EntityIdsList;
  readonly instances: EntityIdsList;
  readonly propertiesForThisType: EntityIdsList;
  readonly equivalentExternalOntologyClasses: ExternalOntologyMapping;

  readonly valueOfProperty: EntityIdsList;
  readonly subjectOfProperty: EntityIdsList;

  readonly subjectOfPropertyStats: EntityIdsList;
  readonly subjectOfPropertyStatsScoresMap: PropertyScoreRecordMap;

  readonly valueOfPropertyStats: EntityIdsList;
  readonly valueOfPropertyStatsScoresMap: PropertyScoreRecordMap;

  static {
    super.entityURITypes.add(this.URIType);
  }

  constructor(inputClass: InputClass) {
    super(inputClass);
    this.subclassOf = emptyEntitiesIdsListOrSave(inputClass.subclassOf);
    this.children = emptyEntitiesIdsListOrSave(inputClass.children);
    this.instances = emptyEntitiesIdsListOrSave(inputClass.instances);
    this.equivalentExternalOntologyClasses = emptyExternalMappingsListOrSave(inputClass.equivalentClass);
    this.propertiesForThisType = emptyEntitiesIdsListOrSave(inputClass.propertiesForThisType);

    this.valueOfProperty = emptyEntitiesIdsListOrSave(inputClass.valueOf);
    this.subjectOfProperty = emptyEntitiesIdsListOrSave(inputClass.subjectOf);

    this.subjectOfPropertyStats = emptyEntitiesIdsListOrSave(inputClass.subjectOfStats);
    this.subjectOfPropertyStatsScoresMap = emptyPropertyScoreRecordMapOrSave(createPropertyScoreRecordMap(inputClass.subjectOfStatsScores));

    this.valueOfPropertyStats = inputClass.valueOfStats;
    this.valueOfPropertyStatsScoresMap = emptyPropertyScoreRecordMapOrSave(createPropertyScoreRecordMap(inputClass.valueOfStatsScores));
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
