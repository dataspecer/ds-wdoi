import { type EntityId } from '../../ontology-context/entities/common.js';
import { type PipelinePartResult, type PipelinePartResults } from '../pipeline/pipeline-part.js';

export abstract class Normalizer {
  protected findMinMax(results: PipelinePartResults): [number, number] {
    let min = results[0].score;
    let max = results[0].score;

    for (const res of results) {
      if (min > res.score) {
        min = res.score;
      }
      if (max < res.score) {
        max = res.score;
      }
    }

    return [min, max];
  }

  abstract normalizeInPlace(results: PipelinePartResults): void;
  abstract normalizeInPlaceWithMap(results: PipelinePartResults): Map<EntityId, PipelinePartResult>;
}
