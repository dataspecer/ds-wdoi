import { type EntityId } from '../../entities/common.js';
import { type WdClass } from '../../entities/wd-class.js';
import { type WdProperty } from '../../entities/wd-property.js';

export class OneDistanceDescExpander {
  protected readonly classes: ReadonlyMap<EntityId, WdClass>;
  protected readonly properties: ReadonlyMap<EntityId, WdProperty>;

  constructor(classes: ReadonlyMap<EntityId, WdClass>, properties: ReadonlyMap<EntityId, WdProperty>) {
    this.classes = classes;
    this.properties = properties;
  }
}
