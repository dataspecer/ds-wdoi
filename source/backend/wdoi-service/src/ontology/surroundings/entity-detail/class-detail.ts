import { type EntityIdsList, type EntityId } from '../../entities/common.js';
import { type WdClass } from '../../entities/wd-class.js';
import { type WdProperty } from '../../entities/wd-property.js';
import type { Extractor } from '../../hierarchy-walker/class-hierarchy-walker.js';
import { EntityDetail } from './entity-detail.js';

export class ClassDetailReturnWrapper {
  startClass: WdClass;
  parentsIds: EntityIdsList;
  subjectOfIds: EntityIdsList;
  valueOfIds: EntityIdsList;
  surroundingClassesDesc: WdClass[];
  surroundingPropertiesDesc: WdProperty[];

  constructor(
    startClass: WdClass,
    parentsIds: EntityIdsList,
    subjectOfIds: EntityIdsList,
    valueOfIds: EntityIdsList,
    surroundingClassesDesc: WdClass[],
    surroundingPropertiesDesc: WdProperty[],
  ) {
    this.startClass = startClass;
    this.parentsIds = parentsIds;
    this.subjectOfIds = subjectOfIds;
    this.valueOfIds = valueOfIds;
    this.surroundingClassesDesc = surroundingClassesDesc;
    this.surroundingPropertiesDesc = surroundingPropertiesDesc;
  }
}

export class ClassDetailExtractor extends EntityDetail implements Extractor {
  protected readonly startClass: WdClass;

  protected readonly parentsIds: EntityId[] = [];
  protected readonly parentsIdsSet: Set<EntityId> = new Set<EntityId>();

  protected readonly subjectOfIds: EntityId[] = [];
  protected readonly subjectOfIdsSet: Set<EntityId> = new Set<EntityId>();
  protected readonly valueOfIds: EntityId[] = [];
  protected readonly valueOfIdsSet: Set<EntityId> = new Set<EntityId>();

  protected readonly surroundingClasses: WdClass[] = [];
  protected readonly classesPresentSet = new Set<EntityId>();

  protected readonly surroundingProperties: WdProperty[] = [];
  protected readonly propertiesPresentSet = new Set<EntityId>();

  protected startClassProcessed: boolean = false;

  constructor(
    startClass: WdClass,
    classes: ReadonlyMap<EntityId, WdClass>,
    properties: ReadonlyMap<EntityId, WdProperty>,
  ) {
    super(classes, properties);
    this.startClass = startClass;
  }

  extract(cls: WdClass): void {
    // Classes
    this.collectToDoubleContext(
      cls.subclassOf,
      this.contextClasses,
      this.classesPresentSet,
      this.surroundingClasses,
      this.parentsIdsSet,
      this.parentsIds,
    );

    // Properties
    this.collectToDoubleContext(
      cls.subjectOfProperty,
      this.contextProperties,
      this.propertiesPresentSet,
      this.surroundingProperties,
      this.subjectOfIdsSet,
      this.subjectOfIds,
    );
    this.collectToDoubleContext(
      cls.valueOfProperty,
      this.contextProperties,
      this.propertiesPresentSet,
      this.surroundingProperties,
      this.valueOfIdsSet,
      this.valueOfIds,
    );
  }

  public getDetail(): ClassDetailReturnWrapper {
    return new ClassDetailReturnWrapper(
      this.startClass,
      this.parentsIds,
      this.subjectOfIds,
      this.valueOfIds,
      this.surroundingClasses,
      this.surroundingProperties,
    );
  }
}
