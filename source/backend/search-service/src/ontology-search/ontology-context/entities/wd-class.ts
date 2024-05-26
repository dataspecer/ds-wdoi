import type { InputClass } from '../loading/input/input-class.js';
import type { EntityIdsList, NumberFeature } from './common.js';
import { WdEntity } from './wd-entity.js';

export const ROOT_CLASS_ID = 35120;

export class WdClass extends WdEntity {
  instanceCount: NumberFeature;
  equivalentClassCount: NumberFeature;
  ownProperties: EntityIdsList | undefined = undefined;

  constructor(inputClass: InputClass) {
    super(inputClass);
    this.instanceCount = inputClass.instanceCount;
    this.equivalentClassCount = inputClass.equivalentClassCount;

    if (inputClass.id === ROOT_CLASS_ID) {
      this.ownProperties = inputClass.ownProperties;
    }
  }
}
