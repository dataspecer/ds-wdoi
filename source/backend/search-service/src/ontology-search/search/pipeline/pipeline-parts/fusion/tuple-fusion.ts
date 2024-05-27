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
    if (predecessorResults.length !== 0) {
      const first = predecessorResults[0];
      const second = predecessorResults[1];

      const firstMap = this.normalizer.normalizeInPlaceWithMap(first);
      const secondMap = this.normalizer.normalizeInPlaceWithMap(second);

      const returnValue: PipelinePartResults = [];

      // Compute merged scores utilizing the first results as storage.
      for (const firstResult of first) {
        const secondScore = secondMap.get(firstResult.id)?.score ?? 0;
        firstResult.score =
          firstResult.score * this.firstWeight + secondScore * (1 - this.firstWeight);
        returnValue.push(firstResult);
      }

      // Fill in the rest of the return values from the second results.
      for (const secondResult of second) {
        if (!firstMap.has(secondResult.id)) returnValue.push(secondResult);
      }

      returnValue.sort((a, b) => b.score - a.score);
      return returnValue;
    }

    return [];
  }
}
