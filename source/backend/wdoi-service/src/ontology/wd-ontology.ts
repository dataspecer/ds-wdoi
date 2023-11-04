import type { EntityId } from './entities/common';
import { ROOT_CLASS_ID, type WdClass } from './entities/wd-class';
import type { WdProperty } from './entities/wd-property';
import { loadEntities, processFuncClassesCapture, processFuncPropertiesCapture } from './loading/load-ontology';
import { ModifierContext } from './post-loading/modifiers';
import { RemoveMissingStatementsReferences as RmsProperty } from './post-loading/ontology-modifiers/property/remove-missing-statements-references';
import { RemoveMissingStatementsReferences as RmsClass } from './post-loading/ontology-modifiers/class/remove-missing-statements-references';
import { AllClassesAreRooted } from './post-loading/ontology-modifiers/class/all-classes-are-rooted';
import { MarkChildrenToParents } from './post-loading/ontology-modifiers/class/mark-children-to-parents';
import { ConstraintsValidity } from './post-loading/ontology-modifiers/property/constraints-validity';
import { AssignSubjectObjectValuesToClasses } from './post-loading/ontology-modifiers/property/assign-subject-object-values-to-classes';

export class WdOntology {
  private readonly rootClass: WdClass;
  private readonly classes: Map<EntityId, WdClass>;
  private readonly properties: Map<EntityId, WdProperty>;

  private constructor(rootClass: WdClass, classes: Map<EntityId, WdClass>, properties: Map<EntityId, WdProperty>) {
    this.rootClass = rootClass;
    this.classes = classes;
    this.properties = properties;
  }

  private static postLoadModifyClasses(ctx: ModifierContext): void {
    const classModifiers = [new RmsClass(ctx), new AllClassesAreRooted(ctx), new MarkChildrenToParents(ctx)];
    for (const wdClass of ctx.classes.values()) {
      classModifiers.forEach(wdClass.accept);
    }
  }

  private static postLoadModifyProperties(ctx: ModifierContext): void {
    const propertyModifiers = [new RmsProperty(ctx), new ConstraintsValidity(ctx), new AssignSubjectObjectValuesToClasses(ctx)];
    for (const wdProperty of ctx.properties.values()) {
      propertyModifiers.forEach(wdProperty.accept);
    }
  }

  private static postLoadModify(o: WdOntology): void {
    const ctx = new ModifierContext(o.rootClass, o.classes, o.properties);
    WdOntology.postLoadModifyClasses(ctx);
    WdOntology.postLoadModifyProperties(ctx);
  }

  static async create(classesJsonFilePath: string, propertiesJsonFilePath: string): Promise<WdOntology | never> {
    const props = await loadEntities<WdProperty>(propertiesJsonFilePath, processFuncPropertiesCapture);
    const cls = await loadEntities<WdClass>(classesJsonFilePath, processFuncClassesCapture);
    const rootClass = cls.get(ROOT_CLASS_ID);
    if (rootClass != null) {
      const ontology = new WdOntology(rootClass, cls, props);
      WdOntology.postLoadModify(ontology);
      return ontology;
    } else {
      throw new Error('Could not find a root class.');
    }
  }
}
