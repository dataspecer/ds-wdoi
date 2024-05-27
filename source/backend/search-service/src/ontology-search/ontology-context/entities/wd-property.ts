import type { InputProperty } from '../loading/input/input-property.js';
import type { EntityId, EntityIdString, NumberFeature } from './common.js';
import { WdEntity } from './wd-entity.js';

export class WdProperty extends WdEntity {
  readonly classesDefiningUsage: EntityId[];
  // Needed for elastic.
  readonly classesDefiningUsageAsString: EntityIdString[];
  usageCount: NumberFeature;
  equivalentPropertyCount: NumberFeature;

  constructor(inputProperty: InputProperty) {
    super(inputProperty);
    this.classesDefiningUsage = inputProperty.classesDefiningUsage.slice();
    this.classesDefiningUsageAsString = inputProperty.classesDefiningUsage.map((v) => v.toString());
    this.usageCount = inputProperty.usageCount;
    this.equivalentPropertyCount = inputProperty.equivalentPropertyCount;
  }
}
