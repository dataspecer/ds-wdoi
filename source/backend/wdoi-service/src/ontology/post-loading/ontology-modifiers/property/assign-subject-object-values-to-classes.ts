import { log } from '../../../../logging/log';
import type { EntityId, EntityIdsList } from '../../../entities/common';
import { PropertyScopeValue, type ItemTypeConstraints, type SubjectValueTypeContraint, AllowedEntityTypesValue } from '../../../entities/constraint';
import {
  type ItemProperty,
  type StringProperty,
  type QuantityProperty,
  type CoordinatesProperty,
  type TimeProperty,
  type WdProperty,
  Datatype,
} from '../../../entities/wd-property';
import { type ModifierContext, ModifierPropertyVisitor } from '../../modifiers';

export class AssignSubjectObjectValuesToClasses extends ModifierPropertyVisitor {
  assignedProperties: Set<number>;

  constructor(context: ModifierContext) {
    super(context);
    this.assignedProperties = new Set<number>();
  }

  visitItemProperty(prop: ItemProperty): void {
    this.common(prop, prop.itemConstraints);
  }

  visitStringProperty(prop: StringProperty): void {
    this.common(prop, null);
  }

  visitQuantityProperty(prop: QuantityProperty): void {
    this.common(prop, null);
  }

  visitCoordinateProperty(prop: CoordinatesProperty): void {
    this.common(prop, null);
  }

  visitTimeProperty(prop: TimeProperty): void {
    this.common(prop, null);
  }

  private canBeUsedAsMainValue(prop: WdProperty): boolean {
    return prop.generalConstraints.propertyScope.includes(PropertyScopeValue.AS_MAIN);
  }

  private canBeUsedOnItems(prop: WdProperty): boolean {
    return prop.generalConstraints.allowedEntityTypes.includes(AllowedEntityTypesValue.ITEM);
  }

  private datatypeIsNotLexicographic(prop: WdProperty): boolean {
    return prop.datatype !== Datatype.LEXEME && prop.datatype !== Datatype.FORM && prop.datatype !== Datatype.SENSE;
  }

  private common(prop: WdProperty, itemConstraints: ItemTypeConstraints | null): void {
    if (this.canBeUsedAsMainValue(prop) && this.canBeUsedOnItems(prop) && this.datatypeIsNotLexicographic(prop)) {
      this.assignedProperties.add(prop.id);

      this.processSubjectConstraints(prop.generalConstraints.subjectType, prop.id);
      if (itemConstraints != null) {
        this.processValueConstraints(itemConstraints.valueType, prop.id);
      }
    }
  }

  private processSubjectConstraints(subjectType: SubjectValueTypeContraint, propId: EntityId): void {
    this.assignSubjectTypes(subjectType.instanceOf, propId);
    this.assignSubjectTypes(subjectType.subclassOfInstanceOf, propId);
  }

  private processValueConstraints(valueType: SubjectValueTypeContraint, propId: EntityId): void {
    this.assignValueTypes(valueType.instanceOf, propId);
    this.assignValueTypes(valueType.subclassOfInstanceOf, propId);
  }

  private assignSubjectTypes(idsList: EntityIdsList, propId: EntityId): void {
    idsList.forEach((id) => {
      this.context.getClass(id)?.subjectOfProperty.push(propId);
    });
  }

  private assignValueTypes(idsList: EntityIdsList, propId: EntityId): void {
    idsList.forEach((id) => {
      this.context.getClass(id)?.valueOfProperty.push(propId);
    });
  }

  printReport(): void {
    log(`From ${this.context.properties.size} assigned ${this.assignedProperties.size} as subject/value`);
  }
}
