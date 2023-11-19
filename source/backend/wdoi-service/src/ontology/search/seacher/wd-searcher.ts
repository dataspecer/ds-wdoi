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

function isWdPhpSearchEntitiesResponse(obj: any): obj is WdPhpSearchEntitiesResponse {
  return 'searchinfo' in obj && 'search' in obj && 'success' in obj;
}

export class WdSearch extends Searcher {
  private static readonly BASE_URL = 'https://www.wikidata.org/w/api.php';
  private static readonly API_ENDPOINTS = {
    searchEntities: (query: string, languagePriority: string) => {
      return WdSearch.BASE_URL + `?action=wbsearchentities&search=${encodeURI(query)}&language=${languagePriority}&limit=15&type=item&format=json`;
    },
  };

  public async searchClasses(query: string, languagePriority: string | undefined): Promise<EntityIdsList> {
    const lang = languagePriority ?? this.defaultLanguagePriority;
    const response = await (await fetch(WdSearch.API_ENDPOINTS.searchEntities(query, lang))).json();

    if (isWdPhpSearchEntitiesResponse(response)) {
      return this.parseSearchHits(response.search);
    }
    return [];
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
