import { type QueryDslBoolQuery } from '@elastic/elasticsearch/lib/api/types.js';
import { type WdOntologyContext } from '../../../../../ontology-context/ontology-context.js';
import { type ElasticClientWrapper } from '../../../../service-clients/clients/elastic-client.js';
import { type PipelinePart, type PipelinePartResults } from '../../../pipeline-part.js';
import { type ClassQuery } from '../../../query.js';
import { ClassPipelinePart } from '../class-pipeline-part.js';
import {
  convertElasticSearchResultsToPipelineResults,
  createTermsFieldFilter,
} from '../../../../utils/elastic.js';
import { logError } from '../../../../../../logging/log.js';
import { type EntityIdString } from '../../../../../ontology-context/entities/common.js';

export class ClassBM25Selector extends ClassPipelinePart {
  protected readonly elasticClient: ElasticClientWrapper;

  constructor(
    classQuery: ClassQuery,
    ontologyContext: WdOntologyContext,
    maxResults: number,
    predecessor: PipelinePart | undefined,
    elasticClient: ElasticClientWrapper,
  ) {
    super(classQuery, ontologyContext, maxResults, predecessor);
    this.elasticClient = elasticClient;
  }

  protected async executeInternal(
    predecessorResults: PipelinePartResults | undefined,
  ): Promise<PipelinePartResults> {
    const asStrings = true;
    const usageClasses = this.computeUsageClassesForProperties(asStrings);
    const usageFilter = createTermsFieldFilter(
      'ancestorsDefiningProperties',
      usageClasses as EntityIdString[][],
    );

    try {
      const boolQuery: QueryDslBoolQuery = {
        should: [
          {
            match: {
              labels_en: {
                query: this.classQuery.query,
                fuzziness: 'AUTO',
                boost: 8,
              },
            },
          },
          {
            term: {
              'labels_en.keyword': {
                value: this.classQuery.query,
                boost: 12,
              },
            },
          },
          {
            match: {
              aliases_en: {
                query: this.classQuery.query,
                fuzziness: 'AUTO',
                boost: 6,
              },
            },
          },
          {
            term: {
              'aliases_en.keyword': {
                value: this.classQuery.query,
                boost: 9,
              },
            },
          },
          {
            match: {
              subclassOf_en: {
                query: this.classQuery.query,
                fuzziness: 'AUTO',
                boost: 4,
              },
            },
          },
          {
            term: {
              'subclassOf_en.keyword': {
                value: this.classQuery.query,
                boost: 6,
              },
            },
          },
          {
            match: {
              additionalDescriptions_en: {
                query: this.classQuery.query,
                fuzziness: 'AUTO',
                boost: 2,
              },
            },
          },
          {
            match: {
              descriptions_en: {
                query: this.classQuery.query,
                fuzziness: 'AUTO',
              },
            },
          },
        ],
      };
      if (usageFilter.length !== 0) boolQuery.filter = usageFilter;

      const searchResults = await this.elasticClient.es.search({
        index: this.elasticClient.propertiesIndex,
        from: 0,
        size: this.maxResults,
        _source: false,
        query: {
          bool: boolQuery,
        },
      });
      return convertElasticSearchResultsToPipelineResults(searchResults);
    } catch (e) {
      logError(e);
    }
    return [];
  }
}
