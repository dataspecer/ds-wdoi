import type { GeneralConstraints, ItemTypeConstraints } from '../../../entities/constraint';
import type { ItemProperty, StringProperty, QuantityProperty, CoordinatesProperty, TimeProperty } from '../../../entities/wd-property';
import { ModifierPropertyVisitor } from '../../modifiers';

export class ConstraintsValidity extends ModifierPropertyVisitor {
  visitItemProperty(prop: ItemProperty): void {
    this.validateGeneralConstraints(prop.generalConstraints);
    this.validateItemTypeConstraints(prop.itemConstraints);
  }

  visitStringProperty(prop: StringProperty): void {
    this.validateGeneralConstraints(prop.generalConstraints);
  }

  visitQuantityProperty(prop: QuantityProperty): void {
    this.validateGeneralConstraints(prop.generalConstraints);
  }

  visitCoordinateProperty(prop: CoordinatesProperty): void {
    this.validateGeneralConstraints(prop.generalConstraints);
  }

  visitTimeProperty(prop: TimeProperty): void {
    this.validateGeneralConstraints(prop.generalConstraints);
  }

  private validateGeneralConstraints(generalConstraints: GeneralConstraints): void {
    generalConstraints.allowedQualifiers = this.context.filterOutNonExisting(generalConstraints.allowedQualifiers, false);
    generalConstraints.requiredQualifiers = this.context.filterOutNonExisting(generalConstraints.requiredQualifiers, false);
    generalConstraints.subjectType.instanceOf = this.context.filterOutNonExisting(generalConstraints.subjectType.instanceOf, false);
    generalConstraints.subjectType.subclassOf = this.context.filterOutNonExisting(generalConstraints.subjectType.subclassOf, false);
    generalConstraints.subjectType.subclassOfInstanceOf = this.context.filterOutNonExisting(
      generalConstraints.subjectType.subclassOfInstanceOf,
      false,
    );
    generalConstraints.itemRequiresStatement = this.context.filterOutNonExistingAllowanceMap(generalConstraints.itemRequiresStatement, false);
    generalConstraints.conflictsWith = this.context.filterOutNonExistingAllowanceMap(generalConstraints.conflictsWith, false);
  }

  private validateItemTypeConstraints(itemConstraints: ItemTypeConstraints): void {
    itemConstraints.valueType.instanceOf = this.context.filterOutNonExisting(itemConstraints.valueType.instanceOf, false);
    itemConstraints.valueType.subclassOf = this.context.filterOutNonExisting(itemConstraints.valueType.subclassOf, false);
    itemConstraints.valueType.subclassOfInstanceOf = this.context.filterOutNonExisting(itemConstraints.valueType.subclassOfInstanceOf, false);
    itemConstraints.valueRequiresStatement = this.context.filterOutNonExistingAllowanceMap(itemConstraints.valueRequiresStatement, false);

    const inversePropertyId = itemConstraints.inverse;
    if (inversePropertyId != null && !this.context.properties.has(inversePropertyId)) {
      itemConstraints.inverse = null;
    }
  }
}
