import type { EntityId } from '../entities/common';
import type { WdClass } from '../entities/wd-class';
import type { CoordinatesProperty, ItemProperty, QuantityProperty, StringProperty, TimeProperty, WdProperty } from '../entities/wd-property';

export interface ModifierVisitableClass {
  accept: (visitor: ModifierClassVisitor) => void;
}

export interface ModifierVisitableProperty {
  accept: (visitor: ModifierPropertyVisitor) => void;
}

export class ModifierContext {
  rootClass: WdClass;
  classes: Map<EntityId, WdClass>;
  properties: Map<EntityId, WdProperty>;

  constructor(rootClass: WdClass, classes: Map<EntityId, WdClass>, properties: Map<EntityId, WdProperty>) {
    this.rootClass = rootClass;
    this.classes = classes;
    this.properties = properties;
  }

  getClass(entityId: EntityId): WdClass | undefined {
    return this.classes.get(entityId);
  }

  getProperty(entityId: EntityId): WdProperty | undefined {
    return this.properties.get(entityId);
  }
}

export abstract class ModifierVisitor {
  context: ModifierContext;

  constructor(context: ModifierContext) {
    this.context = context;
  }

  abstract printReport(): void;
}

export abstract class ModifierClassVisitor extends ModifierVisitor {
  abstract visitWdClass(cls: WdClass): void;
}

export abstract class ModifierPropertyVisitor extends ModifierVisitor {
  abstract visitItemProperty(prop: ItemProperty): void;
  abstract visitStringProperty(prop: StringProperty): void;
  abstract visitQuantityProperty(prop: QuantityProperty): void;
  abstract visitCoordinateProperty(prop: CoordinatesProperty): void;
  abstract visitTimeProperty(prop: TimeProperty): void;
}
