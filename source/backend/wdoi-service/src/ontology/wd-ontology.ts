import type { EntityId, EntityIdsList } from './entities/common';
import { ROOT_CLASS_ID, WdClass } from './entities/wd-class';
import { type WdProperty } from './entities/wd-property';
import { loadEntities, processFuncClassesCapture, processFuncPropertiesCapture } from './loading/load-ontology';
import { CLASSES_LOG_STEP, PROPERTIES_LOG_STEP, log } from '../logging/log';
import { WdEsSearchClient } from './elastic-search/client';
import { WdEntity } from './entities/wd-entity';

export class WdOntology {
  private readonly rootClass: WdClass;
  private readonly classes: Map<EntityId, WdClass>;
  private readonly properties: Map<EntityId, WdProperty>;
  private readonly esClient: WdEsSearchClient;
  private static readonly URI_REGEXP = new RegExp('^http://www.wikidata.org/entity/[QP][1-9][0-9]*$');

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

  private parseEntityURI(uri: string): [string | null, number | null] {
    const entityStrId = uri.split('/').pop();
    if (entityStrId != null) {
      const entityType = entityStrId[0];
      const entityNumId = Number(entityStrId.slice(1));
      if (entityNumId != null && WdEntity.isValidURIType(entityType)) {
        return [entityType, entityNumId];
      }
    }
    return [null, null];
  }

  private searchBasedOnURI(uri: string): WdClass[] {
    const [entityType, entityNumId] = this.parseEntityURI(uri);
    if (entityType != null && entityNumId != null) {
      if (WdClass.isURIType(entityType)) {
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

  public getClass(classId: EntityId): WdClass | undefined {
    return this.classes.get(classId);
  }

  public containsClass(classId: EntityId): boolean {
    return this.classes.has(classId);
  }

  public containsProperty(propertyId: EntityId): boolean {
    return this.properties.has(propertyId);
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
      return ontology;
    } else {
      throw new Error('Could not find a root class.');
    }
  }
}
