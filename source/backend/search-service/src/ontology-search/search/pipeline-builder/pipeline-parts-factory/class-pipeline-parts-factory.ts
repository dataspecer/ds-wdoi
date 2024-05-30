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
import { TupleFusion } from '../../pipeline/pipeline-parts/fusion/tuple-fusion.js';
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

export type ClassFusionCandidateSelectorsIds =
  | 'qdrant_sparse_dense'
  | 'elastic_bm25_qdrant_dense'
  | 'elastic_bm25_fielded_qdrant_dense';

export type ClassRerankersIds = 'cross_encoder' | 'feature_instance_mappings';

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
  ): PipelinePart {
    const isBM25 = config.id === 'elastic_bm25';
    const isBM25Fielded = config.id === 'elastic_bm25_fielded';
    const isDense = config.id === 'qdrant_sparse';
    const isSparse = config.id === 'qdrant_dense';

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

  protected checkFusionConfig(
    config: FusionCandidateSelectorFactoryConfig<
      ClassFusionCandidateSelectorsIds,
      ClassCandidateSelectorsIds
    >,
  ): void | never {
    if (
      config.candidateSelectors == null ||
      config.fusionWeights == null ||
      config.candidateSelectors.length !== 2 ||
      config.fusionWeights.length !== 1 ||
      config.candidateSelectors[0].id !== 'qdrant_dense' ||
      (config.candidateSelectors[1].id !== 'elastic_bm25' &&
        config.candidateSelectors[1].id !== 'elastic_bm25_fielded' &&
        config.candidateSelectors[1].id !== 'qdrant_sparse')
    ) {
      throw new Error('Invalid arguments to classes fusion.');
    }
  }

  createFusionCandidateSelector(
    query: ClassQuery,
    ontologyContext: WdOntologyContext,
    config: FusionCandidateSelectorFactoryConfig<
      ClassFusionCandidateSelectorsIds,
      ClassCandidateSelectorsIds
    >,
  ): PipelinePart {
    if (
      config.id === 'qdrant_sparse_dense' ||
      config.id === 'elastic_bm25_qdrant_dense' ||
      config.id === 'elastic_bm25_fielded_qdrant_dense'
    ) {
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
      throw new Error(`Missing constructor for in classes fusion factory.`);
    }
  }

  createReranker(
    query: ClassQuery,
    ontologyContext: WdOntologyContext,
    predecessor: PipelinePart,
    config: RerankerFactoryConfig<ClassRerankersIds>,
  ): PipelinePart {
    if (config.id === 'cross_encoder') {
      return new CrossEncoderReranker(
        query,
        ontologyContext,
        predecessor,
        crossEncoderClient,
        false,
      );
    } else if (config.id === 'feature_instance_mappings') {
      if (
        config.queryWeight == null ||
        config.featureWeights == null ||
        config.featureWeights.length !== 1
      ) {
        throw new Error('Invalid parameters of class reranker.');
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
