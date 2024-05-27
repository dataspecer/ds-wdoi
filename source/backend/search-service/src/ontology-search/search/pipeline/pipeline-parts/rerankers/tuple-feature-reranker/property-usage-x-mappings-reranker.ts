import { type EntityId } from '../../../../../ontology-context/entities/common.js';
import { TupleFeatureReranker } from './tuple-feature-reranker.js';

export abstract class PropertyUsageAndMappingsReranker extends TupleFeatureReranker {
  protected getFirstFeature(entityId: EntityId): number {
    return this.ontologyContext.properties.get(entityId)?.usageCount ?? 0;
  }

  protected getSecondFeature(entityId: EntityId): number {
    return this.ontologyContext.properties.get(entityId)?.equivalentPropertyCount ?? 0;
  }
}
