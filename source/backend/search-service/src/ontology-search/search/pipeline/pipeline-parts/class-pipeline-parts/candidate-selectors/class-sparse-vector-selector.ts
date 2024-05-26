import { type WdOntologyContext } from '../../../../../ontology-context/ontology-context.js';
import { type QdrantClientWrapper } from '../../../../service-clients/clients/qdrant-client.js';
import { type SparseEmbedClient } from '../../../../service-clients/clients/sparse-embed-client.js';
import { type PipelinePart, type PipelinePartResults } from '../../../pipeline-part.js';
import { type ClassQuery } from '../../../query.js';
import { ClassPipelinePart } from '../class-pipeline-part.js';

export class ClassDenseVectorSelector extends ClassPipelinePart {
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
    throw new Error('Method not implemented.');
  }
}
