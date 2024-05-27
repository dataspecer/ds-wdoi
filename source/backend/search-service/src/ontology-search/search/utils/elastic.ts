import {
  type QueryDslQueryContainer,
  type AggregationsAggregate,
  type SearchResponse,
} from '@elastic/elasticsearch/lib/api/types.js';
import { type PipelinePartResults } from '../pipeline/pipeline-part.js';
import type { EntityIdString } from '../../ontology-context/entities/common.js';

export function convertElasticSearchResultsToPipelineResults(
  searchResults: SearchResponse<unknown, Record<string, AggregationsAggregate>>,
): PipelinePartResults {
  return searchResults.hits.hits.flatMap((hit) => {
    if (hit != null) {
      const id = Number(hit._id);
      const score = hit._score as number;
      return [{ id, score }];
    }
    return [];
  });
}

export function createTermsFieldFilter(
  field: string,
  terms: EntityIdString[][],
): QueryDslQueryContainer[] {
  return terms.map((v) => {
    return {
      terms: {
        [field]: v,
      },
    };
  });
}
