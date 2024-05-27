import { logError } from '../../../../../../logging/log.js';
import { type EntityId } from '../../../../../ontology-context/entities/common.js';
import { type WdOntologyContext } from '../../../../../ontology-context/ontology-context.js';
import { type QdrantClientWrapper } from '../../../../service-clients/clients/qdrant-client.js';
import { type SparseEmbedClient } from '../../../../service-clients/clients/sparse-embed-client.js';
import {
  createQdrantTermsFilter,
  convertQdrantResultsToPipelineResults,
} from '../../../../utils/qdrant.js';
import { type PipelinePart, type PipelinePartResults } from '../../../pipeline-part.js';
import { type ClassQuery } from '../../../query.js';
import { ClassPipelinePart } from '../class-pipeline-part.js';

export class ClassSparseVectorSelector extends ClassPipelinePart {
  protected readonly qdrantClient: QdrantClientWrapper;
  protected readonly sparseEmbedClient: SparseEmbedClient;

  constructor(
    classQuery: ClassQuery,
    ontologyContext: WdOntologyContext,
    maxResults: number,
    predecessor: PipelinePart | undefined,
    qdrantClient: QdrantClientWrapper,
    sparseEmbedClient: SparseEmbedClient,
  ) {
    super(classQuery, ontologyContext, maxResults, predecessor);
    this.qdrantClient = qdrantClient;
    this.sparseEmbedClient = sparseEmbedClient;
  }

  protected async executeInternal(
    predecessorResults: PipelinePartResults | undefined,
  ): Promise<PipelinePartResults> {
    const notAsStrings = false;
    const usageClasses = this.computeUsageClassesForProperties(notAsStrings);
    const usageFilter = createQdrantTermsFilter(
      'ancestorsDefiningProperties',
      usageClasses as EntityId[][],
    );

    try {
      const results = await this.sparseEmbedClient.embed({ sentence: this.classQuery.query });
      if (!results.error && results.results !== undefined) {
        const spareVector = results.results;
        const searchResults = await this.qdrantClient.qc.search(this.qdrantClient.classesIndex, {
          vector: {
            name: this.qdrantClient.sparseVectorName,
            vector: spareVector,
          },
          limit: this.maxResults,
          filter: usageFilter.must.length !== 0 ? usageFilter : undefined,
        });
        return convertQdrantResultsToPipelineResults(searchResults);
      }
    } catch (e) {
      logError(e);
    }
    return [];
  }
}
