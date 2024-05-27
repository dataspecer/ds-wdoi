import { logError } from '../../../../../../logging/log.js';
import { type EntityId } from '../../../../../ontology-context/entities/common.js';
import { type WdOntologyContext } from '../../../../../ontology-context/ontology-context.js';
import { type DenseEmbedClient } from '../../../../service-clients/clients/dense-embed-client.js';
import { type QdrantClientWrapper } from '../../../../service-clients/clients/qdrant-client.js';
import {
  convertQdrantResultsToPipelineResults,
  createQdrantTermsFilter,
} from '../../../../utils/qdrant.js';
import { type PipelinePart, type PipelinePartResults } from '../../../pipeline-part.js';
import { type ClassQuery } from '../../../query.js';
import { ClassPipelinePart } from '../class-pipeline-part.js';

export class ClassDenseVectorSelector extends ClassPipelinePart {
  protected readonly qdrantClient: QdrantClientWrapper;
  protected readonly denseEmbedClient: DenseEmbedClient;

  constructor(
    classQuery: ClassQuery,
    ontologyContext: WdOntologyContext,
    maxResults: number,
    predecessor: PipelinePart | undefined,
    qdrantClient: QdrantClientWrapper,
    denseEmbedClient: DenseEmbedClient,
  ) {
    super(classQuery, ontologyContext, maxResults, predecessor);
    this.qdrantClient = qdrantClient;
    this.denseEmbedClient = denseEmbedClient;
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
      const results = await this.denseEmbedClient.embed({ sentence: this.classQuery.query });
      if (!results.error && results.results !== undefined) {
        const denseVector = results.results;
        const searchResults = await this.qdrantClient.qc.search(this.qdrantClient.classesIndex, {
          vector: {
            name: this.qdrantClient.denseVectorName,
            vector: denseVector,
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
