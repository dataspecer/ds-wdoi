import type { WdOntologyContext } from '../../../../../ontology-context/ontology-context.js';
import type { PropertyQuery } from '../../../query.js';
import { QueryCreator } from './query-creator.js';

export class PropertyQueryCreator extends QueryCreator {
  propertyQuery: PropertyQuery;

  constructor(ontologyContext: WdOntologyContext, propertyQuery: PropertyQuery) {
    super(ontologyContext);
    this.propertyQuery = propertyQuery;
  }
}
