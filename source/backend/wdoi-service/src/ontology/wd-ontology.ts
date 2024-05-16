import type { EntityId } from './entities/common.js';
import { ROOT_CLASS_ID, type WdClass } from './entities/wd-class.js';
import { type WdProperty } from './entities/wd-property.js';
import {
  loadEntities,
  processFuncClassesCapture,
  processFuncPropertiesCapture,
} from './loading/load-ontology.js';
import { CLASSES_LOG_STEP, PROPERTIES_LOG_STEP, log } from '../logging/log.js';
import { OntologySearch, type SearchResults } from './search/ontologySearch.js';
import {
  type ClassHierarchyReturnWrapper,
  ClassHierarchyWalker,
  type ClassHierarchyWalkerParts,
} from './hierarchy-walker/class-hierarchy-walker.js';
import {
  type HierarchyWithPropertiesReturnWrapper,
  HierarchyWithPropertiesCombinedUsageStatisticsAndConstraintsExtractor,
} from './surroundings/hierarchy-with-properties/hierarchy-with-properties.js';
import {
  ClassOneDistanceDescExpander,
  type ClassOneDistanceDescReturnWrapper,
} from './surroundings/one-distance-desc/class-one-distance-desc-expander.js';
import {
  PropertyOneDistanceDescExpander,
  type PropertyOneDistanceDescReturnWrapper,
} from './surroundings/one-distance-desc/property-one-distance-desc-expander.js';
import {
  ClassPropertyDomainsInheritOrderExtractor,
  ClassPropertyDomainsRangesResultWrapper,
  ClassPropertyRangesInheritOrderExtractor,
  expandWithPropertyDomains,
  expandWithPropertyRanges,
} from './surroundings/domains-ranges/domains-ranges.js';
import { materializeEntities } from './utils/materialize-entities.js';
import {
  FilterByInstance,
  type FilterByInstanceReturnWrapper,
} from './surroundings/filter-by-instance/filter-by-instance.js';

export class WdOntology {
  private readonly rootClass: WdClass | undefined;
  private readonly classes: ReadonlyMap<EntityId, WdClass>;
  private readonly properties: ReadonlyMap<EntityId, WdProperty>;
  private readonly ontologySearch: OntologySearch;
  private readonly hierarchyWalker: ClassHierarchyWalker;
  private readonly filterByInstance: FilterByInstance;

  private constructor(
    rootClass: WdClass | undefined,
    classes: ReadonlyMap<EntityId, WdClass>,
    properties: ReadonlyMap<EntityId, WdProperty>,
  ) {
    this.rootClass = rootClass;
    this.classes = classes;
    this.properties = properties;
    this.ontologySearch = new OntologySearch(this.classes, this.properties);
    this.hierarchyWalker = new ClassHierarchyWalker(this.classes, this.properties);
    this.filterByInstance = new FilterByInstance(
      this.classes,
      this.properties,
      this.hierarchyWalker,
    );
  }

  public async search(
    query: string,
    searchClasses: boolean | undefined,
    searchProperties: boolean | undefined,
  ): Promise<SearchResults> {
    return await this.ontologySearch.search(query, searchClasses, searchProperties);
  }

  public getClassHierarchy(
    startClass: WdClass,
    parts: ClassHierarchyWalkerParts,
  ): ClassHierarchyReturnWrapper {
    return this.hierarchyWalker.getHierarchy(startClass, parts);
  }

  public getClassSurroundingsCombinedUsageStatisticsAndConstraints(
    startClass: WdClass,
  ): HierarchyWithPropertiesReturnWrapper {
    const extractor = new HierarchyWithPropertiesCombinedUsageStatisticsAndConstraintsExtractor(
      startClass,
      this.classes,
      this.properties,
    );
    this.hierarchyWalker.walkParentHierarchyExtractionOnly(startClass, extractor);
    return extractor.getResult();
  }

  public getClassPropertyDomainsBaseOrder(
    cls: WdClass,
    property: WdProperty,
  ): ClassPropertyDomainsRangesResultWrapper {
    const domainsPropertyRecord = cls.getDomainsPropertyScoreRecord(property);
    let domainsResult: WdClass[] = [];
    if (domainsPropertyRecord != null) {
      domainsResult = materializeEntities(domainsPropertyRecord.range, this.classes);
      expandWithPropertyDomains(
        domainsResult,
        domainsPropertyRecord.rangeScoreMap,
        property,
        this.classes,
      );
    }
    return new ClassPropertyDomainsRangesResultWrapper(domainsResult);
  }

