import { type WdOntologyContext } from '../../../../ontology-context/ontology-context.js';
import { type Normalizer } from '../../../normalizers/normalizer.js';
import { type Query } from '../../query.js';
import {
  type PipelinePart,
  PipelinePartMulti,
  type PipelinePartResults,
} from '../../pipeline-part.js';

export class TupleFusion extends PipelinePartMulti {
  private readonly normalizer: Normalizer;
  private readonly firstWeight: number;

  constructor(
    query: Query,
    ontologyContext: WdOntologyContext,
    maxResults: number,
    predecessors: PipelinePart[],
    firstWeight: number,
    normalizer: Normalizer,
  ) {
    super(query, ontologyContext, maxResults, predecessors);
    this.firstWeight = firstWeight;
    this.normalizer = normalizer;
  }

  protected async executeInternal(
    predecessorResults: PipelinePartResults[],
  ): Promise<PipelinePartResults> {
    if (predecessorResults.length >= 2) {
      const firstResults = predecessorResults[0];
      const secondResults = predecessorResults[1];

      const firstMap = this.normalizer.normalizeInPlaceWithMap(firstResults);
      const secondMap = this.normalizer.normalizeInPlaceWithMap(secondResults);
      const secondWeight = 1 - this.firstWeight;

      const returnValue: PipelinePartResults = [];

      // Compute merged scores utilizing the first results as storage.
      for (const firstResult of firstResults) {
        const secondScore = secondMap.get(firstResult.id)?.score ?? 0;
        firstResult.score = firstResult.score * this.firstWeight + secondScore * secondWeight;
        returnValue.push(firstResult);
      }

      // Fill in the rest of the return values from the second results.
      for (const secondResult of secondResults) {
        if (!firstMap.has(secondResult.id)) {
          secondResult.score *= secondWeight;
          returnValue.push(secondResult);
        }
      }

      returnValue.sort((a, b) => b.score - a.score);
      return returnValue;
    }

    return [];
  }
}
