import type { WdOntologyContext } from '../../../ontology-context/ontology-context.js';
import { minMaxNormalizer } from '../../normalizers/min-max-normalizer.js';
import type { PipelinePart } from '../../pipeline/pipeline-part.js';
import {
  ElasticClassBM25FieldedQueryCreator,
  ElasticClassBM25QueryCreator,
} from '../../pipeline/pipeline-parts/candidate-selectors/elastic/elastic-query-creator.js';
import { ElasticSelector } from '../../pipeline/pipeline-parts/candidate-selectors/elastic/elastic-selector.js';
import { QdrantClassQueryCreator } from '../../pipeline/pipeline-parts/candidate-selectors/qdrant/qdrant-query-creator.js';
import { QdrantSelector } from '../../pipeline/pipeline-parts/candidate-selectors/qdrant/qdrant-selector.js';
import { Fusion } from '../../pipeline/pipeline-parts/fusion/fusion.js';
import { CrossEncoderReranker } from '../../pipeline/pipeline-parts/rerankers/cross-encoder-reranker.js';
import { ClassInstancesAndMappingsReranker } from '../../pipeline/pipeline-parts/rerankers/tuple-feature-reranker/class-instances-x-mapping-reranker.js';
import type { ClassQuery } from '../../pipeline/query.js';
import { crossEncoderClient } from '../../service-clients/clients/cross-encoder-client.js';
import { denseEmbedClient } from '../../service-clients/clients/dense-embed-client.js';
import { elasticClient } from '../../service-clients/clients/elastic-client.js';
import { qdrantClient } from '../../service-clients/clients/qdrant-client.js';
import { sparseEmbedClient } from '../../service-clients/clients/sparse-embed-client.js';
import {
  type CandidateSelectorFactoryConfig,
  type FusionCandidateSelectorFactoryConfig,
  PipelinePartsFactory,
  type RerankerFactoryConfig,
} from './pipeline-parts-factory.js';

export type ClassCandidateSelectorsIds =
  | 'elastic_bm25'
  | 'elastic_bm25_fielded'
  | 'qdrant_sparse'
  | 'qdrant_dense';

export type ClassFusionCandidateSelectorsIds = 'fusion';

export type ClassRerankersIds = 'cross_encoder' | 'feature_instance_mappings';

const VALID_CANDIDATE_SELECTORS_IDS: ClassCandidateSelectorsIds[] = [
  'elastic_bm25',
  'elastic_bm25_fielded',
  'qdrant_sparse',
  'qdrant_dense',
];

export class ClassesPipelinePartsFactory extends PipelinePartsFactory<
  ClassCandidateSelectorsIds,
  ClassFusionCandidateSelectorsIds,
  ClassRerankersIds,
  ClassQuery
