import { missingLog } from '../../../../logging/logger';
import type { EntityId } from '../../../entities/common';
import type { WdClass } from '../../../entities/wd-class';
import { ModifierClassVisitor } from '../../modifiers';

export class MarkChildrenToParents extends ModifierClassVisitor {
  visitWdClass(cls: WdClass): void {
    cls.parents.forEach((parentId: EntityId) => {
      const parent: WdClass | undefined = this.context.getClass(parentId);
      if (parent != null) {
        parent.addChild(cls.id);
      } else {
        missingLog(parentId, true);
      }
    });
  }
}
