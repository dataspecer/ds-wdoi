import type { WdOntologyContext } from '../../../../../ontology-context/ontology-context.js';

export class QueryCreator {
  protected readonly ontologyContext: WdOntologyContext;

  constructor(ontologyContext: WdOntologyContext) {
    this.ontologyContext = ontologyContext;
  }
}
