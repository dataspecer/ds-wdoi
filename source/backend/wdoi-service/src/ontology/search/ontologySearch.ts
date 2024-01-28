import { type EntityId, type EntityIdsList } from '../entities/common';
import { WdClass } from '../entities/wd-class';
import { WdEntity } from '../entities/wd-entity';
import { WdProperty } from '../entities/wd-property';
import { materializeEntities } from '../utils/materialize-entities';
import { EsSearch } from './seacher/es-searcher';
import { WdSearch } from './seacher/wd-searcher';

export class SearchResults {
  classes: WdClass[];
  properties: WdProperty[];

  constructor(classes: WdClass[], properties: WdProperty[]) {
    this.classes = classes;
    this.properties = properties;
  }
}

export class OntologySearch {
  static readonly DEFAULT_LANGUAGE_PRIORITY = 'en';
  private readonly esSearch: EsSearch;
  private readonly wdSearch: WdSearch;
  private readonly rootClass: WdClass;
  private readonly classes: ReadonlyMap<EntityId, WdClass>;
  private readonly properties: ReadonlyMap<EntityId, WdProperty>;
  private static readonly URI_REGEXP = new RegExp('^http://www.wikidata.org/entity/[QP][1-9][0-9]*$');

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

  private searchBasedOnURI(uri: string): SearchResults {
    const [entityType, entityNumId] = this.parseEntityURI(uri);
    if (entityType != null && entityNumId != null) {
      if (WdClass.isURIType(entityType)) {
        const cls = this.classes.get(entityNumId);
        if (cls != null) return new SearchResults([cls], []);
      } else if (WdProperty.isURIType(entityType)) {
        const prop = this.properties.get(entityNumId);
        if (prop != null) return new SearchResults([], [prop]);
      }
    }
    return new SearchResults([], []);
  }

  constructor(rootClass: WdClass, classes: ReadonlyMap<EntityId, WdClass>, properties: ReadonlyMap<EntityId, WdProperty>) {
    this.rootClass = rootClass;
    this.classes = classes;
    this.properties = properties;
    this.esSearch = new EsSearch(OntologySearch.DEFAULT_LANGUAGE_PRIORITY);
    this.wdSearch = new WdSearch(OntologySearch.DEFAULT_LANGUAGE_PRIORITY);
  }

  public async search(
    query: string,
    searchClasses: boolean | undefined,
    searchProperties: boolean | undefined,
    searchInstances: boolean | undefined,
    languagePriority: string | undefined,
  ): Promise<SearchResults> {
    if (OntologySearch.URI_REGEXP.test(query)) {
      return this.searchBasedOnURI(query);
    }

    let classesSearchResult: WdClass[] = [];
    let propertiesSearchResult: WdProperty[] = [];

    if (searchClasses != null && searchClasses) {
      classesSearchResult = await this.searchClasses(query, languagePriority);
    }
    if (searchProperties != null && searchProperties) {
      propertiesSearchResult = await this.searchProperties(query, languagePriority);
    }
    return new SearchResults(classesSearchResult, propertiesSearchResult);
  }

  private async searchClasses(query: string, languagePriority: string | undefined): Promise<WdClass[]> {
    const wdClassesIds = this.wdSearch.searchClasses(query, languagePriority);
    const esClassesIds = this.esSearch.searchClasses(query, languagePriority);
    return materializeEntities(this.makeUniqueWithKeptOrder([...(await wdClassesIds), ...(await esClassesIds)]), this.classes);
  }

  private async searchProperties(query: string, languagePriority: string | undefined): Promise<WdProperty[]> {
    const wdPropertiesIds = this.wdSearch.searchProperties(query, languagePriority);
    const esPropertiesIds = this.esSearch.searchProperties(query, languagePriority);
    return materializeEntities(this.makeUniqueWithKeptOrder([...(await wdPropertiesIds), ...(await esPropertiesIds)]), this.properties);
  }

  private makeUniqueWithKeptOrder(entityIds: EntityIdsList): EntityIdsList {
    const includedIds = new Set<EntityId>();
    return entityIds.flatMap((id) => {
      if (!includedIds.has(id)) {
        includedIds.add(id);
        return [id];
      }
      return [];
    });
  }
}
