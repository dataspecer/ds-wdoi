import type { EntityId } from './entities/common';
import { ROOT_CLASS_ID, type WdClass } from './entities/wd-class';
import { type WdProperty } from './entities/wd-property';
import { loadEntities, processFuncClassesCapture, processFuncPropertiesCapture } from './loading/load-ontology';
import { CLASSES_LOG_STEP, PROPERTIES_LOG_STEP, log } from '../logging/log';
import { OntologySearch, type SearchResults } from './search/ontologySearch';
import { type ClassHierarchyReturnWrapper, ClassHierarchyWalker, type ClassHierarchyWalkerParts } from './hierarchy-walker/hierarchy-walker';
import {
  type HierarchyWithPropertiesReturnWrapper,
  HierarchyWithPropertiesCombinedUsageStatisticsAndConstraintsExtractor,
} from './surroundings/hierarchy-with-properties/hierarchy-with-properties';
import {
  ClassOneDistanceDocsExpander,
  type ClassOneDistanceDocsReturnWrapper,
} from './surroundings/one-distance-docs/class-one-distance-docs-expander';
import {
  PropertyOneDistanceDocsExpander,
  type PropertyOneDistanceDocsReturnWrapper,
} from './surroundings/one-distance-docs/property-one-distance-docs-expander';
import {
  ClassPropertyDomainsRangesResultWrapper,
  InheritedClassPropertyDomainsExtractor,
  InheritedClassPropertyRangesExtractor,
} from './surroundings/domain-range/domain-range';
import { materializeEntities } from './utils/materialize-entities';

export class WdOntology {
  private readonly rootClass: WdClass;
  private readonly classes: ReadonlyMap<EntityId, WdClass>;
  private readonly properties: ReadonlyMap<EntityId, WdProperty>;
  private readonly ontologySearch: OntologySearch;
  private readonly hierarchyWalker: ClassHierarchyWalker;

  private constructor(rootClass: WdClass, classes: ReadonlyMap<EntityId, WdClass>, properties: ReadonlyMap<EntityId, WdProperty>) {
    this.rootClass = rootClass;
    this.classes = classes;
    this.properties = properties;
    this.ontologySearch = new OntologySearch(this.rootClass, this.classes, this.properties);
    this.hierarchyWalker = new ClassHierarchyWalker(this.rootClass, this.classes, this.properties);
  }

  public async search(
    query: string,
    searchClasses: boolean | undefined,
    searchProperties: boolean | undefined,
    searchInstances: boolean | undefined,
    languagePriority: string | undefined,
  ): Promise<SearchResults> {
    return await this.ontologySearch.search(query, searchClasses, searchProperties, searchInstances, languagePriority);
  }

  public getHierarchy(startClass: WdClass, parts: ClassHierarchyWalkerParts): ClassHierarchyReturnWrapper {
    return this.hierarchyWalker.getHierarchy(startClass, parts);
  }

  public getSurroundingsCombinedUsageStatisticsAndConstraints(startClass: WdClass): HierarchyWithPropertiesReturnWrapper {
    const extractor = new HierarchyWithPropertiesCombinedUsageStatisticsAndConstraintsExtractor(startClass, this.classes, this.properties);
    this.hierarchyWalker.getParentHierarchyWithExtraction(startClass, extractor);
    return extractor.getResult();
  }

  public getOwnClassPropertyDomains(cls: WdClass, property: WdProperty): ClassPropertyDomainsRangesResultWrapper {
    const domains = cls.getDomainsForProperty(property);
    return new ClassPropertyDomainsRangesResultWrapper(materializeEntities(domains, this.classes));
  }

  public getOwnClassPropertyRanges(cls: WdClass, property: WdProperty): ClassPropertyDomainsRangesResultWrapper {
    const ranges = cls.getRangesForProperty(property);
    return new ClassPropertyDomainsRangesResultWrapper(materializeEntities(ranges, this.classes));
  }

  public getInheritedClassPropertyDomains(cls: WdClass, property: WdProperty): ClassPropertyDomainsRangesResultWrapper {
    const extractor = new InheritedClassPropertyDomainsExtractor(cls, property, this.classes, this.properties);
    this.hierarchyWalker.getParentHierarchyWithExtraction(cls, extractor);
    return extractor.getResult();
  }

  public getInheritedClassPropertyRanges(cls: WdClass, property: WdProperty): ClassPropertyDomainsRangesResultWrapper {
    const extractor = new InheritedClassPropertyRangesExtractor(cls, property, this.classes, this.properties);
    this.hierarchyWalker.getParentHierarchyWithExtraction(cls, extractor);
    return extractor.getResult();
  }

  public getClass(classId: EntityId): WdClass | undefined {
    return this.classes.get(classId);
  }

  public getProperty(propertyId: EntityId): WdProperty | undefined {
    return this.properties.get(propertyId);
  }

  public getClassWithSurroundingNames(startClass: WdClass): ClassOneDistanceDocsReturnWrapper {
    const classOneDistanceDocsExpander = new ClassOneDistanceDocsExpander(startClass, this.classes, this.properties);
    return classOneDistanceDocsExpander.getSurroundings();
  }

  public getPropertyWithSurroundingNames(startProperty: WdProperty): PropertyOneDistanceDocsReturnWrapper {
    const propertyOneDistanceDocsExpander = new PropertyOneDistanceDocsExpander(startProperty, this.classes, this.properties);
    return propertyOneDistanceDocsExpander.getSurroundings();
  }

  public containsClass(classId: EntityId): boolean {
    return this.classes.has(classId);
  }

  public containsProperty(propertyId: EntityId): boolean {
    return this.properties.has(propertyId);
  }

  static async create(classesJsonFilePath: string, propertiesJsonFilePath: string): Promise<WdOntology | never> {
    log('Starting to load properties');
    const props = await loadEntities<WdProperty>(propertiesJsonFilePath, processFuncPropertiesCapture, PROPERTIES_LOG_STEP);

    log('Starting to load classes');
    const cls = await loadEntities<WdClass>(classesJsonFilePath, processFuncClassesCapture, CLASSES_LOG_STEP);

    const rootClass = cls.get(ROOT_CLASS_ID);
    if (rootClass != null) {
      const ontology = new WdOntology(rootClass, cls, props);
      log('Ontology created');
      return ontology;
    } else {
      throw new Error('Could not find a root class.');
    }
  }
}
