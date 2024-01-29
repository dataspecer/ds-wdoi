import { type EntityId } from '../entities/common';
import { type WdClass } from '../entities/wd-class';
import { type WdProperty } from '../entities/wd-property';

export class SurroundingsExpander {
  protected readonly classes: ReadonlyMap<EntityId, WdClass>;
  protected readonly properties: ReadonlyMap<EntityId, WdProperty>;

  constructor(classes: ReadonlyMap<EntityId, WdClass>, properties: ReadonlyMap<EntityId, WdProperty>) {
    this.classes = classes;
    this.properties = properties;
  }
}

export class ClassSurroundingsExpander extends SurroundingsExpander {
  protected readonly startClass: WdClass;

  constructor(startClass: WdClass, classes: ReadonlyMap<EntityId, WdClass>, properties: ReadonlyMap<EntityId, WdProperty>) {
    super(classes, properties);
    this.startClass = startClass;
  }
}

export class PropertySurroundingsExpander extends SurroundingsExpander {
  protected readonly startProperty: WdProperty;

  constructor(startProperty: WdProperty, classes: ReadonlyMap<EntityId, WdClass>, properties: ReadonlyMap<EntityId, WdProperty>) {
    super(classes, properties);
    this.startProperty = startProperty;
  }
}
