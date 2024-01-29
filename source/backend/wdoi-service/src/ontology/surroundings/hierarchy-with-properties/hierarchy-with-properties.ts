import type { EntityId, EntityIdsList } from '../../entities/common';
import { type WdClass } from '../../entities/wd-class';
import type { WdEntity } from '../../entities/wd-entity';
import { type ItemProperty, UnderlyingType, type WdProperty } from '../../entities/wd-property';
import { Extractor } from '../../hierarchy-walker/hierarchy-walker';
import { ClassSurroundingsExpander } from '../surroundings-expander';

export class HierarchyWithPropertiesReturnWrapper {
  startClass: WdClass;
  parents: WdClass[];
  children: WdClass[];
  subjectOf: WdProperty[];
  valueOf: WdProperty[];
  propertyEndpoints: WdClass[];

  constructor(
    startClass: WdClass,
    parents: WdClass[],
    children: WdClass[],
    subjectOf: WdProperty[],
    valueOf: WdProperty[],
    propertyEndpoints: WdClass[],
  ) {
    this.startClass = startClass;
    this.parents = parents;
    this.children = children;
    this.subjectOf = subjectOf;
    this.valueOf = valueOf;
    this.propertyEndpoints = propertyEndpoints;
  }
}

export class HierarchyWithPropertiesExtractor extends Extractor {
  private readonly startClass: WdClass;
  private readonly classes: ReadonlyMap<EntityId, WdClass>;
  private readonly properties: ReadonlyMap<EntityId, WdProperty>;
  private readonly subjectOf: WdProperty[] = [];
  private readonly valueOf: WdProperty[] = [];
  private readonly propertyEndpoints: WdClass[] = [];
  private readonly subjectOfSet: Set<EntityId> = new Set<EntityId>();
  private readonly valueOfSet: Set<EntityId> = new Set<EntityId>();
  private readonly propertySetEndpointsSet: Set<EntityId> = new Set<EntityId>();

  constructor(startClass: WdClass, classes: ReadonlyMap<EntityId, WdClass>, properties: ReadonlyMap<EntityId, WdProperty>) {
    super();
    this.startClass = startClass;
    this.classes = classes;
    this.properties = properties;
  }

  private materializeOnMissing(
    entityIds: EntityIdsList,
    set: Set<EntityId>,
    storage: WdEntity[],
    context: ReadonlyMap<EntityId, WdEntity>,
    type: 'subject' | 'value' | 'class',
  ): void {
    for (const id of entityIds) {
      if (!(id in set)) {
        set.add(id);
        const entity = context.get(id) as WdEntity;
        storage.push(entity);
        this.process(entity, type);
      }
    }
  }

  private process(wdEntity: WdEntity, type: 'subject' | 'value' | 'class'): void {
    if (type === 'subject') this.processSubjectOf(wdEntity);
    else if (type === 'value') this.processValueOf(wdEntity);
  }

  // If the class is subject of a property, we want to extract the value types which will be used as outgoing edges.
  private processSubjectOf(wdEntity: WdEntity): void {
    const prop = wdEntity as WdProperty;
    if (prop.underlyingType === UnderlyingType.ENTITY) {
      const itemProp = prop as ItemProperty;
      const valueType = itemProp.itemConstraints.valueType;
      this.materializeOnMissing(valueType.instanceOf, this.propertySetEndpointsSet, this.propertyEndpoints, this.classes, 'class');
      this.materializeOnMissing(valueType.subclassOfInstanceOf, this.propertySetEndpointsSet, this.propertyEndpoints, this.classes, 'class');
    }
  }

  // If the class is value of a property, we want to extract the subject types which will be used as incoming edges.
  private processValueOf(wdEntity: WdEntity): void {
    const prop = wdEntity as WdProperty;
    const subjectType = prop.generalConstraints.subjectType;
    this.materializeOnMissing(subjectType.instanceOf, this.propertySetEndpointsSet, this.propertyEndpoints, this.classes, 'class');
    this.materializeOnMissing(subjectType.subclassOfInstanceOf, this.propertySetEndpointsSet, this.propertyEndpoints, this.classes, 'class');
  }

  // The method never receives the same class twice
  public extract(cls: WdClass): void {
    this.materializeOnMissing(cls.subjectOfProperty, this.subjectOfSet, this.subjectOf, this.properties, 'subject');
    this.materializeOnMissing(cls.valueOfProperty, this.valueOfSet, this.valueOf, this.properties, 'value');
  }

  public getResult(): [WdClass, WdProperty[], WdProperty[], WdClass[]] {
    return [this.startClass, this.subjectOf, this.valueOf, this.propertyEndpoints];
  }
}

export class HierarchyWithPropertiesExpander extends ClassSurroundingsExpander {
  public getSurroundings(propertyHierarchyExtractor: HierarchyWithPropertiesExtractor): HierarchyWithPropertiesReturnWrapper {
    const parents: WdClass[] = []; // this.getParents(startClass);
    const children: WdClass[] = []; // this.getChildren(startClass);
    const [startClass, subjectOf, valueOf, endpoints] = propertyHierarchyExtractor.getResult();
    return new HierarchyWithPropertiesReturnWrapper(startClass, parents, children, subjectOf, valueOf, endpoints);
  }
}