> {
  createCandidateSelector(
    query: ClassQuery,
    ontologyContext: WdOntologyContext,
    config: CandidateSelectorFactoryConfig<ClassCandidateSelectorsIds>,
  ): PipelinePart | never {
    const isBM25 = config.id === 'elastic_bm25';
    const isBM25Fielded = config.id === 'elastic_bm25_fielded';
    const isDense = config.id === 'qdrant_dense';
    const isSparse = config.id === 'qdrant_sparse';

    if (isBM25 || isBM25Fielded) {
      const queryCreator = isBM25
        ? new ElasticClassBM25QueryCreator(ontologyContext, query, elasticClient.classesIndex)
        : new ElasticClassBM25FieldedQueryCreator(
            ontologyContext,
            query,
            elasticClient.classesIndex,
          );
      return new ElasticSelector(
        query,
        ontologyContext,
        config.maxResults,
        undefined,
        elasticClient,
        queryCreator,
      );
    } else if (isDense || isSparse) {
      const queryCreator = new QdrantClassQueryCreator(
        ontologyContext,
        query,
        qdrantClient.classesIndex,
        isDense ? qdrantClient.denseVectorName : qdrantClient.sparseVectorName,
      );
      return new QdrantSelector(
        query,
        ontologyContext,
        config.maxResults,
        undefined,
        qdrantClient,
        isDense ? denseEmbedClient : sparseEmbedClient,
        queryCreator,
      );
    } else {
      throw new Error(`Missing constructor for in classes selector factory.`);
    }
  }

  protected fusionConfigIsNotMissingCandidates(
    config: FusionCandidateSelectorFactoryConfig<
      ClassFusionCandidateSelectorsIds,
      ClassCandidateSelectorsIds
    >,
  ): boolean {
    if (
      config.candidateSelectors == null ||
      config.fusionWeights == null ||
      config.candidateSelectors.length < 2 ||
      config.candidateSelectors.length > 3 ||
      config.fusionWeights.length !== config.candidateSelectors.length
    ) {
      return false;
    }
    return true;
  }

  protected fusionConfigIsValidTuple(
    config: FusionCandidateSelectorFactoryConfig<
      ClassFusionCandidateSelectorsIds,
      ClassCandidateSelectorsIds
    >,
  ): boolean {
    if (
      config.candidateSelectors[0].id === config.candidateSelectors[1].id ||
      !VALID_CANDIDATE_SELECTORS_IDS.includes(config.candidateSelectors[0].id) ||
      !VALID_CANDIDATE_SELECTORS_IDS.includes(config.candidateSelectors[1].id)
    ) {
      return false;
    }
    return true;
  }

  protected fusionConfigIsValidTriple(
    config: FusionCandidateSelectorFactoryConfig<
      ClassFusionCandidateSelectorsIds,
      ClassCandidateSelectorsIds
    >,
  ): boolean {
    if (
      config.candidateSelectors[0].id !== 'qdrant_dense' ||
      config.candidateSelectors[1].id !== 'qdrant_sparse' ||
      (config.candidateSelectors[2].id !== 'elastic_bm25_fielded' &&
        config.candidateSelectors[2].id !== 'elastic_bm25')
    ) {
      return false;
    }
    return true;
  }

  protected fusionConfigIsValid(
    config: FusionCandidateSelectorFactoryConfig<
      ClassFusionCandidateSelectorsIds,
      ClassCandidateSelectorsIds
    >,
  ): boolean {
    if (
      config.id !== 'fusion' ||
      !this.fusionConfigIsNotMissingCandidates(config) ||
      (config.candidateSelectors.length === 2 && !this.fusionConfigIsValidTuple(config)) ||
      (config.candidateSelectors.length === 3 && !this.fusionConfigIsValidTriple(config))
    ) {
      return false;
    }
    return true;
  }

  createFusionCandidateSelector(
    query: ClassQuery,
    ontologyContext: WdOntologyContext,
    config: FusionCandidateSelectorFactoryConfig<
      ClassFusionCandidateSelectorsIds,
      ClassCandidateSelectorsIds
    >,
  ): PipelinePart | never {
    if (this.fusionConfigIsValid(config)) {
      const candidateSelectors = config.candidateSelectors.map((selector) =>
        this.createCandidateSelector(query, ontologyContext, selector),
      );
      return new Fusion(
        query,
        ontologyContext,
        config.maxResults,
        candidateSelectors,
        config.fusionWeights,
        minMaxNormalizer,
      );
    }
    throw new Error(`Missing constructor for classes in fusion factory.`);
  }

  createReranker(
    query: ClassQuery,
    ontologyContext: WdOntologyContext,
    predecessor: PipelinePart,
    config: RerankerFactoryConfig<ClassRerankersIds>,
  ): PipelinePart | never {
    if (config.id === 'cross_encoder') {
      return new CrossEncoderReranker(
        query,
        ontologyContext,
        predecessor,
        config.maxResults,
        crossEncoderClient,
        false,
      );
    } else if (config.id === 'feature_instance_mappings') {
      if (
        config.queryWeight == null ||
        config.featureWeights == null ||
        config.featureWeights.length !== 1
      ) {
        throw new Error('Invalid parameters of feature_instance_mappings class reranker.');
      }
      return new ClassInstancesAndMappingsReranker(
        query,
        ontologyContext,
        config.maxResults,
        predecessor,
        config.queryWeight,
        config.featureWeights[0],
        minMaxNormalizer,
      );
    } else {
      throw new Error(`Missing constructor for classes reranker factory.`);
    }
  }
}
