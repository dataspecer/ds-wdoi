import type { EntityId } from '../../../../../ontology-context/entities/common.js';
import type { WdOntologyContext } from '../../../../../ontology-context/ontology-context.js';
import type { ClassQuery, PropertyQuery } from '../../../query.js';
import { ClassQueryCreator } from '../base-query-creators/class-query-creator.js';
import { PropertyQueryCreator } from '../base-query-creators/property-query-creator.js';

export interface QdrantQueryCreator {
  readonly collectionName: string;
  readonly vectorName: string;
  createFilter: () => QdrantClassUsageFilter | undefined;
}

export interface QdrantClassUsageFilter {
  must: Array<{ key: string; match: { any: EntityId[] } }>;
}

export class QdrantClassQueryCreator extends ClassQueryCreator implements QdrantQueryCreator {
  readonly collectionName: string;
  readonly vectorName: string;

  constructor(
    ontologyContext: WdOntologyContext,
    classQuery: ClassQuery,
    collectionName: string,
    vectorName: string,
  ) {
    super(ontologyContext, classQuery);
    this.collectionName = collectionName;
    this.vectorName = vectorName;
  }

  createQdrantClassTermsFilter(field: string, terms: EntityId[][]): QdrantClassUsageFilter {
    const filter: QdrantClassUsageFilter = { must: [] };
    filter.must = terms.map((v) => {
      return {
        key: field,
        match: {
          any: v,
        },
      };
    });

    return filter;
  }

  createFilter(): QdrantClassUsageFilter | undefined {
    const notAsStrings = false;
    const usageClasses = this.computeUsageClassesForProperties(notAsStrings);
    const usageFilter = this.createQdrantClassTermsFilter(
      'ancestorsDefiningProperties',
      usageClasses as EntityId[][],
    );

    return usageFilter.must.length !== 0 ? usageFilter : undefined;
  }
}

export class QdrantPropertyQueryCreator extends PropertyQueryCreator implements QdrantQueryCreator {
  readonly collectionName: string;
  readonly vectorName: string;

  constructor(
    ontologyContext: WdOntologyContext,
    propertyQuery: PropertyQuery,
    collectionName: string,
    vectorName: string,
  ) {
    super(ontologyContext, propertyQuery);
    this.collectionName = collectionName;
    this.vectorName = vectorName;
  }

  createFilter(): QdrantClassUsageFilter | undefined {
    return undefined;
  }
}
