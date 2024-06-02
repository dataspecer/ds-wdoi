import type { WdOntologyContext } from '../../ontology-context/ontology-context.js';
import type { PipelinePart } from '../pipeline/pipeline-part.js';
import type { ClassQuery, PropertyQuery, Query } from '../pipeline/query.js';
import {
  type ClassCandidateSelectorsIds,
  type ClassFusionCandidateSelectorsIds,
  type ClassRerankersIds,
  ClassesPipelinePartsFactory,
} from './pipeline-parts-factory/class-pipeline-parts-factory.js';
import type {
  CandidateSelectorFactoryConfig,
  FusionCandidateSelectorFactoryConfig,
  PipelinePartsFactory,
  RerankerFactoryConfig,
} from './pipeline-parts-factory/pipeline-parts-factory.js';
import {
  type PropertyCandidateSelectorsIds,
  type PropertyFusionCandidateSelectorsIds,
  type PropertyRerankersIds,
  PropertiesPipelinePartsFactory,
} from './pipeline-parts-factory/property-pipeline-parts-factory.js';

export interface PipelineConfig<CT, FT, RT> {
  candidateSelectorConfig: CandidateSelectorFactoryConfig<CT> | undefined;
  fusionCandidateSelectorConfig: FusionCandidateSelectorFactoryConfig<FT, CT> | undefined;
  rerankerConfig: Array<RerankerFactoryConfig<RT>> | undefined;
}

export class PipelineBuilder {
  protected readonly classPipelinePartsFactory = new ClassesPipelinePartsFactory();
  protected readonly propertyPipelinePartsFactory = new PropertiesPipelinePartsFactory();
  protected readonly ontologyContext: WdOntologyContext;

  constructor(ontologyContext: WdOntologyContext) {
    this.ontologyContext = ontologyContext;
  }

  createClassSearchPipeline(
    query: ClassQuery,
    config: PipelineConfig<
      ClassCandidateSelectorsIds,
      ClassFusionCandidateSelectorsIds,
      ClassRerankersIds
    >,
  ): PipelinePart | undefined {
    return this.createPipelineInternal(query, config, this.classPipelinePartsFactory);
  }

  createPropertySearchPipeline(
    query: PropertyQuery,
    config: PipelineConfig<
      PropertyCandidateSelectorsIds,
      PropertyFusionCandidateSelectorsIds,
      PropertyRerankersIds
    >,
  ): PipelinePart | undefined {
    return this.createPipelineInternal(query, config, this.propertyPipelinePartsFactory);
  }

  protected createPipelineInternal<CT, FT, RT, Q extends Query>(
    query: Q,
    config: PipelineConfig<CT, FT, RT>,
    abstractFactory: PipelinePartsFactory<CT, FT, RT, Q>,
  ): PipelinePart | undefined {
    this.checkQueryConfig(query, config);
    let pipeline: PipelinePart | undefined;

    if (config.candidateSelectorConfig != null) {
      pipeline = abstractFactory.createCandidateSelector(
        query,
        this.ontologyContext,
        config.candidateSelectorConfig,
      );
    } else if (config.fusionCandidateSelectorConfig != null) {
      pipeline = abstractFactory.createFusionCandidateSelector(
        query,
        this.ontologyContext,
        config.fusionCandidateSelectorConfig,
      );
    } else return pipeline;

    if (config.rerankerConfig != null) {
      for (const rerankConf of config.rerankerConfig) {
        pipeline = abstractFactory.createReranker(
          query,
          this.ontologyContext,
          pipeline,
          rerankConf,
        );
      }
    }

    return pipeline;
  }

  protected checkQueryConfig<CT, FT, RT, Q extends Query>(
    query: Q,
    config: PipelineConfig<CT, FT, RT>,
  ): void | never {
    const selectorPresent = config.candidateSelectorConfig != null;
    const fusionSelectorPresent = config.fusionCandidateSelectorConfig != null;
    const rerankerPresent = config.rerankerConfig != null;

    // Missing selectors.
    if (!selectorPresent && !fusionSelectorPresent) throw new Error('Missing candidate selectors.');
    // Ambiguous selectors.
    if (selectorPresent && fusionSelectorPresent) throw new Error('Ambiguous candidate selectors.');
    // Missing rerankers on their definition.
    if (rerankerPresent && config.rerankerConfig?.length === 0)
      throw new Error('Missing rerankers in the provided reranker config.');
    // Empty query.
    if (query.text == null || query.text === '') throw new Error('Empty query provided');
    // Invalid fusion params.
    if (
      fusionSelectorPresent &&
      (config.fusionCandidateSelectorConfig?.candidateSelectors.length !== 2 ||
        config.fusionCandidateSelectorConfig?.fusionWeights.length !== 1)
    )
      throw new Error('Missing parameters on fusion candidate selector.');
  }
}
