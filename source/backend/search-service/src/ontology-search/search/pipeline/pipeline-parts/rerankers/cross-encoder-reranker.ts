import { type WdOntologyContext } from '../../../../ontology-context/ontology-context.js';
import {
  CROSS_ENCODER_MAX_SENTENCES,
  type CrossEncoderRerankerClient,
  type CrossEncoderRerankerInput,
} from '../../../service-clients/clients/cross-encoder-client.js';
import {
  type PipelinePart,
  PipelinePartSingle,
  type PipelinePartResults,
} from '../../pipeline-part.js';
import { type Query } from '../../query.js';
import { type EntityId } from '../../../../ontology-context/entities/common.js';
import { type WdEntity } from '../../../../ontology-context/entities/wd-entity.js';

export class CrossEncoderReranker extends PipelinePartSingle {
  private readonly crossEncoderClient: CrossEncoderRerankerClient;
  private readonly isProperty: boolean;

  constructor(
    query: Query,
    ontologyContext: WdOntologyContext,
    predecessor: PipelinePart | undefined,
    crossEncoderClient: CrossEncoderRerankerClient,
    isProperty: boolean = false,
  ) {
    super(query, ontologyContext, CROSS_ENCODER_MAX_SENTENCES, predecessor);
    this.crossEncoderClient = crossEncoderClient;
    this.isProperty = isProperty;
  }

  protected getEntityMap(): ReadonlyMap<EntityId, WdEntity> {
    if (this.isProperty) {
      return this.ontologyContext.properties;
    } else {
      return this.ontologyContext.classes;
    }
  }

  protected createInput(predecessorResults: PipelinePartResults): CrossEncoderRerankerInput {
    const input: CrossEncoderRerankerInput = {
      query: this.query.query,
      ids: [],
      sentences: [],
    };

    const entityMap = this.getEntityMap();
    predecessorResults.forEach((ppr, i) => {
      const entity = entityMap.get(ppr.id);
      if (entity !== undefined) {
        input.ids.push(entity.id);
        input.sentences.push(entity.lexicalization);
      }
    });

    return input;
  }

  protected async executeInternal(
    predecessorResults: PipelinePartResults,
  ): Promise<PipelinePartResults> {
    const input = this.createInput(predecessorResults);
    const results = await this.crossEncoderClient.rerank(input);

    if (!results.error && results.results !== undefined) {
      // Results are sorted from the backend service.
      return results.results;
    }

    return [];
  }
}
