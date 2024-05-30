import type { WdOntologyContext } from '../../../ontology-context/ontology-context.js';
import type { PipelinePart } from '../../pipeline/pipeline-part.js';
import type { Query } from '../../pipeline/query.js';

export interface PipelinePartsFactoryConfig<T> {
  id: T;
  maxResults: number;
}

export interface CandidateSelectorFactoryConfig<T> extends PipelinePartsFactoryConfig<T> {}

export interface FusionCandidateSelectorFactoryConfig<FT, CT>
  extends PipelinePartsFactoryConfig<FT> {
  fusionWeights: number[];
  candidateSelectors: Array<CandidateSelectorFactoryConfig<CT>>;
}

export interface RerankerFactoryConfig<T> extends PipelinePartsFactoryConfig<T> {
  queryWeight?: number | undefined;
  featureWeights?: number[] | undefined;
}

export abstract class PipelinePartsFactory<CSC, FCSC, RC, Q extends Query> {
  abstract createCandidateSelector(
    query: Q,
    ontologyContext: WdOntologyContext,
    config: CandidateSelectorFactoryConfig<CSC>,
  ): PipelinePart;
  abstract createFusionCandidateSelector(
    query: Q,
    ontologyContext: WdOntologyContext,
    config: FusionCandidateSelectorFactoryConfig<FCSC, CSC>,
  ): PipelinePart;
  abstract createReranker(
    query: Q,
    ontologyContext: WdOntologyContext,
    predecessor: PipelinePart,
    config: RerankerFactoryConfig<RC>,
  ): PipelinePart;
}
