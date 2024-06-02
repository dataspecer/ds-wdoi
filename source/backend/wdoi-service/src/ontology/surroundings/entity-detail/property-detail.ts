import { type EntityId } from '../../entities/common.js';
import { type WdClass } from '../../entities/wd-class.js';
import { WdProperty } from '../../entities/wd-property.js';
import { EntityDetail } from './entity-detail.js';

export class PropertyDetailReturnWrapper {
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

export class PropertyDetail extends EntityDetail {
  protected readonly startProperty: WdProperty;

  constructor(
    startProperty: WdProperty,
    classes: ReadonlyMap<EntityId, WdClass>,
    properties: ReadonlyMap<EntityId, WdProperty>,
  ) {
    super(classes, properties);
    this.startProperty = startProperty;
  }

  protected getOneDistanceDocsSurroundings(): [WdClass[], WdProperty[]] {
    const surroundingClasses: WdClass[] = [];
    const surroundingProperties: WdProperty[] = [];
    const classesPresent = new Set<EntityId>();

    // Subject constraints
    this.collectToContext(
      this.startProperty.generalConstraints.subjectTypeStats,
      this.contextClasses,
      classesPresent,
      surroundingClasses,
    );

    // Value constraints
    if (WdProperty.isItemProperty(this.startProperty)) {
      this.collectToContext(
        this.startProperty.itemConstraints.valueTypeStats,
        this.contextClasses,
        classesPresent,
        surroundingClasses,
      );
    }

    return [surroundingClasses, surroundingProperties];
  }

  public getDetail(): PropertyDetailReturnWrapper {
    const [surroundingClassNames, surroundingPropertyNames] = this.getOneDistanceDocsSurroundings();
    return new PropertyDetailReturnWrapper(
      this.startProperty,
      surroundingClassNames,
      surroundingPropertyNames,
    );
  }
}
