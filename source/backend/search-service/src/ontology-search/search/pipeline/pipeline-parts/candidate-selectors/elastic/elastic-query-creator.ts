import type {
  QueryDslBoolQuery,
  QueryDslQueryContainer,
} from '@elastic/elasticsearch/lib/api/types.js';
import { ClassQueryCreator } from '../base-query-creators/class-query-creator.js';
import type { WdOntologyContext } from '../../../../../ontology-context/ontology-context.js';
import type { ClassQuery, PropertyQuery } from '../../../query.js';
import type { EntityIdString } from '../../../../../ontology-context/entities/common.js';
import { PropertyQueryCreator } from '../base-query-creators/property-query-creator.js';

export interface ElasticQueryCreator {
  readonly indexName: string;
  createQuery: () => QueryDslBoolQuery;
}

export abstract class ElasticClassQueryCreator
  extends ClassQueryCreator
  implements ElasticQueryCreator
{
  readonly indexName: string;

  constructor(ontologyContext: WdOntologyContext, classQuery: ClassQuery, indexName: string) {
    super(ontologyContext, classQuery);
    this.indexName = indexName;
  }

  protected createClassTermsFieldFilter(
    field: string,
    terms: EntityIdString[][],
  ): QueryDslQueryContainer[] {
    return terms.map((v) => {
      return {
        terms: {
          [field]: v,
        },
      };
    });
  }

  protected createFilter(): QueryDslQueryContainer[] {
    const asStrings = true;
    const usageClasses = this.computeUsageClassesForProperties(asStrings);
    const usageFilter = this.createClassTermsFieldFilter(
      'ancestorsDefiningProperties',
      usageClasses as EntityIdString[][],
    );

    return usageFilter;
  }

  createQuery(): QueryDslBoolQuery {
    const boolQuery: QueryDslBoolQuery = this.createQueryInternal();
    const filter = this.createFilter();
    if (filter !== undefined && filter.length !== 0) {
      boolQuery.filter = filter;
    }
    return boolQuery;
  }

  abstract createQueryInternal(): QueryDslBoolQuery;
}

export class ElasticClassBM25QueryCreator extends ElasticClassQueryCreator {
  createQueryInternal(): QueryDslBoolQuery {
    return {
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
  }
}

export class ElasticClassBM25FieldedQueryCreator extends ElasticClassQueryCreator {
  createQueryInternal(): QueryDslBoolQuery {
    return {
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
  }
}

export class ElasticPropertyBM25QueryCreator
  extends PropertyQueryCreator
  implements ElasticQueryCreator
{
  readonly indexName: string;

  constructor(ontologyContext: WdOntologyContext, propertyQuery: PropertyQuery, indexName: string) {
    super(ontologyContext, propertyQuery);
    this.indexName = indexName;
  }

  createQuery(): QueryDslBoolQuery {
    return {
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
    };
  }
}
