import { type EntityId, type EntityIdsList } from '../../entities/common';
import { Searcher } from './searcher';

interface SearchInfo {
  search: string;
}

interface SearchEntitiesHit {
  id: string;
}

interface WdPhpSearchEntitiesResponse {
  searchinfo: SearchInfo;
  search: SearchEntitiesHit[];
  success: number;
}

type SearchEntityType = 'item' | 'property';

function isWdPhpSearchEntitiesResponse(obj: any): obj is WdPhpSearchEntitiesResponse {
  return 'searchinfo' in obj && 'search' in obj && 'success' in obj;
}

export class WdSearch extends Searcher {
  private static readonly BASE_URL = 'https://www.wikidata.org/w/api.php';
  private static readonly API_ENDPOINTS = {
    searchEntities: (type: SearchEntityType, query: string, languagePriority: string) => {
      return WdSearch.BASE_URL + `?action=wbsearchentities&search=${encodeURI(query)}&language=${languagePriority}&limit=7&type=${type}&format=json`;
    },
  };

  private async search(type: SearchEntityType, query: string, languagePriority: string | undefined): Promise<EntityIdsList> {
    const lang = languagePriority ?? this.defaultLanguagePriority;

    const response = await (await fetch(WdSearch.API_ENDPOINTS.searchEntities(type, query, lang))).json();

    if (isWdPhpSearchEntitiesResponse(response)) {
      return this.parseSearchHits(response.search);
    }
    return [];
  }

  public async searchClasses(query: string, languagePriority: string | undefined): Promise<EntityIdsList> {
    return await this.search('item', query, languagePriority);
  }

  public async searchProperties(query: string, languagePriority: string | undefined): Promise<EntityIdsList> {
    return await this.search('property', query, languagePriority);
  }

  private parseSearchHits(searchHits: SearchEntitiesHit[]): EntityIdsList {
    const entityIds: EntityId[] = [];
    for (const hit of searchHits) {
      entityIds.push(this.parseEntityId(hit.id));
    }
    return entityIds;
  }

  private parseEntityId(entityId: string): number {
    return Number(entityId.slice(1));
  }
}
