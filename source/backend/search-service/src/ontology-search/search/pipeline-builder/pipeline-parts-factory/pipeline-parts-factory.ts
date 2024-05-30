import type { PipelinePart } from '../../pipeline/pipeline-part.js';
import type { Query } from '../../pipeline/query.js';

export interface PipelinePartsFactoryConfig<T, Q extends Query> {
  query: Q;
  id: T;
  maxResults: number;
}

export interface CandidateSelectorFactoryConfig<T, Q extends Query>
  extends PipelinePartsFactoryConfig<T, Q> {}

export interface FusionCandidateSelectorFactoryConfig<T, Q extends Query>
  extends PipelinePartsFactoryConfig<T, Q> {
  fusionWeights: number[];
  candidateSelectors: Array<CandidateSelectorFactoryConfig<T, Q>>;
}

export interface RerankerFactoryConfig<T, Q extends Query>
  extends PipelinePartsFactoryConfig<T, Q> {
  queryWeight: number | undefined;
  featureWeights: number[] | undefined;
}

export abstract class PipelinePartsFactory<CSC, FCSC, RC, Q extends Query> {
  abstract createCandidateSelector(config: CandidateSelectorFactoryConfig<CSC, Q>): PipelinePart;
  abstract createFusionCandidateSelector(
    config: FusionCandidateSelectorFactoryConfig<FCSC, Q>,
  ): PipelinePart;
  abstract createReranker(
    predecessor: PipelinePart,
    config: RerankerFactoryConfig<RC, Q>,
  ): PipelinePart;
}
