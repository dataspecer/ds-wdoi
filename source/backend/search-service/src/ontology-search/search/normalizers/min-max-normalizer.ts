import { type EntityId } from '../../ontology-context/entities/common.js';
import { type PipelinePartResult, type PipelinePartResults } from '../pipeline/pipeline-part.js';
import { Normalizer } from './normalizer.js';

export class MinMaxNormalizer extends Normalizer {
  normalizeInPlace(results: PipelinePartResults): void {
    if (results.length !== 0) {
      const [min, max] = this.findMinMax(results);

      const divider = max - min;

      for (const res of results) {
        res.score = (res.score - min) / divider;
      }
    }
  }

  normalizeInPlaceWithMap(results: PipelinePartResults): Map<EntityId, PipelinePartResult> {
    const map = new Map<EntityId, PipelinePartResult>();

    if (results.length !== 0) {
      const [min, max] = this.findMinMax(results);

      const divider = max - min;

      for (const res of results) {
        res.score = (res.score - min) / divider;
        map.set(res.id, res);
      }
    }

    return map;
  }
}
