import { logError } from '../../../../../../logging/log.js';
import type { WdOntologyContext } from '../../../../../ontology-context/ontology-context.js';
import type { DenseEmbedClient } from '../../../../service-clients/clients/dense-embed-client.js';
import type { QdrantClientWrapper } from '../../../../service-clients/clients/qdrant-client.js';
import type { SparseEmbedClient } from '../../../../service-clients/clients/sparse-embed-client.js';
import { PipelinePartSingle } from '../../../pipeline-part.js';
import type { PipelinePart, PipelinePartResults } from '../../../pipeline-part.js';
import type { Query } from '../../../query.js';
import type { QdrantClassUsageFilter, QdrantQueryCreator } from './qdrant-query-creator.js';

export class QdrantSelector extends PipelinePartSingle {
  protected readonly qdrantClient: QdrantClientWrapper;
  protected readonly embedClient: DenseEmbedClient | SparseEmbedClient;
  protected readonly queryCreator: QdrantQueryCreator;

  constructor(
    query: Query,
    ontologyContext: WdOntologyContext,
    maxResults: number,
    predecessor: PipelinePart | undefined,
    qdrantClient: QdrantClientWrapper,
    embedClient: DenseEmbedClient | SparseEmbedClient,
    queryCreator: QdrantQueryCreator,
  ) {
    super(query, ontologyContext, maxResults, predecessor);
    this.qdrantClient = qdrantClient;
    this.embedClient = embedClient;
    this.queryCreator = queryCreator;
  }

  convertQdrantResultsToPipelineResults(
    searchResults: Array<{ id: number | string; score: number }>,
  ): PipelinePartResults {
    return searchResults.map((v) => {
      return {
        id: v.id as number,
        score: v.score,
      };
    });
  }

  protected async executeInternal(
    predecessorResults: PipelinePartResults | undefined,
  ): Promise<PipelinePartResults> {
    try {
      const usageFilter: undefined | QdrantClassUsageFilter = this.queryCreator.createFilter();
      const results = await this.embedClient.embed({ sentence: this.query.query });
      if (!results.error && results.results !== undefined) {
        const embVector = results.results;
        const searchResults = await this.qdrantClient.qc.search(this.queryCreator.collectionName, {
          vector: {
            name: this.queryCreator.vectorName,
            vector: embVector as any,
          },
          limit: this.maxResults,
          filter: usageFilter,
        });
        return this.convertQdrantResultsToPipelineResults(searchResults);
      }
    } catch (e) {
      logError(e);
    }
    return [];
  }
}
