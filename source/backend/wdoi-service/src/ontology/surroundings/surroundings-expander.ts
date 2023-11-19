import { type EntityId } from '../entities/common';
import { type WdClass } from '../entities/wd-class';
import { type WdProperty } from '../entities/wd-property';
import { materializeEntities } from '../utils/materialize-entities';

export class SurroundingsExpander {
  protected readonly rootClass: WdClass;
  protected readonly classes: ReadonlyMap<EntityId, WdClass>;
  protected readonly properties: ReadonlyMap<EntityId, WdProperty>;

  protected getParents(cls: WdClass): WdClass[] {
    return materializeEntities(cls.subclassOf, this.classes);
  }

  protected getChildren(cls: WdClass): WdClass[] {
    return materializeEntities(cls.children, this.classes);
  }

  constructor(rootClass: WdClass, classes: ReadonlyMap<EntityId, WdClass>, properties: ReadonlyMap<EntityId, WdProperty>) {
    this.rootClass = rootClass;
    this.classes = classes;
    this.properties = properties;
  }
}