  public getClassPropertyDomainsInheritOrder(
    cls: WdClass,
    property: WdProperty,
  ): ClassPropertyDomainsRangesResultWrapper {
    const extractor = new ClassPropertyDomainsInheritOrderExtractor(
      cls,
      property,
      this.classes,
      this.properties,
    );
    this.hierarchyWalker.walkParentHierarchyExtractionOnly(cls, extractor);
    const [classesPresent, resultWrapper] = extractor.getResult();
    expandWithPropertyDomains(resultWrapper.classes, classesPresent, property, this.classes);
    return resultWrapper;
  }

  public getClassPropertyRangesBaseOrder(
    cls: WdClass,
    property: WdProperty,
  ): ClassPropertyDomainsRangesResultWrapper {
    const rangesPropertyRecord = cls.getRangesPropertyScoreRecord(property);
    let rangesResult: WdClass[] = [];
    if (rangesPropertyRecord != null) {
      rangesResult = materializeEntities(rangesPropertyRecord.range, this.classes);
      expandWithPropertyRanges(
        rangesResult,
        rangesPropertyRecord.rangeScoreMap,
        property,
        this.classes,
      );
    }
    return new ClassPropertyDomainsRangesResultWrapper(rangesResult);
  }

  public getClassPropertyRangesInheritOrder(
    cls: WdClass,
    property: WdProperty,
  ): ClassPropertyDomainsRangesResultWrapper {
    const extractor = new ClassPropertyRangesInheritOrderExtractor(
      cls,
      property,
      this.classes,
      this.properties,
    );
    this.hierarchyWalker.walkParentHierarchyExtractionOnly(cls, extractor);
    const [classesPresent, resultWrapper] = extractor.getResult();
    expandWithPropertyRanges(resultWrapper.classes, classesPresent, property, this.classes);
    return resultWrapper;
  }

  public getClass(classId: EntityId): WdClass | undefined {
    return this.classes.get(classId);
  }

  public getProperty(propertyId: EntityId): WdProperty | undefined {
    return this.properties.get(propertyId);
  }

  public getClassWithSurroundingDesc(startClass: WdClass): ClassOneDistanceDescReturnWrapper {
    const classOneDistanceDocsExpander = new ClassOneDistanceDescExpander(
      startClass,
      this.classes,
      this.properties,
    );
    return classOneDistanceDocsExpander.getSurroundings();
  }

  public getPropertyWithSurroundingDesc(
    startProperty: WdProperty,
  ): PropertyOneDistanceDescReturnWrapper {
    const propertyOneDistanceDocsExpander = new PropertyOneDistanceDescExpander(
      startProperty,
      this.classes,
      this.properties,
    );
    return propertyOneDistanceDocsExpander.getSurroundings();
  }

  public containsClass(classId: EntityId): boolean {
    return this.classes.has(classId);
  }

  public containsProperty(propertyId: EntityId): boolean {
    return this.properties.has(propertyId);
  }

  public async getFilterByInstance(url: string): Promise<FilterByInstanceReturnWrapper> {
    return await this.filterByInstance.createFilter(url);
  }

  static async create(
    classesJsonFilePath: string,
    propertiesJsonFilePath: string,
  ): Promise<WdOntology | never> {
    log('Starting to load properties');
    const props = await loadEntities<WdProperty>(
      propertiesJsonFilePath,
      processFuncPropertiesCapture,
      PROPERTIES_LOG_STEP,
    );

    log('Starting to load classes');
    const cls = await loadEntities<WdClass>(
      classesJsonFilePath,
      processFuncClassesCapture,
      CLASSES_LOG_STEP,
    );

    const rootClass = cls.get(ROOT_CLASS_ID);
    // Allow missing root when dics are empty - empty initial start.
    if (rootClass != null || (props.size === 0 && cls.size === 0)) {
      const ontology = new WdOntology(rootClass, cls, props);
      log('Ontology created');
      return ontology;
    } else {
      throw new Error('Could not find a root class.');
    }
  }
}
