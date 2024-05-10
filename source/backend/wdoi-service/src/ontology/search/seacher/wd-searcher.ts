import { type EntityId, type EntityIdsList } from '../../entities/common.js';
import { Searcher } from './searcher.js';

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
    searchEntities: (type: SearchEntityType, query: string) => {
      return (
        WdSearch.BASE_URL +
        '?action=wbsearchentities' +
        '&search=' +
        encodeURI(query) +
        '&language=en' +
        '&limit=7' +
        '&type=' +
        type +
        '&format=json'
      );
    },
  };

  private async search(type: SearchEntityType, query: string): Promise<EntityIdsList> {
    const response = await (await fetch(WdSearch.API_ENDPOINTS.searchEntities(type, query))).json();

    if (isWdPhpSearchEntitiesResponse(response)) {
      return this.parseSearchHits(response.search);
    }
    return [];
  }

  public async searchClasses(query: string): Promise<EntityIdsList> {
    return await this.search('item', query);
  }

  public async searchProperties(query: string): Promise<EntityIdsList> {
    return await this.search('property', query);
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
