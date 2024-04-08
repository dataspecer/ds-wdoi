import { type EntityId } from '../../entities/common.js';
import { type WdClass } from '../../entities/wd-class.js';
import { WdProperty } from '../../entities/wd-property.js';
import { materializeEntitiesWithContext } from '../../utils/materialize-entities.js';
import { OneDistanceDocsExpander } from './one-distance-docs-expander.js';

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

export class PropertyOneDistanceDocsExpander extends OneDistanceDocsExpander {
  protected readonly startProperty: WdProperty;

  constructor(startProperty: WdProperty, classes: ReadonlyMap<EntityId, WdClass>, properties: ReadonlyMap<EntityId, WdProperty>) {
    super(classes, properties);
    this.startProperty = startProperty;
  }

  private getOneDistanceDocsSurroundings(): [WdClass[], WdProperty[]] {
    const surroundingClasses: WdClass[] = [];
    const surroundingProperties: WdProperty[] = [];
    const classesPresent = new Set<EntityId>();
    const propertiesPresent = new Set<EntityId>();

    // Subject constraints
    materializeEntitiesWithContext(this.startProperty.generalConstraints.subjectTypeStats, this.classes, classesPresent, surroundingClasses);

    // Value constraints
    if (WdProperty.isItemProperty(this.startProperty)) {
      materializeEntitiesWithContext(this.startProperty.itemConstraints.valueTypeStats, this.classes, classesPresent, surroundingClasses);
    }

    // Properties
    materializeEntitiesWithContext(this.startProperty.subpropertyOf, this.properties, propertiesPresent, surroundingProperties);
    materializeEntitiesWithContext(this.startProperty.subproperties, this.properties, propertiesPresent, surroundingProperties);
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
