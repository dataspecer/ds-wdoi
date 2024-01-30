import type { EntityId, EntityIdsList } from '../../entities/common';
import type { PropertyProbabilityHitMap } from '../../entities/recommendations';
import { type WdClass } from '../../entities/wd-class';
import { type ItemProperty, UnderlyingType, type WdProperty } from '../../entities/wd-property';
import { Extractor } from '../../hierarchy-walker/hierarchy-walker';
import { ClassSurroundingsExpander } from '../surroundings-expander';
import * as Timsort from 'timsort';

export class HierarchyWithPropertiesRecsReturnWrapper {
  startClass: EntityId;
  parents: EntityIdsList;
  propertyEndpoints: EntityIdsList;
  subjectOf: EntityIdsList;
  valueOf: EntityIdsList;
  classes: WdClass[];
  properties: WdProperty[];

  constructor(
    startClass: EntityId,
    parents: EntityIdsList,
    propertyEndpoints: EntityIdsList,
    subjectOf: EntityIdsList,
    valueOf: EntityIdsList,
    classes: WdClass[],
    properties: WdProperty[],
  ) {
    this.startClass = startClass;
    this.parents = parents;
    this.propertyEndpoints = propertyEndpoints;
    this.subjectOf = subjectOf;
    this.valueOf = valueOf;
    this.classes = classes;
    this.properties = properties;
  }
}

export class HierarchyWithPropertiesExtractorRecs extends Extractor {
  // Context
  private readonly contextClasses: ReadonlyMap<EntityId, WdClass>;
  private readonly contexProperties: ReadonlyMap<EntityId, WdProperty>;
  private readonly contextGlobalSubjectOfProbs: PropertyProbabilityHitMap;
  private readonly contextGlobalValueOfProbs: PropertyProbabilityHitMap;

  // Outputs
  private readonly startClass: WdClass;
  private readonly parentsIds: EntityId[] = [];
  private readonly propertyEndpointsIds: EntityId[] = [];
  private readonly subjectOfIds: EntityId[] = [];
  private readonly valueOfIds: EntityId[] = [];
  private readonly classes: WdClass[] = [];
  private readonly properties: WdProperty[] = [];

  // Markers
  private readonly subjectOfIdsMap: Map<EntityId, number> = new Map<EntityId, number>();
  private readonly valueOfIdsMap: Map<EntityId, number> = new Map<EntityId, number>();
  private readonly parentsIdsSet: Set<EntityId> = new Set<EntityId>();
  private readonly propertyEndpointsIdsSet: Set<EntityId> = new Set<EntityId>();

  constructor(
    startClass: WdClass,
    contextClasses: ReadonlyMap<EntityId, WdClass>,
    contextProperties: ReadonlyMap<EntityId, WdProperty>,
    contextGlobalSubjectOfProbs: PropertyProbabilityHitMap,
    contextGlobalValueOfProbs: PropertyProbabilityHitMap,
  ) {
    super();
    this.startClass = startClass;
    this.contextClasses = contextClasses;
    this.contexProperties = contextProperties;
    this.contextGlobalSubjectOfProbs = contextGlobalSubjectOfProbs;
    this.contextGlobalValueOfProbs = contextGlobalValueOfProbs;

    this.classes.push(startClass);
    // The start class is always part of an endpoint
    this.propertyEndpointsIds.push(startClass.id);
    this.propertyEndpointsIdsSet.add(startClass.id);
  }

  // The method never receives the same class twice.
  public extract(cls: WdClass): void {
    this.tryAddToMaterializedClasses(cls, true);
    this.processProperties(
      'subject',
      cls.subjectOfProperty,
      cls.subjectOfProbabilitiesMap,
      this.contextGlobalSubjectOfProbs,
      this.subjectOfIdsMap,
      this.subjectOfIds,
      this.valueOfIdsMap,
    );
    this.processProperties(
      'value',
      cls.valueOfProperty,
      null,
      this.contextGlobalValueOfProbs,
      this.valueOfIdsMap,
      this.valueOfIds,
      this.subjectOfIdsMap,
    );
  }

  private tryAddToMaterializedClasses(cls: WdClass, addAsParent: boolean): void {
    const isStartClass = cls.id === this.startClass.id;
    const isInParents = this.parentsIdsSet.has(cls.id);
    const isInEndpoints = this.propertyEndpointsIdsSet.has(cls.id);

    if (addAsParent) this.tryAddToMaterializedClassesAsParent(cls, isStartClass, isInParents, isInEndpoints);
    else this.tryAddToMaterializedClassesAsEndpoint(cls, isStartClass, isInParents, isInEndpoints);
  }

