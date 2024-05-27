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
import { type QueryDslBoolQuery } from '@elastic/elasticsearch/lib/api/types.js';
import type { EntityIdString } from '../../../../../ontology-context/entities/common.js';

export class ClassBM25FSelector extends ClassPipelinePart {
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
            combined_fields: {
              query: this.classQuery.query,
              fields: [
                'labels_en^8',
                'aliases_en^6',
                'subclassOf_en^4',
                'additionalDescriptions_en^2',
                'descriptions_en',
              ],
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
