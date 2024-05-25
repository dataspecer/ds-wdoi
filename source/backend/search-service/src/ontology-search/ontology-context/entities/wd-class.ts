import type { InputClass } from '../loading/input/input-class.js';
import type { Lexicalization, NumberFeature } from './common.js';
import { WdEntity } from './wd-entity.js';

export const ROOT_CLASS_ID = 35120;

export class WdClass extends WdEntity {
  readonly lexicalization: Lexicalization;
  instanceCount: NumberFeature;
  inlinksCount: NumberFeature;
  equivalentClassCount: NumberFeature;

  constructor(inputClass: InputClass) {
    super(inputClass);
    this.lexicalization = inputClass.lexicalization;
    this.instanceCount = inputClass.instanceCount;
    this.inlinksCount = inputClass.inlinksCount;
    this.equivalentClassCount = inputClass.equivalentClassCount;
  }
}
