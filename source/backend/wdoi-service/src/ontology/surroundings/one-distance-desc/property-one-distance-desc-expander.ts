import { type EntityId } from '../../entities/common.js';
import { type WdClass } from '../../entities/wd-class.js';
import { WdProperty } from '../../entities/wd-property.js';
import { materializeEntitiesWithContext } from '../../utils/materialize-entities.js';
import { OneDistanceDescExpander } from './one-distance-desc-expander.js';

export class PropertyOneDistanceDescReturnWrapper {
  startProperty: WdProperty;
  surroundingClassesDesc: WdClass[];
  surroundingPropertiesDesc: WdProperty[];

  constructor(
    startProperty: WdProperty,
    surroundingClassesDesc: WdClass[],
    surroundingPropertiesDesc: WdProperty[],
  ) {
    this.startProperty = startProperty;
    this.surroundingClassesDesc = surroundingClassesDesc;
    this.surroundingPropertiesDesc = surroundingPropertiesDesc;
  }
}

export class PropertyOneDistanceDescExpander extends OneDistanceDescExpander {
  protected readonly startProperty: WdProperty;

  constructor(
    startProperty: WdProperty,
    classes: ReadonlyMap<EntityId, WdClass>,
    properties: ReadonlyMap<EntityId, WdProperty>,
  ) {
    super(classes, properties);
    this.startProperty = startProperty;
  }

  private getOneDistanceDocsSurroundings(): [WdClass[], WdProperty[]] {
    const surroundingClasses: WdClass[] = [];
    const surroundingProperties: WdProperty[] = [];
    const classesPresent = new Set<EntityId>();

    // Subject constraints
    materializeEntitiesWithContext(
      this.startProperty.generalConstraints.subjectTypeStats,
      this.contextClasses,
      classesPresent,
      surroundingClasses,
    );

    // Value constraints
    if (WdProperty.isItemProperty(this.startProperty)) {
      materializeEntitiesWithContext(
        this.startProperty.itemConstraints.valueTypeStats,
        this.contextClasses,
        classesPresent,
        surroundingClasses,
      );
    }

    return [surroundingClasses, surroundingProperties];
  }

  public getSurroundings(): PropertyOneDistanceDescReturnWrapper {
    const [surroundingClassNames, surroundingPropertyNames] = this.getOneDistanceDocsSurroundings();
    return new PropertyOneDistanceDescReturnWrapper(
      this.startProperty,
      surroundingClassNames,
      surroundingPropertyNames,
    );
  }
}
