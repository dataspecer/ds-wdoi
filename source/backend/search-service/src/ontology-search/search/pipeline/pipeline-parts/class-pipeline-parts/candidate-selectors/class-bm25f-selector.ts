import { type WdOntologyContext } from '../../../../../ontology-context/ontology-context.js';
import { type ElasticClientWrapper } from '../../../../service-clients/clients/elastic-client.js';
import { type PipelinePart, type PipelinePartResults } from '../../../pipeline-part.js';
import { type ClassQuery } from '../../../query.js';
import { ClassPipelinePart } from '../class-pipeline-part.js';

export class ClassBM25FSelector extends ClassPipelinePart {
  protected readonly elasticClient: ElasticClientWrapper;

  constructor(
    classQuery: ClassQuery,
    ontologyContext: WdOntologyContext,
    maxResults: number,
    predecessor: PipelinePart | undefined,
    elasticClient: ElasticClientWrapper,
  ) {
    super(classQuery, ontologyContext, maxResults, predecessor);
    this.elasticClient = elasticClient;
  }

  protected async executeInternal(
    predecessorResults: PipelinePartResults | undefined,
  ): Promise<PipelinePartResults> {
    throw new Error('Method not implemented.');
  }
}
