import type { ItemProperty, StringProperty, QuantityProperty, CoordinatesProperty, TimeProperty, WdProperty } from '../../../entities/wd-property';
import { ModifierPropertyVisitor } from '../../modifiers';

export class RemoveMissingStatementsReferences extends ModifierPropertyVisitor {
  visitItemProperty(prop: ItemProperty): void {
    this.removeMissingReferences(prop);
  }

  visitStringProperty(prop: StringProperty): void {
    this.removeMissingReferences(prop);
  }

  visitQuantityProperty(prop: QuantityProperty): void {
    this.removeMissingReferences(prop);
  }

  visitCoordinateProperty(prop: CoordinatesProperty): void {
    this.removeMissingReferences(prop);
  }

  visitTimeProperty(prop: TimeProperty): void {
    this.removeMissingReferences(prop);
  }

  private removeMissingReferences(prop: WdProperty): void {
    prop.instanceOf = this.context.filterOutNonExisting(prop.instanceOf, false);
    prop.relatedProperty = this.context.filterOutNonExisting(prop.relatedProperty, false);
    prop.parentProperty = this.context.filterOutNonExisting(prop.parentProperty, false);
  }
}
