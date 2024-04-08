import type { EntityIdsList, ExternalOntologyMapping, PropertyScoreRecord, PropertyScoreRecordMap } from './common.js';
import type { InputClass } from '../loading/input/input-class.js';
import { WdEntity } from './wd-entity.js';
import { createPropertyScoreRecordMap } from '../loading/load-property-recommendations.js';
import { emptyEntitiesIdsListOrSave, emptyExternalMappingsListOrSave, emptyPropertyScoreRecordMapOrSave } from './empty-type-constants.js';
import { type WdProperty } from './wd-property.js';

export const ROOT_CLASS_ID = 35120;

export class WdClass extends WdEntity {
  private static readonly URIType = 'Q';
  readonly subclassOf: EntityIdsList;
  readonly children: EntityIdsList;
  readonly equivalentExternalOntologyClasses: ExternalOntologyMapping;

  // readonly instances: EntityIdsList;
  // readonly propertiesForThisType: EntityIdsList;

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
    this.equivalentExternalOntologyClasses = emptyExternalMappingsListOrSave(inputClass.equivalentClass);

    // this.instances = emptyEntitiesIdsListOrSave(inputClass.instances);
    // this.propertiesForThisType = emptyEntitiesIdsListOrSave(inputClass.propertiesForThisType);

    this.subjectOfProperty = emptyEntitiesIdsListOrSave(inputClass.subjectOfStats);
    this.subjectOfPropertyScoresMap = emptyPropertyScoreRecordMapOrSave(createPropertyScoreRecordMap(inputClass.subjectOfStatsScores));

    this.valueOfProperty = emptyEntitiesIdsListOrSave(inputClass.valueOfStats);
    this.valueOfPropertyScoresMap = emptyPropertyScoreRecordMapOrSave(createPropertyScoreRecordMap(inputClass.valueOfStatsScores));
  }

  static isRootClass(cls: WdClass): boolean {
    return cls.id === ROOT_CLASS_ID;
  }

  public static isURIType(entityType: string): boolean {
    return entityType === WdClass.URIType;
  }

  public getDomainsPropertyScoreRecord(property: WdProperty): PropertyScoreRecord | undefined {
    return this.valueOfPropertyScoresMap.get(property.id);
  }

  public getRangesPropertyScoreRecord(property: WdProperty): PropertyScoreRecord | undefined {
    return this.subjectOfPropertyScoresMap.get(property.id);
  }
}
