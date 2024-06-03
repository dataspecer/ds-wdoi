import { logError } from '../../logging/log.js';
import { type EntityId, type EntityIdsList } from '../entities/common.js';
import { WdClass } from '../entities/wd-class.js';
import { WdEntity } from '../entities/wd-entity.js';
import { WdProperty } from '../entities/wd-property.js';
import { materializeEntities } from '../utils/materialize-entities.js';
import { EsSearch } from './seacher/es-searcher.js';
import { WdSearch } from './seacher/wd-searcher.js';

export class SearchResults {
  classes: WdClass[];
  properties: WdProperty[];

  constructor(classes: WdClass[], properties: WdProperty[]) {
    this.classes = classes;
    this.properties = properties;
  }
}

const MAX_RESULTS = 30;

export class OntologySearch {
  private readonly esSearch: EsSearch;
  private readonly wdSearch: WdSearch;
  private readonly classes: ReadonlyMap<EntityId, WdClass>;
  private readonly properties: ReadonlyMap<EntityId, WdProperty>;

  private searchBasedOnURI(uri: string): SearchResults {
    const [entityType, entityNumId] = WdEntity.parseEntityURI(uri);
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

  constructor(
    classes: ReadonlyMap<EntityId, WdClass>,
    properties: ReadonlyMap<EntityId, WdProperty>,
  ) {
    this.classes = classes;
    this.properties = properties;
    this.esSearch = new EsSearch();
    this.wdSearch = new WdSearch();
  }

  public async search(
    query: string,
    searchClasses: boolean | undefined,
    searchProperties: boolean | undefined,
  ): Promise<SearchResults> {
    if (WdEntity.URI_REGEXP.test(query)) {
      return this.searchBasedOnURI(query);
    }

    let classesSearchResult: WdClass[] = [];
    let propertiesSearchResult: WdProperty[] = [];

    try {
      if (searchClasses != null && searchClasses) {
        classesSearchResult = await this.searchClasses(query);
      }
      if (searchProperties != null && searchProperties) {
        propertiesSearchResult = await this.searchProperties(query);
      }
    } catch (e) {
      logError(e);
    }
    return new SearchResults(classesSearchResult, propertiesSearchResult);
  }

  private async searchClasses(query: string): Promise<WdClass[]> {
    const wdClassesIds = this.wdSearch.searchClasses(query);
    const esClassesIds = this.esSearch.searchClasses(query);
    return materializeEntities(
      this.makeUniqueWithKeptOrder(
        [...(await wdClassesIds), ...(await esClassesIds)].slice(0, MAX_RESULTS),
      ),
      this.classes,
    );
  }

  private async searchProperties(query: string): Promise<WdProperty[]> {
    const wdPropertiesIds = this.wdSearch.searchProperties(query);
    const esPropertiesIds = this.esSearch.searchProperties(query);
    return materializeEntities(
      this.makeUniqueWithKeptOrder(
        [...(await wdPropertiesIds), ...(await esPropertiesIds)].slice(0, MAX_RESULTS),
      ),
      this.properties,
    );
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
