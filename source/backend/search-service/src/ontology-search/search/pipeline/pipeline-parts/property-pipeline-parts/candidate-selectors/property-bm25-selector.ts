import { type WdOntologyContext } from '../../../../../ontology-context/ontology-context.js';
import { type ElasticClientWrapper } from '../../../../service-clients/clients/elastic-client.js';
import { convertElasticSearchResultsToPipelineResults } from '../../../../utils/elastic.js';
import { type PipelinePart, type PipelinePartResults } from '../../../pipeline-part.js';
import { type ClassQuery } from '../../../query.js';
import { PropertyPipelinePart } from '../property-pipeline-part.js';
import { logError } from '../../../../../../logging/log.js';

export class PropertyBM25Selector extends PropertyPipelinePart {
  protected readonly elasticClient: ElasticClientWrapper;

  constructor(
    propertyQuery: ClassQuery,
    ontologyContext: WdOntologyContext,
    maxResults: number,
    predecessor: PipelinePart | undefined,
    elasticClient: ElasticClientWrapper,
  ) {
    super(propertyQuery, ontologyContext, maxResults, predecessor);
    this.elasticClient = elasticClient;
  }

  protected async executeInternal(
    predecessorResults: PipelinePartResults | undefined,
  ): Promise<PipelinePartResults> {
    try {
      const searchResults = await this.elasticClient.es.search({
        index: this.elasticClient.propertiesIndex,
        from: 0,
        size: this.maxResults,
        _source: false,
        query: {
          bool: {
            should: [
              {
                match: {
                  labels_en: {
                    query: this.propertyQuery.query,
                    fuzziness: 'AUTO',
                    boost: 4.0,
                  },
                },
              },
              {
                term: {
                  'labels_en.keyword': {
                    value: this.propertyQuery.query,
                    boost: 8.0,
                  },
                },
              },
              {
                match: {
                  aliases_en: {
                    query: this.propertyQuery.query,
                    fuzziness: 'AUTO',
                    boost: 4.0,
                  },
                },
              },
              {
                term: {
                  'aliases_en.keyword': {
                    value: this.propertyQuery.query,
                    boost: 8.0,
                  },
                },
              },
              {
                match: {
                  descriptions_en: {
                    query: this.propertyQuery.query,
                    fuzziness: 'AUTO',
                  },
                },
              },
            ],
          },
        },
      });
      return convertElasticSearchResultsToPipelineResults(searchResults);
    } catch (e) {
      logError(e);
    }
    return [];
  }
}
