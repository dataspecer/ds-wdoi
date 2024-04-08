import { type EntityId } from '../../entities/common.js';
import { type WdClass } from '../../entities/wd-class.js';
import { type WdProperty } from '../../entities/wd-property.js';
import { materializeEntitiesWithContext } from '../../utils/materialize-entities.js';
import { OneDistanceDocsExpander } from './one-distance-docs-expander.js';

export class ClassOneDistanceDocsReturnWrapper {
  startClass: WdClass;
  surroundingClassNames: WdClass[];
  surroundingPropertyNames: WdProperty[];

  constructor(startClass: WdClass, surroundingClassNames: WdClass[], surroundingPropertyNames: WdProperty[]) {
    this.startClass = startClass;
    this.surroundingClassNames = surroundingClassNames;
    this.surroundingPropertyNames = surroundingPropertyNames;
  }
}

export class ClassOneDistanceDocsExpander extends OneDistanceDocsExpander {
  protected readonly startClass: WdClass;

  constructor(startClass: WdClass, classes: ReadonlyMap<EntityId, WdClass>, properties: ReadonlyMap<EntityId, WdProperty>) {
    super(classes, properties);
    this.startClass = startClass;
  }

  private getOneDistanceDocsSurroundings(): [WdClass[], WdProperty[]] {
    const surroundingClasses: WdClass[] = [];
    const surroundingProperties: WdProperty[] = [];
    const classesPresent = new Set<EntityId>();
    const propertiesPresent = new Set<EntityId>();

    // Classes
    materializeEntitiesWithContext(this.startClass.instanceOf, this.classes, classesPresent, surroundingClasses);
    materializeEntitiesWithContext(this.startClass.subclassOf, this.classes, classesPresent, surroundingClasses);

    // Properties
    materializeEntitiesWithContext(this.startClass.subjectOfProperty, this.properties, propertiesPresent, surroundingProperties);
    materializeEntitiesWithContext(this.startClass.valueOfProperty, this.properties, propertiesPresent, surroundingProperties);

    return [surroundingClasses, surroundingProperties];
  }

  public getSurroundings(): ClassOneDistanceDocsReturnWrapper {
    const [surroundingClassNames, surroundingPropertyNames] = this.getOneDistanceDocsSurroundings();
    return new ClassOneDistanceDocsReturnWrapper(this.startClass, surroundingClassNames, surroundingPropertyNames);
  }
}
