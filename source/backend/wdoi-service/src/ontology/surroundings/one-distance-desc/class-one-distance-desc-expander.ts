import { type EntityId } from '../../entities/common.js';
import { type WdClass } from '../../entities/wd-class.js';
import { type WdProperty } from '../../entities/wd-property.js';
import { materializeEntitiesWithContext } from '../../utils/materialize-entities.js';
import { OneDistanceDescExpander } from './one-distance-desc-expander.js';

export class ClassOneDistanceDescReturnWrapper {
  startClass: WdClass;
  surroundingClassesDesc: WdClass[];
  surroundingPropertiesDesc: WdProperty[];

  constructor(startClass: WdClass, surroundingClassesDesc: WdClass[], surroundingPropertiesDesc: WdProperty[]) {
    this.startClass = startClass;
    this.surroundingClassesDesc = surroundingClassesDesc;
    this.surroundingPropertiesDesc = surroundingPropertiesDesc;
  }
}

export class ClassOneDistanceDescExpander extends OneDistanceDescExpander {
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
    materializeEntitiesWithContext(this.startClass.subclassOf, this.classes, classesPresent, surroundingClasses);

    // Properties
    materializeEntitiesWithContext(this.startClass.subjectOfProperty, this.properties, propertiesPresent, surroundingProperties);
    materializeEntitiesWithContext(this.startClass.valueOfProperty, this.properties, propertiesPresent, surroundingProperties);

    return [surroundingClasses, surroundingProperties];
  }

  public getSurroundings(): ClassOneDistanceDescReturnWrapper {
    const [surroundingClassNames, surroundingPropertyNames] = this.getOneDistanceDocsSurroundings();
    return new ClassOneDistanceDescReturnWrapper(this.startClass, surroundingClassNames, surroundingPropertyNames);
  }
}
