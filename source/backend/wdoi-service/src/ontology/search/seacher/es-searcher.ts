import { Client } from '@elastic/elasticsearch';
import { type EntityId, type EntityIdsList } from '../../entities/common.js';
import { type SearchHit } from '@elastic/elasticsearch/lib/api/types.js';
import { Searcher } from './searcher.js';
import { envVars } from '../../../enviroment.js';
import * as fs from 'fs';

export class EsSearch extends Searcher {
  private readonly client: Client;
  private static readonly CLASSES_ELASTIC_INDEX_NAME = 'classes';
  private static readonly PROPERTIES_ELASTIC_INDEX_NAME = 'properties';

  constructor() {
    super();
    this.client = new Client({
      node: envVars.ES_NODE,
      auth: { username: 'elastic', password: envVars.ES_PASSWD },
      // caFingerprint: envVars.ES_CA_FINGERPRINT,
      tls: {
        ca: fs.readFileSync(envVars.ES_CERT_PATH),
        rejectUnauthorized: false,
      },
    });
  }

  private async search(indexName: string, queryString: string): Promise<EntityIdsList> {
    // const searchResultsPrefix = this.client.search({
    //   index: indexName,
    //   _source: false,
    //   query: {
    //     multi_match: {
    //       query: queryString,
    //       type: 'phrase_prefix',
    //       slop: 3,
    //     },
    //   },
    // });
    // const searchResultsMatch = this.client.search({
    //   index: indexName,
    //   _source: false,
    //   query: {
    //     dis_max: {
    //       queries: [
    //         {
    //           multi_match: {
    //             query: queryString,
    //             type: 'best_fields',
    //             fields: ['labels_en^3', 'labels_en.keyword^2', 'aliases_en.keyword', 'aliases_en'],
    //           },
    //         },
    //         {
    //           multi_match: {
    //             query: queryString,
    //             type: 'most_fields',
    //             fields: ['labels_en^3', 'labels_en.keyword^2', 'aliases_en.keyword', 'aliases_en'],
    //           },
    //         },
    //       ],
    //     },
    //   },
    // });
    // const searchResults = [(await searchResultsPrefix).hits.hits, (await searchResultsMatch).hits.hits];
    // const interleavedResults = this.interleaveArrays(searchResults);
    const searchResultsMatch = this.client.search({
      index: indexName,
      _source: false,
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
