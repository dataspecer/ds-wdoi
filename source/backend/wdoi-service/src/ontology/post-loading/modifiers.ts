import type { EntityId, EntityIdsList } from '../entities/common';
import type { StatementAllowanceMap } from '../entities/constraint';
import type { WdClass } from '../entities/wd-class';
import type { WdEntity } from '../entities/wd-entity';
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

  filterOutNonExisting(idsList: EntityIdsList, classesFlag: boolean): EntityIdsList {
    const entityMap: Map<EntityId, WdEntity> = classesFlag ? this.classes : this.properties;
    return idsList.filter((id) => {
      return id in entityMap;
    });
  }

  filterOutNonExistingAllowanceMap(allowanceMap: StatementAllowanceMap, classesFlag: boolean): StatementAllowanceMap {
    const entityMap: Map<EntityId, WdEntity> = classesFlag ? this.classes : this.properties;
    const filteredAllowanceMap: StatementAllowanceMap = {};
    for (const key in allowanceMap) {
      const numId = Number(key);
      if (numId in entityMap) {
        filteredAllowanceMap[key] = allowanceMap[key];
      }
    }
    return filteredAllowanceMap;
  }
}

export abstract class ModifierVisitor {
  context: ModifierContext;

  constructor(context: ModifierContext) {
    this.context = context;
  }
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
