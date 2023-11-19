import type { EntityId, EntityIdsList } from '../entities/common';
import { type WdClass } from '../entities/wd-class';
import type { WdEntity } from '../entities/wd-entity';
import { type ItemProperty, UnderlyingType, type WdProperty } from '../entities/wd-property';
import { Extractor } from '../hierarchy-walker/hierarchy-walker';
import { SurroundingsExpander } from './surroundings-expander';

export class ClassSurroundingsReturnWrapper {
  root: WdClass;
  parents: WdClass[];
  children: WdClass[];
  subjectOf: WdProperty[];
  valueOf: WdProperty[];
  propertyEndpoints: WdClass[];

  constructor(root: WdClass, parents: WdClass[], children: WdClass[], subjectOf: WdProperty[], valueOf: WdProperty[], propertyEndpoints: WdClass[]) {
    this.root = root;
    this.parents = parents;
    this.children = children;
    this.subjectOf = subjectOf;
    this.valueOf = valueOf;
    this.propertyEndpoints = propertyEndpoints;
  }
}

export class PropertyHierarchyExtractor extends Extractor {
  private readonly rootClass: WdClass;
  private readonly classes: ReadonlyMap<EntityId, WdClass>;
  private readonly properties: ReadonlyMap<EntityId, WdProperty>;
  private readonly subjectOf: WdProperty[] = [];
  private readonly valueOf: WdProperty[] = [];
  private readonly propertyEndpoints: WdClass[] = [];
  private readonly subjectOfSet: Set<EntityId> = new Set<EntityId>();
  private readonly valueOfSet: Set<EntityId> = new Set<EntityId>();
  private readonly propertySetEndpointsSet: Set<EntityId> = new Set<EntityId>();

  constructor(rootClass: WdClass, classes: ReadonlyMap<EntityId, WdClass>, properties: ReadonlyMap<EntityId, WdProperty>) {
    super();
    this.rootClass = rootClass;
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
      this.materializeOnMissing(
        itemProp.itemConstraints.valueType.instanceOf,
        this.propertySetEndpointsSet,
        this.propertyEndpoints,
        this.classes,
        'class',
      );
      this.materializeOnMissing(
        itemProp.itemConstraints.valueType.subclassOfInstanceOf,
        this.propertySetEndpointsSet,
        this.propertyEndpoints,
        this.classes,
        'class',
      );
    }
  }

  // If the class is value of a property, we want to extract the subject types which will be used as incoming edges.
  private processValueOf(wdEntity: WdEntity): void {
    const prop = wdEntity as WdProperty;
    this.materializeOnMissing(
      prop.generalConstraints.subjectType.instanceOf,
      this.propertySetEndpointsSet,
      this.propertyEndpoints,
      this.classes,
      'class',
    );
    this.materializeOnMissing(
      prop.generalConstraints.subjectType.subclassOfInstanceOf,
      this.propertySetEndpointsSet,
      this.propertyEndpoints,
      this.classes,
      'class',
    );
  }

  public extract(cls: WdClass): void {
    this.materializeOnMissing(cls.subjectOfProperty, this.subjectOfSet, this.subjectOf, this.properties, 'subject');
    this.materializeOnMissing(cls.valueOfProperty, this.valueOfSet, this.valueOf, this.properties, 'value');
  }

  public getResult(): [WdProperty[], WdProperty[], WdClass[]] {
    return [this.subjectOf, this.valueOf, this.propertyEndpoints];
  }
}

export class ClassSurroundingsExpander extends SurroundingsExpander {
  public getSurroundings(startClass: WdClass, propertyHierarchyExtractor: PropertyHierarchyExtractor): ClassSurroundingsReturnWrapper {
    const parents = this.getParents(startClass);
    const children = this.getChildren(startClass);
    const [subjectOf, valueOf, endpoints] = propertyHierarchyExtractor.getResult();
    return new ClassSurroundingsReturnWrapper(startClass, parents, children, subjectOf, valueOf, endpoints);
  }
}
