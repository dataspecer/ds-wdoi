import type { EntityIdsList, NumberFeature } from '../../entities/common.js';
import type { InputEntity } from './input-entity.js';

export interface InputClass extends InputEntity {
  ownProperties: EntityIdsList;
  ancestorsDefiningProperties: EntityIdsList;
  subclassOf: EntityIdsList;
  instanceCount: NumberFeature;
  sitelinksCount: NumberFeature;
  inlinksCount: NumberFeature;
  equivalentClassCount: NumberFeature;

  hasEffect: EntityIdsList;
  hasCause: EntityIdsList;
  hasCharacteristics: EntityIdsList;
  hasParts: EntityIdsList;
  partOf: EntityIdsList;
  hasUse: EntityIdsList;
}
