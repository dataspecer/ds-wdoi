import type { EntityId, EntityIdString } from '../../../../../ontology-context/entities/common.js';
import type { WdOntologyContext } from '../../../../../ontology-context/ontology-context.js';
import type { ClassQuery } from '../../../query.js';
import { QueryCreator } from './query-creator.js';

export class ClassQueryCreator extends QueryCreator {
  protected readonly classQuery: ClassQuery;

  constructor(ontologyContext: WdOntologyContext, classQuery: ClassQuery) {
    super(ontologyContext);
    this.classQuery = classQuery;
  }

  // Used for filter creation.
  // If the property is from root entity, it is disregarded since every class can have this property.
  protected computeUsageClassesForProperties(
    asStrings: boolean,
  ): EntityId[][] | EntityIdString[][] {
    const usageClasseForProperties: any[][] = [];
    for (const wdPropertyId of this.classQuery.properties) {
      if (!this.ontologyContext.rootClassProperties.has(wdPropertyId)) {
        const wdProperty = this.ontologyContext.properties.get(wdPropertyId);
        if (wdProperty !== undefined) {
          usageClasseForProperties.push(
            asStrings ? wdProperty.classesDefiningUsageAsString : wdProperty.classesDefiningUsage,
          );
        }
      }
    }
    return usageClasseForProperties;
  }
}
