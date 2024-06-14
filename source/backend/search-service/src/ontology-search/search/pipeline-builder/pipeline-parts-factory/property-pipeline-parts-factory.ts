import type { WdOntologyContext } from '../../../ontology-context/ontology-context.js';
import { minMaxNormalizer } from '../../normalizers/min-max-normalizer.js';
import type { PipelinePart } from '../../pipeline/pipeline-part.js';
import { ElasticPropertyBM25QueryCreator } from '../../pipeline/pipeline-parts/candidate-selectors/elastic/elastic-query-creator.js';
import { ElasticSelector } from '../../pipeline/pipeline-parts/candidate-selectors/elastic/elastic-selector.js';
import { QdrantPropertyQueryCreator } from '../../pipeline/pipeline-parts/candidate-selectors/qdrant/qdrant-query-creator.js';
import { QdrantSelector } from '../../pipeline/pipeline-parts/candidate-selectors/qdrant/qdrant-selector.js';
import { Fusion } from '../../pipeline/pipeline-parts/fusion/fusion.js';
import { CrossEncoderReranker } from '../../pipeline/pipeline-parts/rerankers/cross-encoder-reranker.js';
import { PropertyUsageAndMappingsReranker } from '../../pipeline/pipeline-parts/rerankers/tuple-feature-reranker/property-usage-x-mappings-reranker.js';
import type { PropertyQuery } from '../../pipeline/query.js';
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

export type PropertyCandidateSelectorsIds = 'elastic_bm25' | 'qdrant_sparse' | 'qdrant_dense';

export type PropertyFusionCandidateSelectorsIds = 'fusion';

export type PropertyRerankersIds = 'cross_encoder' | 'feature_usage_mappings';

export class PropertiesPipelinePartsFactory extends PipelinePartsFactory<
  PropertyCandidateSelectorsIds,
  PropertyFusionCandidateSelectorsIds,
  PropertyRerankersIds,
  PropertyQuery
> {
  createCandidateSelector(
    query: PropertyQuery,
    ontologyContext: WdOntologyContext,
    config: CandidateSelectorFactoryConfig<PropertyCandidateSelectorsIds>,
  ): PipelinePart | never {
    const isBM25 = config.id === 'elastic_bm25';
    const isDense = config.id === 'qdrant_dense';
    const isSparse = config.id === 'qdrant_sparse';

    if (isBM25) {
      const queryCreator = new ElasticPropertyBM25QueryCreator(
        ontologyContext,
        query,
        elasticClient.propertiesIndex,
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
      const queryCreator = new QdrantPropertyQueryCreator(
        ontologyContext,
        query,
        qdrantClient.propertiesIndex,
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
      throw new Error(`Missing constructor for in properties selector factory.`);
    }
  }

  protected fusionConfigIsNotMissingCandidates(
    config: FusionCandidateSelectorFactoryConfig<
      PropertyFusionCandidateSelectorsIds,
      PropertyCandidateSelectorsIds
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
      PropertyFusionCandidateSelectorsIds,
      PropertyCandidateSelectorsIds
    >,
  ): boolean {
    if (
      config.candidateSelectors[0].id !== 'qdrant_dense' ||
      (config.candidateSelectors[1].id !== 'elastic_bm25' &&
        config.candidateSelectors[1].id !== 'qdrant_sparse')
    ) {
      return false;
    }
    return true;
  }

  protected fusionConfigIsValidTriple(
    config: FusionCandidateSelectorFactoryConfig<
      PropertyFusionCandidateSelectorsIds,
      PropertyCandidateSelectorsIds
    >,
  ): boolean {
    if (
      config.candidateSelectors[0].id !== 'qdrant_dense' ||
      config.candidateSelectors[1].id !== 'qdrant_sparse' ||
      config.candidateSelectors[2].id !== 'elastic_bm25'
    ) {
      return false;
    }
    return true;
  }

  protected fusionConfigIsValid(
    config: FusionCandidateSelectorFactoryConfig<
      PropertyFusionCandidateSelectorsIds,
      PropertyCandidateSelectorsIds
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
    query: PropertyQuery,
    ontologyContext: WdOntologyContext,
    config: FusionCandidateSelectorFactoryConfig<
      PropertyFusionCandidateSelectorsIds,
      PropertyCandidateSelectorsIds
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
    throw new Error(`Missing constructor for in properties fusion factory.`);
  }

  createReranker(
    query: PropertyQuery,
    ontologyContext: WdOntologyContext,
    predecessor: PipelinePart,
    config: RerankerFactoryConfig<PropertyRerankersIds>,
  ): PipelinePart | never {
    if (config.id === 'cross_encoder') {
      return new CrossEncoderReranker(
        query,
        ontologyContext,
        predecessor,
        config.maxResults,
        crossEncoderClient,
        true,
      );
    } else if (config.id === 'feature_usage_mappings') {
      if (
        config.queryWeight == null ||
        config.featureWeights == null ||
        config.featureWeights.length !== 1
      ) {
        throw new Error('Invalid parameters of feature_usage_mappings property reranker.');
      }
      return new PropertyUsageAndMappingsReranker(
        query,
        ontologyContext,
        config.maxResults,
        predecessor,
        config.queryWeight,
        config.featureWeights[0],
        minMaxNormalizer,
      );
    } else {
      throw new Error(`Missing constructor for properties reranker factory.`);
    }
  }
}
