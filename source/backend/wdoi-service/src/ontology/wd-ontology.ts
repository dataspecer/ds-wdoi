import type { EntityId, EntityIdsList } from './entities/common';
import { ROOT_CLASS_ID, type WdClass } from './entities/wd-class';
import { type WdProperty } from './entities/wd-property';
import { loadEntities, processFuncClassesCapture, processFuncPropertiesCapture } from './loading/load-ontology';
import { ModifierContext } from './post-loading/modifiers';
import { AssignSubjectObjectValuesToClasses } from './post-loading/ontology-modifiers/property/assign-subject-object-values-to-classes';
import { CLASSES_LOG_STEP, PROPERTIES_LOG_STEP, tryLog, log } from '../logging/log';
import { WdEsSearchClient } from './elastic-search/client';

export class WdOntology {
  private readonly rootClass: WdClass;
  private readonly classes: Map<EntityId, WdClass>;
  private readonly properties: Map<EntityId, WdProperty>;
  private readonly esClient: WdEsSearchClient;
  private static readonly URI_REGEXP = /^http:\/\/www.wikidata.org\/entity\/[QP][1-9][0-9]*$/;

  private constructor(rootClass: WdClass, classes: Map<EntityId, WdClass>, properties: Map<EntityId, WdProperty>, esClient: WdEsSearchClient) {
    this.rootClass = rootClass;
    this.classes = classes;
    this.properties = properties;
    this.esClient = esClient;
  }

  private materializeEntities<T extends WdClass | WdProperty>(entityIds: EntityIdsList, entityMap: Map<EntityId, T>): T[] {
    const results: T[] = [];
    entityIds.forEach((id) => {
      const cls = entityMap.get(id);
      if (cls != null) results.push(cls);
    });
    return results;
  }

  private searchBasedOnURI(url: string): WdClass[] {
    const entityStrId = url.split('/').pop();
    if (entityStrId != null) {
      const entityNumId = Number(entityStrId.slice(1));
      if (entityStrId?.startsWith('Q')) {
        const cls = this.classes.get(entityNumId);
        if (cls != null) return [cls];
      }
    }
    return [];
  }

  public async search(query: string, searchClasses: boolean, searchProperties: boolean, searchInstances: boolean): Promise<WdClass[]> {
    if (WdOntology.URI_REGEXP.test(query)) {
      return this.searchBasedOnURI(query);
    }
    const classIdsList = await this.esClient.searchClasses(query);
    return this.materializeEntities(classIdsList, this.classes);
  }

  public containsClass(id: EntityId): boolean {
    return this.classes.has(id);
  }

  public containsProperty(id: EntityId): boolean {
    return this.properties.has(id);
  }

  private static postLoadModifyProperties(ctx: ModifierContext): void {
    log('Starting to post-process modyfying on properties');

    const propertyModifiers = [new AssignSubjectObjectValuesToClasses(ctx)];
    let i = 0;
    for (const wdProperty of ctx.properties.values()) {
      for (const modifier of propertyModifiers) {
        wdProperty.accept(modifier);
      }
      i += 1;
      tryLog(i, PROPERTIES_LOG_STEP);
    }
    propertyModifiers.forEach((mod) => {
      mod.printReport();
    });
  }

  private static postLoadModify(o: WdOntology): void {
    const ctx = new ModifierContext(o.rootClass, o.classes, o.properties);
    WdOntology.postLoadModifyProperties(ctx);
  }

  static async create(classesJsonFilePath: string, propertiesJsonFilePath: string, esNode: string): Promise<WdOntology | never> {
    log('Connecting to elastic search');
    const client = new WdEsSearchClient(esNode);

    log('Starting to load properties');
    const props = await loadEntities<WdProperty>(propertiesJsonFilePath, processFuncPropertiesCapture, PROPERTIES_LOG_STEP);

    log('Starting to load classes');
    const cls = await loadEntities<WdClass>(classesJsonFilePath, processFuncClassesCapture, CLASSES_LOG_STEP);

    const rootClass = cls.get(ROOT_CLASS_ID);
    if (rootClass != null) {
      const ontology = new WdOntology(rootClass, cls, props, client);
      log('Ontology created');
      WdOntology.postLoadModify(ontology);
      log('Ontology modified');
      return ontology;
    } else {
      throw new Error('Could not find a root class.');
    }
  }
}
