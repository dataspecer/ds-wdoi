import { type EntityId } from '../../../../../ontology-context/entities/common.js';
import { type WdOntologyContext } from '../../../../../ontology-context/ontology-context.js';
import { type Normalizer } from '../../../../normalizers/normalizer.js';
import { PipelinePartSingle, type PipelinePartResults } from '../../../pipeline-part.js';
import { type Query } from '../../../query.js';

export abstract class EntityTupleFeatureReranker extends PipelinePartSingle {
  protected readonly queryWeight: number;
  protected readonly firstFeatureWeight: number;
  protected readonly normalizer: Normalizer;

  constructor(
    query: Query,
    ontologyContext: WdOntologyContext,
    maxResults: number,
    predecessor: PipelinePartSingle | undefined,
    queryWeight: number,
    firstFeatureWeight: number,
    normalizer: Normalizer,
  ) {
    super(query, ontologyContext, maxResults, predecessor);
    this.queryWeight = queryWeight;
    this.firstFeatureWeight = firstFeatureWeight;
    this.normalizer = normalizer;
  }

  protected abstract getFirstFeature(entityId: EntityId): number;
  protected abstract getSecondFeature(entityId: EntityId): number;

  protected async executeInternal(
    predecessorResults: PipelinePartResults | undefined,
  ): Promise<PipelinePartResults> {
    if (predecessorResults !== undefined && predecessorResults.length !== 0) {
      this.normalizer.normalizeInPlace(predecessorResults);
      predecessorResults.forEach((res) => {
        const featuresScore =
          this.getFirstFeature(res.id) * this.firstFeatureWeight +
          this.getSecondFeature(res.id) * (1 - this.firstFeatureWeight);
        res.score = res.score * this.queryWeight + featuresScore * (1 - this.queryWeight);
      });
      predecessorResults.sort((a, b) => b.score - a.score);
      return predecessorResults;
    }
    return [];
  }
}
