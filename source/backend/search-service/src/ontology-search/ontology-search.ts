import { WdOntologyContext } from './ontology-context/ontology-context.js';

export class WdOntologySearch {
  ontologyContext: WdOntologyContext;

  private constructor(ontologyContext: WdOntologyContext) {
    this.ontologyContext = ontologyContext;
  }

  static async create(
    classesJsonFilePath: string,
    propertiesJsonFilePath: string,
  ): Promise<WdOntologySearch> {
    const ontologyContext = await WdOntologyContext.create(
      classesJsonFilePath,
      propertiesJsonFilePath,
    );
    return new WdOntologySearch(ontologyContext);
  }
}
