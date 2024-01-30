import { Queue } from '../utils/queue';
import { type EntityIdsList, type EntityId } from '../entities/common';
import { type WdClass } from '../entities/wd-class';
import { type WdProperty } from '../entities/wd-property';

export type ClassHierarchyWalkerParts = 'full' | 'parents' | 'children';

export class ClassHierarchyReturnWrapper {
  public readonly startClass: WdClass;
  public readonly parents: WdClass[];
  public readonly children: WdClass[];

  constructor(startClass: WdClass, parents: WdClass[], children: WdClass[]) {
    this.startClass = startClass;
    this.parents = parents;
    this.children = children;
  }
}

export abstract class Extractor {
  abstract extract(cls: WdClass): void;
}

export class ClassHierarchyWalker {
  protected readonly rootClass: WdClass;
  protected readonly classes: ReadonlyMap<EntityId, WdClass>;
  protected readonly properties: ReadonlyMap<EntityId, WdProperty>;

  constructor(rootClass: WdClass, classes: ReadonlyMap<EntityId, WdClass>, properties: ReadonlyMap<EntityId, WdProperty>) {
    this.rootClass = rootClass;
    this.classes = classes;
    this.properties = properties;
  }

  protected getChildrenExtractor(cls: WdClass): EntityIdsList {
    return cls.children;
  }

  protected getParentsExtractor(cls: WdClass): EntityIdsList {
    return cls.subclassOf;
  }

  protected walkHierarchy(startClass: WdClass, nextValueExtractor: (cls: WdClass) => EntityIdsList, publicExtractor: Extractor | null): WdClass[] {
    const visitedIds = new Set<EntityId>();
    const queue = new Queue<EntityIdsList>();
    const returnClasses: WdClass[] = [];

    // Init
    // Note: Do not add start class to return values, since the api will add it separately to return object.
    // Note: The main cycle with get from map should never return null.
    visitedIds.add(startClass.id);
    queue.enqueue(nextValueExtractor(startClass));

    publicExtractor?.extract(startClass);

    while (!queue.isEmpty()) {
      const nextClassIds = queue.dequeue();
      for (const classId of nextClassIds) {
        if (!visitedIds.has(classId)) {
          const cls = this.classes.get(classId) as WdClass;
          visitedIds.add(classId);
          queue.enqueue(nextValueExtractor(cls));
          returnClasses.push(cls);
          publicExtractor?.extract(cls);
        }
      }
    }

    return returnClasses;
  }

  protected getParentHierarchy(startClass: WdClass): WdClass[] {
    return this.walkHierarchy(startClass, this.getParentsExtractor, null);
  }

  protected getParentHierarchyExt(startClass: WdClass, publicExtractor: Extractor): WdClass[] {
    return this.walkHierarchy(startClass, this.getParentsExtractor, publicExtractor);
  }

  protected getChildrenHierarchy(startClass: WdClass): WdClass[] {
    return this.walkHierarchy(startClass, this.getChildrenExtractor, null);
  }

  public getHierarchy(startClass: WdClass, part: ClassHierarchyWalkerParts): ClassHierarchyReturnWrapper {
    if (part === 'parents') {
      return new ClassHierarchyReturnWrapper(startClass, this.getParentHierarchy(startClass), []);
    } else if (part === 'children') {
      return new ClassHierarchyReturnWrapper(startClass, [], this.getChildrenHierarchy(startClass));
    } else {
      return new ClassHierarchyReturnWrapper(startClass, this.getParentHierarchy(startClass), this.getChildrenHierarchy(startClass));
    }
  }

  public getParentHierarchyWithExtraction(startClass: WdClass, publicExtractor: Extractor): ClassHierarchyReturnWrapper {
    return new ClassHierarchyReturnWrapper(startClass, this.getParentHierarchyExt(startClass, publicExtractor), []);
  }
}
