import { type WdOntologyContext } from '../../../../ontology-context/ontology-context.js';
import { type PropertyQuery } from '../../query.js';
import { type PipelinePart, PipelinePartSingle } from '../../pipeline-part.js';

export abstract class PropertyPipelinePart extends PipelinePartSingle {
  protected readonly propertyQuery: PropertyQuery;

  constructor(
    propertyQuery: PropertyQuery,
    ontologyContext: WdOntologyContext,
    maxResults: number,
    predecessor: PipelinePart | undefined,
  ) {
    super(propertyQuery, ontologyContext, maxResults, predecessor);
    this.propertyQuery = propertyQuery;
  }
}
