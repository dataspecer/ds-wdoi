import { Client } from '@elastic/elasticsearch';
import { type EntityId, type EntityIdsList } from '../entities/common';

export class WdEsSearchClient {
  private readonly client: Client;
  private static readonly CLASSES_ELASTIC_INDEX_NAME = 'classes';
  private static readonly PROPERTIES_ELASTIC_INDEX_NAME = 'properties';

  constructor(nodeUrl: string) {
    this.client = new Client({ node: nodeUrl });
  }

  public async searchClasses(queryString: string): Promise<EntityIdsList> {
    const searchResultsPrefix = this.client.search({
      index: WdEsSearchClient.CLASSES_ELASTIC_INDEX_NAME,
      _source: false,
      query: {
        multi_match: {
          query: queryString,
          type: 'phrase_prefix',
          slop: 3,
        },
      },
    });
    const searchResultsMatch = this.client.search({
      index: WdEsSearchClient.CLASSES_ELASTIC_INDEX_NAME,
      _source: false,
      query: {
        multi_match: {
          query: queryString,
          type: 'best_fields',
        },
      },
    });

    const searchResults = [...(await searchResultsPrefix).hits.hits, ...(await searchResultsMatch).hits.hits];
    searchResults.sort((a, b) => (b._score as number) - (a._score as number));
    const includedIds = new Set<EntityId>();
    return searchResults.flatMap((hit) => {
      const id = Number(hit._id);
      if (!includedIds.has(id)) {
        includedIds.add(id);
        return [id];
      } else return [];
    });
  }
}
