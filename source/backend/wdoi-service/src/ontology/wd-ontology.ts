import type { EntityId } from './entities/common';
import { ROOT_CLASS_ID, type WdClass } from './entities/wd-class';
import { type WdProperty } from './entities/wd-property';
import { loadEntities, processFuncClassesCapture, processFuncPropertiesCapture } from './loading/load-ontology';
import { CLASSES_LOG_STEP, PROPERTIES_LOG_STEP, log } from '../logging/log';
import { OntologySearch, type SearchResults } from './search/ontologySearch';
import { type ClassHierarchyReturnWrapper, ClassHierarchyWalker, type ClassHierarchyWalkerParts } from './hierarchy-walker/hierarchy-walker';
import {
  ClassSurroundingsExpander,
  type ClassSurroundingsReturnWrapper,
  PropertyHierarchyExtractor,
} from './surroundings/class-expander/class-surroundings-expander';
import type { GlobalPropertyRecommendations } from './entities/recommendations';
import { loadGlobalPropertyRecommendations } from './loading/load-property-recommendations';
import {
  ClassSurroundingsExpanderRecs,
  type ClassSurroundingsRecsReturnWrapper,
  PropertyHierarchyExtractorRecs,
} from './surroundings/class-expander/class-surroundings-expander-recs';

export class WdOntology {
  private readonly rootClass: WdClass;
  private readonly classes: ReadonlyMap<EntityId, WdClass>;
  private readonly properties: ReadonlyMap<EntityId, WdProperty>;
  private readonly ontologySearch: OntologySearch;
  private readonly hierarchyWalker: ClassHierarchyWalker;
  private readonly surroundingsExpander: ClassSurroundingsExpander;
  private readonly surroundingsExpanderRecs: ClassSurroundingsExpanderRecs;
  private readonly globalSubjectRecs: GlobalPropertyRecommendations;
  private readonly globalValueRecs: GlobalPropertyRecommendations;

  private constructor(
    rootClass: WdClass,
    classes: ReadonlyMap<EntityId, WdClass>,
    properties: ReadonlyMap<EntityId, WdProperty>,
    globalSubjectRecs: GlobalPropertyRecommendations,
    globalValueRecs: GlobalPropertyRecommendations,
  ) {
    this.rootClass = rootClass;
    this.classes = classes;
    this.properties = properties;
    this.ontologySearch = new OntologySearch(this.rootClass, this.classes, this.properties);
    this.hierarchyWalker = new ClassHierarchyWalker(this.rootClass, this.classes, this.properties);
    this.surroundingsExpander = new ClassSurroundingsExpander(this.rootClass, this.classes, this.properties);
    this.surroundingsExpanderRecs = new ClassSurroundingsExpanderRecs(this.rootClass, this.classes, this.properties);
    this.globalSubjectRecs = globalSubjectRecs;
    this.globalValueRecs = globalValueRecs;
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

  public getSurroundings(startClass: WdClass): ClassSurroundingsReturnWrapper {
    const extractor = new PropertyHierarchyExtractor(startClass, this.rootClass, this.classes, this.properties);
    this.hierarchyWalker.getParentHierarchyWithExtraction(startClass, extractor);
    return this.surroundingsExpander.getSurroundings(extractor);
  }

  public getSurroundingsWithRecs(startClass: WdClass): ClassSurroundingsRecsReturnWrapper {
    const extractor = new PropertyHierarchyExtractorRecs(
      startClass,
      this.rootClass,
      this.classes,
      this.properties,
      this.globalSubjectRecs.propertyProbabilityHitMap,
      this.globalValueRecs.propertyProbabilityHitMap,
    );
    this.hierarchyWalker.getParentHierarchyWithExtraction(startClass, extractor);
    return this.surroundingsExpanderRecs.getSurroundings(extractor);
  }

  public getClass(classId: EntityId): WdClass | undefined {
    return this.classes.get(classId);
  }

  public getClassWithMaterializedReferences(classId: EntityId): void {}

  public getProperty(propertyId: EntityId): WdProperty | undefined {
    return this.properties.get(propertyId);
  }

  public getPropertyWithMaterializedReferences(propertyId: EntityId): void {}

  public containsClass(classId: EntityId): boolean {
    return this.classes.has(classId);
  }

  public containsProperty(propertyId: EntityId): boolean {
    return this.properties.has(propertyId);
  }

  static async create(
    classesJsonFilePath: string,
    propertiesJsonFilePath: string,
    globalSubjectRecsFilePath: string,
    globalValueRecsFilePath: string,
  ): Promise<WdOntology | never> {
    log('Starting to load properties');
    const props = await loadEntities<WdProperty>(propertiesJsonFilePath, processFuncPropertiesCapture, PROPERTIES_LOG_STEP);

    log('Starting to load classes');
    const cls = await loadEntities<WdClass>(classesJsonFilePath, processFuncClassesCapture, CLASSES_LOG_STEP);

    log('Starting to load global subject recommendations');
    const globalSubjectRecs = loadGlobalPropertyRecommendations(globalSubjectRecsFilePath);

    log('Starting to load global value recommendations');
    const globalValueRecs = loadGlobalPropertyRecommendations(globalValueRecsFilePath);

    const rootClass = cls.get(ROOT_CLASS_ID);
    if (rootClass != null) {
      const ontology = new WdOntology(rootClass, cls, props, globalSubjectRecs, globalValueRecs);
      log('Ontology created');
      return ontology;
    } else {
      throw new Error('Could not find a root class.');
    }
  }
}
