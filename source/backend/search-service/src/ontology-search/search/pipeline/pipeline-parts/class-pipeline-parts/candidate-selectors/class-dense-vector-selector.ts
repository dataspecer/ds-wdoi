import { type WdOntologyContext } from '../../../../../ontology-context/ontology-context.js';
import { type DenseEmbedClient } from '../../../../service-clients/clients/dense-embed-client.js';
import { type QdrantClientWrapper } from '../../../../service-clients/clients/qdrant-client.js';
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
    throw new Error('Method not implemented.');
  }
}
