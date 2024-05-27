import type { EntityId } from '../../ontology-context/entities/common.js';
import { type PipelinePartResults } from '../pipeline/pipeline-part.js';

export function convertQdrantResultsToPipelineResults(
  searchResults: Array<{ id: number | string; score: number }>,
): PipelinePartResults {
  return searchResults.map((v) => {
    return {
      id: v.id as number,
      score: v.score,
    };
  });
}

export interface QdrantClassUsageFilter {
  must: Array<{ key: string; match: { any: EntityId[] } }>;
}

export function createQdrantTermsFilter(
  field: string,
  terms: EntityId[][],
): QdrantClassUsageFilter {
  const filter: QdrantClassUsageFilter = { must: [] };
  filter.must = terms.map((v) => {
    return {
      key: field,
      match: {
        any: v,
      },
    };
  });

  return filter;
}
