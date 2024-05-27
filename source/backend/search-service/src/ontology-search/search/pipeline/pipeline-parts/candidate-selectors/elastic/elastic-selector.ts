import { PipelinePartSingle } from '../../../pipeline-part.js';
import type { PipelinePart, PipelinePartResults } from '../../../pipeline-part.js';
import type { ElasticQueryCreator } from './elastic-query-creator.js';
import type {
  AggregationsAggregate,
  SearchResponse,
} from '@elastic/elasticsearch/lib/api/types.js';
import { logError } from '../../../../../../logging/log.js';
import type { Query } from '../../../query.js';
import type { WdOntologyContext } from '../../../../../ontology-context/ontology-context.js';
import type { ElasticClientWrapper } from '../../../../service-clients/clients/elastic-client.js';

export class ElasticSelector extends PipelinePartSingle {
  protected readonly elasticClient: ElasticClientWrapper;
  protected readonly queryCreator: ElasticQueryCreator;

  constructor(
    query: Query,
    ontologyContext: WdOntologyContext,
    maxResults: number,
    predecessor: PipelinePart | undefined,
    elasticClient: ElasticClientWrapper,
    queryCreator: ElasticQueryCreator,
  ) {
    super(query, ontologyContext, maxResults, predecessor);
    this.elasticClient = elasticClient;
    this.queryCreator = queryCreator;
  }

  protected convertElasticSearchResultsToPipelineResults(
    searchResults: SearchResponse<unknown, Record<string, AggregationsAggregate>>,
  ): PipelinePartResults {
    return searchResults.hits.hits.flatMap((hit) => {
      if (hit != null) {
        const id = Number(hit._id);
        const score = hit._score as number;
        return [{ id, score }];
      }
      return [];
    });
  }

  protected async executeInternal(
    predecessorResults: PipelinePartResults | undefined,
  ): Promise<PipelinePartResults> {
    try {
      const boolQuery = this.queryCreator.createQuery();
      const searchResults = await this.elasticClient.es.search({
        index: this.queryCreator.indexName,
        from: 0,
        size: this.maxResults,
        _source: false,
        query: {
          bool: boolQuery,
        },
      });
      return this.convertElasticSearchResultsToPipelineResults(searchResults);
    } catch (e) {
      logError(e);
    }
    return [];
  }
}
