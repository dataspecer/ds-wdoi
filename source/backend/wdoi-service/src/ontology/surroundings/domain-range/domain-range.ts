import type { PropertyScoreRecord, EntityId, EntityIdsList } from '../../entities/common';
import { type WdClass } from '../../entities/wd-class';
import { type WdProperty } from '../../entities/wd-property';
import { Extractor } from '../../hierarchy-walker/hierarchy-walker';
import * as Timsort from 'timsort';

export type ClassPropertyDomainsRangesParts = 'own' | 'inherited';

export class ClassPropertyDomainsRangesResultWrapper {
  readonly classes: WdClass[];

  constructor(classes: WdClass[]) {
    this.classes = classes;
  }
}

export function expandWithPropertyDomains(
  classes: WdClass[],
  classesPresent: ReadonlyMap<EntityId, any>,
  property: WdProperty,
  contextClasses: ReadonlyMap<EntityId, WdClass>,
): void {
  const propertyDomains = property.getDomainClassIdsByUsage();
  addClassesIfMissing(classes, classesPresent, propertyDomains, contextClasses);
}

export function expandWithPropertyRanges(
  classes: WdClass[],
  classesPresent: ReadonlyMap<EntityId, any>,
  property: WdProperty,
  contextClasses: ReadonlyMap<EntityId, WdClass>,
): void {
  const propertyRanges = property.getRangeClassIdsByUsage();
  addClassesIfMissing(classes, classesPresent, propertyRanges, contextClasses);
}

function addClassesIfMissing(
  classes: WdClass[],
  classesPresent: ReadonlyMap<EntityId, any>,
  classesIdsToAdd: EntityIdsList,
  contextClasses: ReadonlyMap<EntityId, WdClass>,
): void {
  classesIdsToAdd.forEach((clsId) => {
    if (!classesPresent.has(clsId)) {
      const cls = contextClasses.get(clsId) as WdClass;
      classes.push(cls);
    }
  });
}

export abstract class InheritedClassPropertyDomainsRangesExtractor extends Extractor {
  // Context
  protected readonly contextClasses: ReadonlyMap<EntityId, WdClass>;
  protected readonly contexProperties: ReadonlyMap<EntityId, WdProperty>;
  protected readonly startClass: WdClass;
  protected readonly property: WdProperty;

  // Outputs
  private readonly classes: WdClass[] = [];

  // Markers
  protected readonly classesIdsMap: Map<EntityId, number> = new Map<EntityId, number>();

  constructor(
    startClass: WdClass,
    property: WdProperty,
    contextClasses: ReadonlyMap<EntityId, WdClass>,
    contextProperties: ReadonlyMap<EntityId, WdProperty>,
  ) {
    super();
    this.startClass = startClass;
    this.property = property;
    this.contextClasses = contextClasses;
    this.contexProperties = contextProperties;
  }

  // The method should never receive the same parent class twice.
  // The start class is always the first one seen.
  public extract(cls: WdClass): void {
    this.processClass(cls);
  }

  protected processClass(cls: WdClass): void {
    const propertyScoreRecord = this.getPropertyScoreRecord(cls, this.property);
    if (propertyScoreRecord != null) {
      for (const clsId of propertyScoreRecord.range) {
        const score = propertyScoreRecord.rangeScoreMap.get(clsId) as number;
        if (!this.classesIdsMap.has(clsId)) {
          this.classesIdsMap.set(clsId, score);
          this.classes.push(this.contextClasses.get(clsId) as WdClass);
        } else this.tryExchangeScoreInMarker(clsId, score);
      }
    }
  }

  protected abstract getPropertyScoreRecord(cls: WdClass, property: WdProperty): PropertyScoreRecord | undefined;

  private tryExchangeScoreInMarker(clsId: EntityId, newScore: number): void {
    const currentScore = this.classesIdsMap.get(clsId) as number;
    if (currentScore < newScore) {
      this.classesIdsMap.set(clsId, newScore);
    }
  }

  public getResult(): [ReadonlyMap<EntityId, any>, ClassPropertyDomainsRangesResultWrapper] {
    this.finalize_results();
    return [this.classesIdsMap, new ClassPropertyDomainsRangesResultWrapper(this.classes)];
  }

  protected finalize_results(): void {
    Timsort.sort(this.classes, (a, b) => (this.classesIdsMap.get(b.id) as number) - (this.classesIdsMap.get(a.id) as number));
  }
}

export class InheritedClassPropertyDomainsExtractor extends InheritedClassPropertyDomainsRangesExtractor {
  protected getPropertyScoreRecord(cls: WdClass, property: WdProperty): PropertyScoreRecord | undefined {
    return cls.getDomainsPropertyScoreRecord(property);
  }
}

export class InheritedClassPropertyRangesExtractor extends InheritedClassPropertyDomainsRangesExtractor {
  protected getPropertyScoreRecord(cls: WdClass, property: WdProperty): PropertyScoreRecord | undefined {
    return cls.getRangesPropertyScoreRecord(property);
  }
}
