import { type EntityId } from '../../entities/common';
import { type WdClass } from '../../entities/wd-class';
import { type WdProperty } from '../../entities/wd-property';

export class OneDistanceDocsExpander {
  protected readonly classes: ReadonlyMap<EntityId, WdClass>;
  protected readonly properties: ReadonlyMap<EntityId, WdProperty>;

  constructor(classes: ReadonlyMap<EntityId, WdClass>, properties: ReadonlyMap<EntityId, WdProperty>) {
    this.classes = classes;
    this.properties = properties;
  }
}
