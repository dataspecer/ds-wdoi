import { type EntityId } from '../../entities/common.js';
import { type WdClass } from '../../entities/wd-class.js';
import { type WdProperty } from '../../entities/wd-property.js';

export class OneDistanceDescExpander {
  protected readonly contextClasses: ReadonlyMap<EntityId, WdClass>;
  protected readonly contextProperties: ReadonlyMap<EntityId, WdProperty>;

  constructor(
    contextClasses: ReadonlyMap<EntityId, WdClass>,
    contextProperties: ReadonlyMap<EntityId, WdProperty>,
  ) {
    this.contextClasses = contextClasses;
    this.contextProperties = contextProperties;
  }
}
