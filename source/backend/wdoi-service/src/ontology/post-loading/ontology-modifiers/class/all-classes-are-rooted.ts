import { WdClass, ROOT_CLASS_ID } from '../../../entities/wd-class';
import { ModifierClassVisitor } from '../../modifiers';

export class AllClassesAreRooted extends ModifierClassVisitor {
  visitWdClass(cls: WdClass): void {
    if (WdClass.isRootClass(cls)) {
      cls.parents = [];
    } else if (cls.parents.length === 0) {
      cls.addParent(ROOT_CLASS_ID);
    } else {
      // Nothing to modify.
    }
  }
}
