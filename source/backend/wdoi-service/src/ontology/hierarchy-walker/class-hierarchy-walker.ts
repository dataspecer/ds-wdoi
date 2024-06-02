import { Queue } from '../utils/queue.js';
import { type EntityIdsList, type EntityId } from '../entities/common.js';
import { type WdClass } from '../entities/wd-class.js';
import { type WdProperty } from '../entities/wd-property.js';

export type ClassHierarchyWalkerParts = 'full' | 'parents' | 'children';

export class ClassHierarchyReturnWrapper {
  public readonly startClassId: EntityId;
  public readonly parentsIds: EntityIdsList;
  public readonly childrenIds: EntityIdsList;
  public readonly classes: WdClass[];

  constructor(
    startClassId: EntityId,
    parentsIds: EntityIdsList,
    childrenIds: EntityIdsList,
    classes: WdClass[],
  ) {
    this.startClassId = startClassId;
    this.parentsIds = parentsIds;
    this.childrenIds = childrenIds;
    this.classes = classes;
  }
}

export interface Extractor {
  extract: (cls: WdClass) => void;
}

export class HierarchyClassesExtractor implements Extractor {
  private readonly classesIdsSet: Set<EntityId> = new Set<EntityId>();
  private readonly classes: WdClass[] = [];

  constructor(startClass: WdClass) {
    this.classesIdsSet.add(startClass.id);
    this.classes.push(startClass);
  }

  extract(cls: WdClass): void {
    if (!this.classesIdsSet.has(cls.id)) {
      this.classesIdsSet.add(cls.id);
      this.classes.push(cls);
    }
  }

  public getResults(): WdClass[] {
    return this.classes;
  }
}

export class ClassHierarchyWalker {
  protected readonly contextClasses: ReadonlyMap<EntityId, WdClass>;
  protected readonly contextProperties: ReadonlyMap<EntityId, WdProperty>;

  constructor(
    contextClasses: ReadonlyMap<EntityId, WdClass>,
    contextProperties: ReadonlyMap<EntityId, WdProperty>,
  ) {
    this.contextClasses = contextClasses;
    this.contextProperties = contextProperties;
  }

  protected getChildrenExtractor(cls: WdClass): EntityIdsList {
    return cls.children;
  }

  protected getParentsExtractor(cls: WdClass): EntityIdsList {
    return cls.subclassOf;
  }

  protected walkHierarchy(
    startClass: WdClass,
    nextValueExtractor: (cls: WdClass) => EntityIdsList,
    publicExtractor: Extractor | undefined,
  ): EntityIdsList {
    const visitedClassesIds = new Set<EntityId>();
    const queue = new Queue<EntityIdsList>();
    const returnClassesIds: EntityId[] = [];

    // Init
    // Note: Do not add start class to return values, since the api will add it separately to return object.
    // Note: The main cycle with get from map should never return null.
    visitedClassesIds.add(startClass.id);
    queue.enqueue(nextValueExtractor(startClass));

    publicExtractor?.extract(startClass);

    while (!queue.isEmpty()) {
      const nextClassIds = queue.dequeue();
      for (const classId of nextClassIds) {
        if (!visitedClassesIds.has(classId)) {
          const cls = this.contextClasses.get(classId) as WdClass;
          visitedClassesIds.add(classId);
          queue.enqueue(nextValueExtractor(cls));
          returnClassesIds.push(cls.id);
          publicExtractor?.extract(cls);
        }
      }
    }

    return returnClassesIds;
  }

  protected walkParentHierarchy(
    startClass: WdClass,
    publicExtractor: Extractor | undefined = undefined,
  ): EntityIdsList {
    return this.walkHierarchy(startClass, this.getParentsExtractor, publicExtractor);
  }

  protected walkChildrenHierarchy(
    startClass: WdClass,
    publicExtractor: Extractor | undefined = undefined,
  ): EntityIdsList {
    return this.walkHierarchy(startClass, this.getChildrenExtractor, publicExtractor);
  }

  public getHierarchy(
    startClass: WdClass,
    part: ClassHierarchyWalkerParts,
  ): ClassHierarchyReturnWrapper {
    const hierarchyClassesExtractor = new HierarchyClassesExtractor(startClass);
    let parentsIds: EntityIdsList = [];
    let childrenIds: EntityIdsList = [];

    if (part === 'parents' || part === 'full') {
      parentsIds = this.walkParentHierarchy(startClass, hierarchyClassesExtractor);
    }

    if (part === 'children' || part === 'full') {
      childrenIds = this.walkChildrenHierarchy(startClass, hierarchyClassesExtractor);
    }
    return new ClassHierarchyReturnWrapper(
      startClass.id,
      parentsIds,
      childrenIds,
      hierarchyClassesExtractor.getResults(),
    );
  }

  public walkParentHierarchyExtractionOnly(startClass: WdClass, publicExtractor: Extractor): void {
    this.walkParentHierarchy(startClass, publicExtractor);
  }
}
