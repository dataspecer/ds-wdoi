import type { EntityId, EntityIdsList } from '../../../entities/common';
import type { GeneralConstraints, ItemTypeConstraints } from '../../../entities/constraint';
import type { ItemProperty, StringProperty, QuantityProperty, CoordinatesProperty, TimeProperty } from '../../../entities/wd-property';
import { ModifierPropertyVisitor } from '../../modifiers';

export class AssignSubjectObjectValuesToClasses extends ModifierPropertyVisitor {
  visitItemProperty(prop: ItemProperty): void {
    this.processGeneralConstraints(prop.generalConstraints, prop.id);
    this.processItemConstraints(prop.itemConstraints, prop.id);
  }

  visitStringProperty(prop: StringProperty): void {
    this.processGeneralConstraints(prop.generalConstraints, prop.id);
  }

  visitQuantityProperty(prop: QuantityProperty): void {
    this.processGeneralConstraints(prop.generalConstraints, prop.id);
  }

  visitCoordinateProperty(prop: CoordinatesProperty): void {
    this.processGeneralConstraints(prop.generalConstraints, prop.id);
  }

  visitTimeProperty(prop: TimeProperty): void {
    this.processGeneralConstraints(prop.generalConstraints, prop.id);
  }

  private processGeneralConstraints(generalConstraints: GeneralConstraints, propId: EntityId): void {
    this.assignSubjectTypes(generalConstraints.subjectType.instanceOf, propId);
    this.assignSubjectTypes(generalConstraints.subjectType.subclassOfInstanceOf, propId);
  }

  private processItemConstraints(itemConstraints: ItemTypeConstraints, propId: EntityId): void {
    this.assignValueTypes(itemConstraints.valueType.instanceOf, propId);
    this.assignValueTypes(itemConstraints.valueType.subclassOfInstanceOf, propId);
  }

  private assignSubjectTypes(idsList: EntityIdsList, propId: EntityId): void {
    idsList.forEach((id) => {
      this.context.getClass(id)?.addSubjectOf(propId);
    });
  }

  private assignValueTypes(idsList: EntityIdsList, propId: EntityId): void {
    idsList.forEach((id) => {
      this.context.getClass(id)?.addValueOf(propId);
    });
  }
}
