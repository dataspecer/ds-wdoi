import { logError } from '../logging/log.js';
import type { EntityIdsList } from './ontology-context/entities/common.js';
import { WdOntologyContext } from './ontology-context/ontology-context.js';
import {
  type PipelineConfig,
  PipelineBuilder,
} from './search/pipeline-builder/pipeline-builder.js';
import {
  type ClassCandidateSelectorsIds,
  type ClassFusionCandidateSelectorsIds,
  type ClassRerankersIds,
} from './search/pipeline-builder/pipeline-parts-factory/class-pipeline-parts-factory.js';
import type {
  PropertyCandidateSelectorsIds,
  PropertyFusionCandidateSelectorsIds,
  PropertyRerankersIds,
} from './search/pipeline-builder/pipeline-parts-factory/property-pipeline-parts-factory.js';
import type { ClassQuery, PropertyQuery } from './search/pipeline/query.js';

export class WdOntologySearch {
  ontologyContext: WdOntologyContext;
  pipelineBuilder: PipelineBuilder;

  private constructor(ontologyContext: WdOntologyContext) {
    this.ontologyContext = ontologyContext;
    this.pipelineBuilder = new PipelineBuilder(this.ontologyContext);
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

  async searchClasses(
    query: ClassQuery,
    config: PipelineConfig<
      ClassCandidateSelectorsIds,
      ClassFusionCandidateSelectorsIds,
      ClassRerankersIds
    >,
  ): Promise<EntityIdsList | undefined> {
    try {
      const pipeline = this.pipelineBuilder.createClassSearchPipeline(query, config);
      if (pipeline !== undefined) {
        const results = await pipeline.execute();
        return results.map((v) => v.id);
      }
    } catch (e) {
      logError(e);
    }
    return undefined;
  }

  async searchProperties(
    query: PropertyQuery,
    config: PipelineConfig<
      PropertyCandidateSelectorsIds,
      PropertyFusionCandidateSelectorsIds,
      PropertyRerankersIds
    >,
  ): Promise<EntityIdsList | undefined> {
    try {
      const pipeline = this.pipelineBuilder.createPropertySearchPipeline(query, config);
      if (pipeline !== undefined) {
        const results = await pipeline.execute();
        return results.map((v) => v.id);
      }
    } catch (e) {
      logError(e);
    }
    return undefined;
  }
}
