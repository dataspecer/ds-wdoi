import { Client } from '@elastic/elasticsearch';
import { type EntityIdsList } from '../entities/common';

export class WdEsSearchClient {
  private readonly client: Client;
  private static readonly CLASSES_ELASTIC_INDEX_NAME = 'classes';
  private static readonly PROPERTIES_ELASTIC_INDEX_NAME = 'properties';

  constructor(nodeUrl: string) {
    this.client = new Client({ node: nodeUrl });
  }

  public async searchClasses(queryString: string): Promise<EntityIdsList> {
    const searchResults = await this.client.search({
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
    const classIds = searchResults.hits.hits.map((searchHit) => Number(searchHit._id));
    return classIds;
  }
}
