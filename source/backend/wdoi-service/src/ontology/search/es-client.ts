import { Client } from '@elastic/elasticsearch';
import { type EntityId, type EntityIdsList } from '../entities/common';
import { type SearchHit } from '@elastic/elasticsearch/lib/api/types';

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

    const searchResults = [(await searchResultsPrefix).hits.hits, (await searchResultsMatch).hits.hits];
    const interleavedResults = this.interleaveArrays(searchResults);
    return this.makeUnique(interleavedResults);
  }

  private interleaveArrays(arr: any[][]): any[] {
    return Array.from(
      {
        length: Math.max(...arr.map((o) => o.length)),
      },
      (_, i) => arr.map((r) => r[i] ?? null),
    ).flat();
  }

  // This must preserver order of the given array.
  private makeUnique(values: Array<SearchHit<unknown> | null>): EntityIdsList {
    const includedIds = new Set<EntityId>();
    return values.flatMap((hit) => {
      if (hit != null) {
        const id = Number(hit._id);
        if (!includedIds.has(id)) {
          includedIds.add(id);
          return [id];
        }
      }
      return [];
    });
  }
}
