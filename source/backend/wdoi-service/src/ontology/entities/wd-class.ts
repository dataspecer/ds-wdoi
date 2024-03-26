import type { EntityIdsList, ExternalOntologyMapping, PropertyScoreRecord, PropertyScoreRecordMap } from './common';
import type { InputClass } from '../loading/input/input-class';
import type { ModifierClassVisitor, ModifierVisitableClass } from '../post-loading/modifiers';
import { WdEntity } from './wd-entity';
import { createPropertyScoreRecordMap } from '../loading/load-property-recommendations';
import { emptyEntitiesIdsListOrSave, emptyExternalMappingsListOrSave, emptyPropertyScoreRecordMapOrSave } from './empty-type-constants';
import { type WdProperty } from './wd-property';

export const ROOT_CLASS_ID = 35120;

export class WdClass extends WdEntity implements ModifierVisitableClass {
  private static readonly URIType = 'Q';
  readonly subclassOf: EntityIdsList;
  readonly children: EntityIdsList;
  readonly instances: EntityIdsList;
  readonly propertiesForThisType: EntityIdsList;
  readonly equivalentExternalOntologyClasses: ExternalOntologyMapping;

  readonly subjectOfProperty: EntityIdsList;
  readonly subjectOfPropertyScoresMap: PropertyScoreRecordMap;

  readonly valueOfProperty: EntityIdsList;
  readonly valueOfPropertyScoresMap: PropertyScoreRecordMap;

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

    this.subjectOfProperty = emptyEntitiesIdsListOrSave(inputClass.subjectOfStats);
    this.subjectOfPropertyScoresMap = emptyPropertyScoreRecordMapOrSave(createPropertyScoreRecordMap(inputClass.subjectOfStatsScores));

    this.valueOfProperty = emptyEntitiesIdsListOrSave(inputClass.valueOfStats);
    this.valueOfPropertyScoresMap = emptyPropertyScoreRecordMapOrSave(createPropertyScoreRecordMap(inputClass.valueOfStatsScores));
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

  public getDomainsForProperty(property: WdProperty): EntityIdsList {
    const propertyScoreRecord = this.valueOfPropertyScoresMap.get(property.id);
    if (propertyScoreRecord != null) {
      return propertyScoreRecord.range;
    }
    return [];
  }

  public getDomainsPropertyScoreRecord(property: WdProperty): PropertyScoreRecord | undefined {
    return this.valueOfPropertyScoresMap.get(property.id);
  }

  public getRangesForProperty(property: WdProperty): EntityIdsList {
    const propertyScoreRecord = this.subjectOfPropertyScoresMap.get(property.id);
    if (propertyScoreRecord != null) {
      return propertyScoreRecord.range;
    }
    return [];
  }

  public getRangesPropertyScoreRecord(property: WdProperty): PropertyScoreRecord | undefined {
    return this.subjectOfPropertyScoresMap.get(property.id);
  }
}
