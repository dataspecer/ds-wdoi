import { Client } from '@elastic/elasticsearch';
import { type EntityId, type EntityIdsList } from '../../entities/common.js';
import { type SearchHit } from '@elastic/elasticsearch/lib/api/types.js';
import { Searcher } from './searcher.js';
import { envVars } from '../../../enviroment.js';
import { logError } from '../../../logging/log.js';

export class EsSearch extends Searcher {
  private readonly client: Client;
  private static readonly CLASSES_ELASTIC_INDEX_NAME = 'classes';
  private static readonly PROPERTIES_ELASTIC_INDEX_NAME = 'properties';

  constructor() {
    super();
    this.client = new Client({
      node: envVars.ES_NODE,
    });
  }

  private async search(indexName: string, queryString: string): Promise<EntityIdsList> {
    try {
      const searchResultsMatch = this.client.search({
        index: indexName,
        _source: false,
        from: 0,
        size: 20,
        query: {
          bool: {
            should: [
              {
                match: {
                  labels_en: {
                    query: queryString,
                    fuzziness: 'AUTO',
                  },
                },
              },
              {
                term: {
                  'labels_en.keyword': {
                    value: queryString,
                    boost: 2.0,
                  },
                },
              },
              {
                match: {
                  aliases_en: {
                    query: queryString,
                    fuzziness: 'AUTO',
                  },
                },
              },
              {
                term: {
                  'aliases_en.keyword': {
                    value: queryString,
                    boost: 2.0,
                  },
                },
              },
            ],
          },
        },
      });
      return this.makeUnique((await searchResultsMatch).hits.hits);
    } catch (e) {
      logError(e);
    }
    return [];
  }

  public async searchClasses(query: string): Promise<EntityIdsList> {
    return await this.search(EsSearch.CLASSES_ELASTIC_INDEX_NAME, query);
  }

  public async searchProperties(query: string): Promise<EntityIdsList> {
    return await this.search(EsSearch.PROPERTIES_ELASTIC_INDEX_NAME, query);
  }

  // This must preserve order of the given array.
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
