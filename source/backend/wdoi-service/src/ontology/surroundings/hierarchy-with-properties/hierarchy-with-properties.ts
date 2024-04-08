import type { EntityId, EntityIdsList, PropertyScoreRecord, PropertyScoreRecordMap } from '../../entities/common.js';
import { type WdClass } from '../../entities/wd-class.js';
import { type WdProperty } from '../../entities/wd-property.js';
import { Extractor } from '../../hierarchy-walker/hierarchy-walker.js';
import * as Timsort from 'timsort';

export class HierarchyWithPropertiesReturnWrapper {
  startClass: EntityId;
  parents: EntityIdsList;
  subjectOf: EntityIdsList;
  valueOf: EntityIdsList;
  classes: WdClass[];
  properties: WdProperty[];

  constructor(
    startClass: EntityId,
    parents: EntityIdsList,
    subjectOf: EntityIdsList,
    valueOf: EntityIdsList,
    classes: WdClass[],
    properties: WdProperty[],
  ) {
    this.startClass = startClass;
    this.parents = parents;
    this.subjectOf = subjectOf;
    this.valueOf = valueOf;
    this.classes = classes;
    this.properties = properties;
  }
}

export abstract class HierarchyWithPropertiesExtractor extends Extractor {
  // Context
  protected readonly contextClasses: ReadonlyMap<EntityId, WdClass>;
  protected readonly contexProperties: ReadonlyMap<EntityId, WdProperty>;

  // Outputs
  private readonly startClass: WdClass;
  private readonly parentsIds: EntityId[] = [];
  protected readonly subjectOfIds: EntityId[] = [];
  protected readonly valueOfIds: EntityId[] = [];
  private readonly classes: WdClass[] = [];
  private readonly properties: WdProperty[] = [];

  // Markers
  private isStartClassProcessed: boolean;
  protected readonly subjectOfIdsMap: Map<EntityId, number> = new Map<EntityId, number>();
  protected readonly valueOfIdsMap: Map<EntityId, number> = new Map<EntityId, number>();
  private readonly parentsIdsSet: Set<EntityId> = new Set<EntityId>();
  private readonly classesIdsSet: Set<EntityId> = new Set<EntityId>();

  constructor(startClass: WdClass, contextClasses: ReadonlyMap<EntityId, WdClass>, contextProperties: ReadonlyMap<EntityId, WdProperty>) {
    super();
    this.startClass = startClass;
    this.contextClasses = contextClasses;
    this.contexProperties = contextProperties;

    this.classes.push(startClass);
    this.classesIdsSet.add(startClass.id);
    this.isStartClassProcessed = false;
  }

  protected abstract extract_internal(cls: WdClass): void;

  // The method should never receive the same parent class twice.
  // The start class is always the first one seen.
  public extract(cls: WdClass): void {
    if (this.isStartClassProcessed && !this.tryAddToParents(cls)) return;
    if (!this.isStartClassProcessed) this.isStartClassProcessed = true;

    this.extract_internal(cls);
  }

  private tryAddToParents(cls: WdClass): boolean {
    if (!this.parentsIdsSet.has(cls.id)) {
      this.parentsIdsSet.add(cls.id);
      this.parentsIds.push(cls.id);
      this.tryAddToMaterializedClasses(cls);
      return true;
    } else return false;
  }

  private tryAddToMaterializedClasses(cls: WdClass): boolean {
    if (!this.classesIdsSet.has(cls.id)) {
      this.classesIdsSet.add(cls.id);
      this.classes.push(cls);
      return true;
    } else return false;
  }

  protected processProperties(
    type: 'subject' | 'value',
    propertyIds: EntityIdsList,
    localPropMap: PropertyScoreRecordMap | null,
    propsMarker: Map<EntityId, number>,
    propsStorage: EntityId[],
    propsOppositeMarker: Map<EntityId, number>,
  ): void {
    for (const propertyId of propertyIds) {
      const propertyScore = this.getPropertyScoreValue(propertyId, localPropMap);
      if (!propsMarker.has(propertyId)) {
        propsMarker.set(propertyId, propertyScore);
        propsStorage.push(propertyId);
        const property = this.contexProperties.get(propertyId) as WdProperty;
        if (!propsOppositeMarker.has(propertyId)) {
          this.properties.push(property);
        }
      } else this.tryExchangeScoreInMarkers(propertyId, propertyScore, propsMarker);
    }
  }

  private tryExchangeScoreInMarkers(propertyId: EntityId, newScore: number, marker: Map<EntityId, number>): void {
    const currentScore = marker.get(propertyId) as number;
    if (currentScore < newScore) {
      marker.set(propertyId, newScore);
    }
  }

  private getPropertyScoreValue(propertyId: EntityId, localPropMap: PropertyScoreRecordMap | null): number {
    if (localPropMap != null && localPropMap.has(propertyId)) {
      const propertyScoreRecord = localPropMap.get(propertyId) as PropertyScoreRecord;
      return propertyScoreRecord.score;
    } else {
      return 0;
    }
  }

  public getResult(): HierarchyWithPropertiesReturnWrapper {
    this.finalize_results();
    return new HierarchyWithPropertiesReturnWrapper(
      this.startClass.id,
      this.parentsIds,
      this.subjectOfIds,
      this.valueOfIds,
      this.classes,
      this.properties,
    );
  }

  protected finalize_results(): void {
    Timsort.sort(this.subjectOfIds, (a, b) => (this.subjectOfIdsMap.get(b) as number) - (this.subjectOfIdsMap.get(a) as number));
    Timsort.sort(this.valueOfIds, (a, b) => (this.valueOfIdsMap.get(b) as number) - (this.valueOfIdsMap.get(a) as number));
  }
}

export class HierarchyWithPropertiesCombinedUsageStatisticsAndConstraintsExtractor extends HierarchyWithPropertiesExtractor {
  protected extract_internal(cls: WdClass): void {
    this.processProperties(
      'subject',
      cls.subjectOfProperty,
      cls.subjectOfPropertyScoresMap,
      this.subjectOfIdsMap,
      this.subjectOfIds,
      this.valueOfIdsMap,
    );
    this.processProperties('value', cls.valueOfProperty, cls.valueOfPropertyScoresMap, this.valueOfIdsMap, this.valueOfIds, this.subjectOfIdsMap);
  }
}
