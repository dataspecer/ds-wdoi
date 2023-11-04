import type { WdClass } from '../../../entities/wd-class';
import { ModifierClassVisitor } from '../../modifiers';

export class RemoveMissingStatementsReferences extends ModifierClassVisitor {
  visitWdClass(cls: WdClass): void {
    cls.instanceOf = this.context.filterOutNonExisting(cls.instanceOf, true);
    cls.parents = this.context.filterOutNonExisting(cls.parents, true);
    cls.propertiesForThisType = this.context.filterOutNonExisting(cls.propertiesForThisType, false);
  }
}
