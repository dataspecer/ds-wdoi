import { Client } from '@elastic/elasticsearch';
import { type EntityId, type EntityIdsList } from '../../entities/common';
import { type SearchHit } from '@elastic/elasticsearch/lib/api/types';
import fs from 'fs';
import { Searcher } from './searcher';
import { envVars } from '../../../enviroment';
export class EsSearch extends Searcher {
  private readonly client: Client;
  private static readonly CLASSES_ELASTIC_INDEX_NAME = 'classes';
  private static readonly PROPERTIES_ELASTIC_INDEX_NAME = 'properties';

  constructor(defaultLanguagePriority: string) {
    super(defaultLanguagePriority);
    this.client = new Client({
      node: envVars.ES_NODE,
      auth: { username: 'elastic', password: envVars.ES_PASSWD },
      tls: { ca: fs.readFileSync(envVars.ES_CERT_PATH) },
    });
  }

  public async searchClasses(queryString: string, languagePriority: string | undefined): Promise<EntityIdsList> {
    const searchResultsPrefix = this.client.search({
      index: EsSearch.CLASSES_ELASTIC_INDEX_NAME,
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
      index: EsSearch.CLASSES_ELASTIC_INDEX_NAME,
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
