import { type EntityId } from '../../../../../ontology-context/entities/common.js';
import { TupleFeatureReranker } from './tuple-feature-reranker.js';

export abstract class ClassInstancesAndMappingsReranker extends TupleFeatureReranker {
  protected getFirstFeature(entityId: EntityId): number {
    return this.ontologyContext.classes.get(entityId)?.instanceCount ?? 0;
  }

  protected getSecondFeature(entityId: EntityId): number {
    return this.ontologyContext.classes.get(entityId)?.equivalentClassCount ?? 0;
  }
}
