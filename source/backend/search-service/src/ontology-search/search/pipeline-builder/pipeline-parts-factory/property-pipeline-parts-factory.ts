import type { WdOntologyContext } from '../../../ontology-context/ontology-context.js';
import { minMaxNormalizer } from '../../normalizers/min-max-normalizer.js';
import type { PipelinePart } from '../../pipeline/pipeline-part.js';
import { ElasticPropertyBM25QueryCreator } from '../../pipeline/pipeline-parts/candidate-selectors/elastic/elastic-query-creator.js';
import { ElasticSelector } from '../../pipeline/pipeline-parts/candidate-selectors/elastic/elastic-selector.js';
import { QdrantPropertyQueryCreator } from '../../pipeline/pipeline-parts/candidate-selectors/qdrant/qdrant-query-creator.js';
import { QdrantSelector } from '../../pipeline/pipeline-parts/candidate-selectors/qdrant/qdrant-selector.js';
import { TupleFusion } from '../../pipeline/pipeline-parts/fusion/tuple-fusion.js';
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
  ): PipelinePart {
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

  protected checkFusionConfig(
    config: FusionCandidateSelectorFactoryConfig<
      PropertyFusionCandidateSelectorsIds,
      PropertyCandidateSelectorsIds
    >,
  ): void | never {
    if (
      config.candidateSelectors == null ||
      config.fusionWeights == null ||
      config.candidateSelectors.length !== 2 ||
      config.fusionWeights.length !== 1 ||
      config.candidateSelectors[0].id !== 'qdrant_dense' ||
      (config.candidateSelectors[1].id !== 'elastic_bm25' &&
        config.candidateSelectors[1].id !== 'qdrant_sparse')
    ) {
      throw new Error('Invalid parameters on properties fusion.');
    }
  }

  createFusionCandidateSelector(
    query: PropertyQuery,
    ontologyContext: WdOntologyContext,
    config: FusionCandidateSelectorFactoryConfig<
      PropertyFusionCandidateSelectorsIds,
      PropertyCandidateSelectorsIds
    >,
  ): PipelinePart {
    if (config.id === 'fusion') {
      this.checkFusionConfig(config);
      const first = this.createCandidateSelector(
        query,
        ontologyContext,
        config.candidateSelectors[0],
      );
      const second = this.createCandidateSelector(
        query,
        ontologyContext,
        config.candidateSelectors[1],
      );
      const firstWeight = config.fusionWeights[0];
      return new TupleFusion(
        query,
        ontologyContext,
        config.maxResults,
        [first, second],
        firstWeight,
        minMaxNormalizer,
      );
    } else {
      throw new Error(`Missing constructor for in properties fusion factory.`);
    }
  }

  createReranker(
    query: PropertyQuery,
    ontologyContext: WdOntologyContext,
    predecessor: PipelinePart,
    config: RerankerFactoryConfig<PropertyRerankersIds>,
  ): PipelinePart {
    if (config.id === 'cross_encoder') {
      return new CrossEncoderReranker(
        query,
        ontologyContext,
        predecessor,
        crossEncoderClient,
        true,
      );
    } else if (config.id === 'feature_usage_mappings') {
      if (
        config.queryWeight == null ||
        config.featureWeights == null ||
        config.featureWeights.length !== 1
      ) {
        throw new Error('Invalid parameters of property reranker.');
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
