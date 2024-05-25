import type { InputProperty } from '../loading/input/input-property.js';
import type { EntityIdsList, NumberFeature } from './common.js';
import { WdEntity } from './wd-entity.js';

export class WdProperty extends WdEntity {
  readonly classesDefiningUsage: EntityIdsList;
  usageCount: NumberFeature;
  equivalentPropertyCount: NumberFeature;

  constructor(inputProperty: InputProperty) {
    super(inputProperty);
    this.classesDefiningUsage = inputProperty.classesDefiningUsage;
    this.usageCount = inputProperty.usageCount;
    this.equivalentPropertyCount = inputProperty.equivalentPropertyCount;
  }
}
