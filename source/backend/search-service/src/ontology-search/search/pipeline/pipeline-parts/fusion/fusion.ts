import type { EntityId } from '../../../../ontology-context/entities/common.js';
import type { WdOntologyContext } from '../../../../ontology-context/ontology-context.js';
import type { Normalizer } from '../../../normalizers/normalizer.js';
import {
  PipelinePartMulti,
  type PipelinePart,
  type PipelinePartResults,
  type PipelinePartResult,
} from '../../pipeline-part.js';
import type { Query } from '../../query.js';

export class Fusion extends PipelinePartMulti {
  private readonly normalizer: Normalizer;
  private readonly weights: number[];

  constructor(
    query: Query,
    ontologyContext: WdOntologyContext,
    maxResults: number,
    predecessors: PipelinePart[],
    weights: number[],
    normalizer: Normalizer,
  ) {
    super(query, ontologyContext, maxResults, predecessors);
    if (predecessors.length < 2) throw new Error('Invalid number of predecesors for fusion.');
    if (weights.length !== predecessors.length)
      throw new Error('Invalid number of weights for fusion.');

    this.weights = weights;
    this.normalizer = normalizer;
  }

  protected async executeInternal(
    predecessorResults: PipelinePartResults[],
  ): Promise<PipelinePartResults> {
    if (predecessorResults.length !== this.predecesors.length)
      throw new Error('Fusion received invalid number of results from previous phase.');

    predecessorResults.forEach((value) => {
      this.normalizer.normalizeInPlace(value);
    });

    const returnValues: PipelinePartResults = [];
    const returnValuesMap = new Map<EntityId, PipelinePartResult>();
    predecessorResults.forEach((results, idx) => {
      results.forEach((result) => {
        const storedRecord = returnValuesMap.get(result.id);
        if (storedRecord !== undefined) {
          storedRecord.score += result.score * this.weights[idx];
        } else {
          result.score *= this.weights[idx];
          returnValuesMap.set(result.id, result);
          returnValues.push(result);
        }
      });
    });

    returnValues.sort((a, b) => b.score - a.score);
    return returnValues;
  }
}
