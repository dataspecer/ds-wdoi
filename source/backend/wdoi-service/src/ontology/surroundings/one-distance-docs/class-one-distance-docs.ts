import { type EntityId } from '../../entities/common';
import { type WdClass } from '../../entities/wd-class';
import { type WdProperty } from '../../entities/wd-property';
import { materializeEntitiesWithContext } from '../../utils/materialize-entities';
import { ClassSurroundingsExpander } from '../surroundings-expander';

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

export class ClassOneDistanceDocsExpander extends ClassSurroundingsExpander {
  private getOneDistanceDocsSurroundings(): [WdClass[], WdProperty[]] {
    const surroundingClasses: WdClass[] = [];
    const surroundingProperties: WdProperty[] = [];
    const classesPresent = new Set<EntityId>();
    const propertiesPresent = new Set<EntityId>();

    // Classes
    materializeEntitiesWithContext(this.startClass.instanceOf, this.classes, classesPresent, surroundingClasses);
    materializeEntitiesWithContext(this.startClass.subclassOf, this.classes, classesPresent, surroundingClasses);
    materializeEntitiesWithContext(this.startClass.instances, this.classes, classesPresent, surroundingClasses);

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
