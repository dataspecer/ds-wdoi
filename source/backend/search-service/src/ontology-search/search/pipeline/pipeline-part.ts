import { type EntityId } from '../../ontology-context/entities/common.js';
import { type WdOntologyContext } from '../../ontology-context/ontology-context.js';
import { type Query } from './query.js';

export interface PipelinePartResult {
  id: EntityId;
  score: number;
}

export type PipelinePartResults = PipelinePartResult[];

export abstract class PipelinePart {
  protected readonly query: Query;
  protected readonly ontologyContext: WdOntologyContext;
  protected readonly maxResults: number;

  constructor(query: Query, ontologyContext: WdOntologyContext, maxResults: number) {
    this.query = query;
    this.ontologyContext = ontologyContext;
    this.maxResults = maxResults;
  }

  abstract execute(): Promise<PipelinePartResults>;
}

export abstract class PipelinePartSingle extends PipelinePart {
  protected readonly predecesor: PipelinePart | undefined;

  constructor(
    query: Query,
    ontologyContext: WdOntologyContext,
    maxResults: number,
    predecessor: PipelinePart | undefined = undefined,
  ) {
    super(query, ontologyContext, maxResults);
    this.predecesor = predecessor;
  }

  async execute(): Promise<PipelinePartResults> {
    let predecessorResults: PipelinePartResults | undefined;

    if (this.predecesor !== undefined) {
      predecessorResults = await this.predecesor.execute();
    }

    return (await this.executeInternal(predecessorResults)).slice(0, this.maxResults);
  }

  protected abstract executeInternal(
    predecessorResults: PipelinePartResults | undefined,
  ): Promise<PipelinePartResults>;
}

export abstract class PipelinePartMulti extends PipelinePart {
  protected readonly predecesors: PipelinePart[];

  constructor(
    query: Query,
    ontologyContext: WdOntologyContext,
    maxResults: number,
    predecessors: PipelinePart[],
  ) {
    super(query, ontologyContext, maxResults);
    this.predecesors = predecessors;
  }

  async execute(): Promise<PipelinePartResults> {
    let predecessorResults: PipelinePartResults[] = [];

    const promises: Array<Promise<PipelinePartResults>> = [];
    for (const pred of this.predecesors) {
      promises.push(pred.execute());
    }
    predecessorResults = await Promise.all(promises);

    return (await this.executeInternal(predecessorResults)).slice(0, this.maxResults);
  }

  protected abstract executeInternal(
    predecessorResults: PipelinePartResults[],
  ): Promise<PipelinePartResults>;
}