  private tryAddToMaterializedClassesAsParent(cls: WdClass, isStartClass: boolean, isInParents: boolean, isInEndpoints: boolean): void {
    if (!isStartClass && !isInParents) {
      this.parentsIds.push(cls.id);
      this.parentsIdsSet.add(cls.id);
      if (!isInEndpoints) {
        this.classes.push(cls);
      }
    }
  }

  private tryAddToMaterializedClassesAsEndpoint(cls: WdClass, isStartClass: boolean, isInParents: boolean, isInEndpoints: boolean): void {
    if (!isInEndpoints) {
      this.propertyEndpointsIds.push(cls.id);
      this.propertyEndpointsIdsSet.add(cls.id);
      if (!isInParents && !isStartClass) {
        this.classes.push(cls);
      }
    }
  }

  private processProperties(
    type: 'subject' | 'value',
    propertyIds: EntityIdsList,
    localPropMap: PropertyProbabilityHitMap | null,
    globalPropMap: PropertyProbabilityHitMap,
    propsMarker: Map<EntityId, number>,
    propsStorage: EntityId[],
    propsOppositeMarker: Map<EntityId, number>,
  ): void {
    for (const propertyId of propertyIds) {
      const propertyProbValue = this.getPropertyProbValue(propertyId, localPropMap, globalPropMap);
      if (!propsMarker.has(propertyId)) {
        propsMarker.set(propertyId, propertyProbValue);
        propsStorage.push(propertyId);
        const property = this.contexProperties.get(propertyId) as WdProperty;
        this.processEndpoints(property, type);
        if (!propsOppositeMarker.has(propertyId)) {
          this.properties.push(property);
        }
      } else this.tryExchangeProbsInMarkers(propertyId, propertyProbValue, propsMarker);
    }
  }

  private tryExchangeProbsInMarkers(propertyId: EntityId, newProbValue: number, marker: Map<EntityId, number>): void {
    const currentProbValue = marker.get(propertyId) as number;
    if (currentProbValue < newProbValue) {
      marker.set(propertyId, newProbValue);
    }
  }

  private getPropertyProbValue(
    propertyId: EntityId,
    localPropMap: PropertyProbabilityHitMap | null,
    globalProbMap: PropertyProbabilityHitMap,
  ): number {
    if (localPropMap != null && localPropMap.has(propertyId)) {
      return localPropMap.get(propertyId) as number;
    } else {
      return globalProbMap.get(propertyId) as number;
    }
  }

  private processEndpoints(property: WdProperty, type: 'subject' | 'value'): void {
    if (type === 'subject') this.processSubjectOfEndpoints(property);
    else if (type === 'value') this.processValueOfEndpoints(property);
    else throw new Error('Invalid type of endpoints.');
  }

  // If the class is subject of a property, we want to extract the value types which will be used as outgoing edges.
  private processSubjectOfEndpoints(property: WdProperty): void {
    if (property.underlyingType === UnderlyingType.ENTITY) {
      const itemProp = property as ItemProperty;
      const valueType = itemProp.itemConstraints.valueType;
      this.tryMaterializeEndpoints(valueType.instanceOf);
      this.tryMaterializeEndpoints(valueType.subclassOfInstanceOf);
    }
  }

  // If the class is value of a property, we want to extract the subject types which will be used as incoming edges.
  private processValueOfEndpoints(property: WdProperty): void {
    const subjectType = property.generalConstraints.subjectType;
    this.tryMaterializeEndpoints(subjectType.instanceOf);
    this.tryMaterializeEndpoints(subjectType.subclassOfInstanceOf);
  }

  private tryMaterializeEndpoints(clsIds: EntityIdsList): void {
    for (const clsId of clsIds) {
      this.tryAddToMaterializedClasses(this.contextClasses.get(clsId) as WdClass, false);
    }
  }

  public getResult(): HierarchyWithPropertiesRecsReturnWrapper {
    Timsort.sort(this.subjectOfIds, (a, b) => (this.subjectOfIdsMap.get(b) as number) - (this.subjectOfIdsMap.get(a) as number));
    Timsort.sort(this.valueOfIds, (a, b) => (this.valueOfIdsMap.get(b) as number) - (this.valueOfIdsMap.get(a) as number));
    return new HierarchyWithPropertiesRecsReturnWrapper(
      this.startClass.id,
      this.parentsIds,
      this.propertyEndpointsIds,
      this.subjectOfIds,
      this.valueOfIds,
      this.classes,
      this.properties,
    );
  }
}

export class HierarchyWithPropertiesExpanderRecs extends ClassSurroundingsExpander {
  public getSurroundings(propertyHierarchyExtractor: HierarchyWithPropertiesExtractorRecs): HierarchyWithPropertiesRecsReturnWrapper {
    const resultWrapper = propertyHierarchyExtractor.getResult();
    return resultWrapper;
  }
}
