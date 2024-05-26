import { type EntityIdsList } from '../../../../ontology-context/entities/common.js';
import { type WdOntologyContext } from '../../../../ontology-context/ontology-context.js';
import { type ClassQuery } from '../../query.js';
import { type PipelinePart, PipelinePartSingle } from '../../pipeline-part.js';

export abstract class ClassPipelinePart extends PipelinePartSingle {
  protected readonly classQuery: ClassQuery;

  constructor(
    classQuery: ClassQuery,
    ontologyContext: WdOntologyContext,
    maxResults: number,
    predecessor: PipelinePart | undefined,
  ) {
    super(classQuery, ontologyContext, maxResults, predecessor);
    this.classQuery = classQuery;
  }

  // Used for filter creation.
  // If the property is from root entity, it is disregarded since every class can have this property.
  protected computeUsageClassesForProperties(): EntityIdsList[] {
    const usageClasseForProperties: EntityIdsList[] = [];
    for (const wdPropertyId of this.classQuery.properties) {
      if (!this.ontologyContext.rootClassProperties.has(wdPropertyId)) {
        const wdProperty = this.ontologyContext.properties.get(wdPropertyId);
        if (wdProperty !== undefined) {
          usageClasseForProperties.push(wdProperty.classesDefiningUsage);
        }
      }
    }
    return usageClasseForProperties;
  }
}
