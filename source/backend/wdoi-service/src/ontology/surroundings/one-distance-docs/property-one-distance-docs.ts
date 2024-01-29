import { type EntityId } from '../../entities/common';
import { type WdClass } from '../../entities/wd-class';
import { WdProperty } from '../../entities/wd-property';
import { materializeEntitiesWithContext } from '../../utils/materialize-entities';
import { PropertySurroundingsExpander } from '../surroundings-expander';

export class PropertyOneDistanceDocsReturnWrapper {
  startProperty: WdProperty;
  surroundingClassNames: WdClass[];
  surroundingPropertyNames: WdProperty[];

  constructor(startProperty: WdProperty, surroundingClassNames: WdClass[], surroundingPropertyNames: WdProperty[]) {
    this.startProperty = startProperty;
    this.surroundingClassNames = surroundingClassNames;
    this.surroundingPropertyNames = surroundingPropertyNames;
  }
}

export class PropertyOneDistanceDocsExpander extends PropertySurroundingsExpander {
  private getOneDistanceDocsSurroundings(): [WdClass[], WdProperty[]] {
    const surroundingClasses: WdClass[] = [];
    const surroundingProperties: WdProperty[] = [];
    const classesPresent = new Set<EntityId>();
    const propertiesPresent = new Set<EntityId>();

    // Classes
    materializeEntitiesWithContext(this.startProperty.instanceOf, this.classes, classesPresent, surroundingClasses);

    // Subject constraints
    const subjectTypeConstraints = this.startProperty.generalConstraints.subjectType;
    materializeEntitiesWithContext(subjectTypeConstraints.instanceOf, this.classes, classesPresent, surroundingClasses);
    materializeEntitiesWithContext(subjectTypeConstraints.subclassOfInstanceOf, this.classes, classesPresent, surroundingClasses);

    // Value constraints
    if (WdProperty.isItemProperty(this.startProperty)) {
      const valueTypeConstraints = this.startProperty.itemConstraints.valueType;
      materializeEntitiesWithContext(valueTypeConstraints.instanceOf, this.classes, classesPresent, surroundingClasses);
      materializeEntitiesWithContext(valueTypeConstraints.subclassOfInstanceOf, this.classes, classesPresent, surroundingClasses);
    }

    // Properties
    materializeEntitiesWithContext(this.startProperty.subpropertyOf, this.properties, propertiesPresent, surroundingProperties);
    // materializeEntitiesWithContext(this.startProperty.subproperties, this.properties, propertiesPresent, surroundingProperties);
    materializeEntitiesWithContext(this.startProperty.relatedProperty, this.properties, propertiesPresent, surroundingProperties);
    materializeEntitiesWithContext(this.startProperty.complementaryProperty, this.properties, propertiesPresent, surroundingProperties);
    materializeEntitiesWithContext(this.startProperty.relatedProperty, this.properties, propertiesPresent, surroundingProperties);
    materializeEntitiesWithContext(this.startProperty.inverseProperty, this.properties, propertiesPresent, surroundingProperties);
    materializeEntitiesWithContext(this.startProperty.negatesProperty, this.properties, propertiesPresent, surroundingProperties);

    return [surroundingClasses, surroundingProperties];
  }

  public getSurroundings(): PropertyOneDistanceDocsReturnWrapper {
    const [surroundingClassNames, surroundingPropertyNames] = this.getOneDistanceDocsSurroundings();
    return new PropertyOneDistanceDocsReturnWrapper(this.startProperty, surroundingClassNames, surroundingPropertyNames);
  }
}
