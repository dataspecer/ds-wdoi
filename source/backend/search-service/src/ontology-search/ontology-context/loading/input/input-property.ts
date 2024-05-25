import type { EntityIdsList, NumberFeature } from '../../entities/common.js';
import type { InputEntity } from './input-entity.js';

export interface InputProperty extends InputEntity {
  classesDefiningUsage: EntityIdsList;
  usageCount: NumberFeature;
  equivalentPropertyCount: NumberFeature;
}
