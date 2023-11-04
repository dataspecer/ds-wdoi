import type { EntityId } from './entities/common';
import { ROOT_CLASS_ID, type WdClass } from './entities/wd-class';
import { type WdProperty } from './entities/wd-property';
import { loadEntities, processFuncClassesCapture, processFuncPropertiesCapture } from './loading/load-ontology';
import { ModifierContext } from './post-loading/modifiers';
import { RemoveMissingStatementsReferences as RmsProperty } from './post-loading/ontology-modifiers/property/remove-missing-statements-references';
import { RemoveMissingStatementsReferences as RmsClass } from './post-loading/ontology-modifiers/class/remove-missing-statements-references';
import { AllClassesAreRooted } from './post-loading/ontology-modifiers/class/all-classes-are-rooted';
import { MarkChildrenToParents } from './post-loading/ontology-modifiers/class/mark-children-to-parents';
import { ConstraintsValidity } from './post-loading/ontology-modifiers/property/constraints-validity';
import { AssignSubjectObjectValuesToClasses } from './post-loading/ontology-modifiers/property/assign-subject-object-values-to-classes';

import { CLASSES_LOG_STEP, PROPERTIES_LOG_STEP, logger, tryLog } from '../logging/logger';

const moduleLogger = logger.child({ module: 'creation' });

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
    moduleLogger.info('Starting to post process modyfying on classes');

    const classModifiers = [new RmsClass(ctx), new AllClassesAreRooted(ctx), new MarkChildrenToParents(ctx)];
    let i = 0;
    for (const wdClass of ctx.classes.values()) {
      classModifiers.forEach(wdClass.accept);
      i += 1;
      tryLog(moduleLogger, i, CLASSES_LOG_STEP);
    }
  }

  private static postLoadModifyProperties(ctx: ModifierContext): void {
    moduleLogger.info('Starting to post process modyfying on properties');

    const propertyModifiers = [new RmsProperty(ctx), new ConstraintsValidity(ctx), new AssignSubjectObjectValuesToClasses(ctx)];
    let i = 0;
    for (const wdProperty of ctx.properties.values()) {
      propertyModifiers.forEach(wdProperty.accept);
      i += 1;
      tryLog(moduleLogger, i, PROPERTIES_LOG_STEP);
    }
  }

  private static postLoadModify(o: WdOntology): void {
    const ctx = new ModifierContext(o.rootClass, o.classes, o.properties);
    WdOntology.postLoadModifyClasses(ctx);
    WdOntology.postLoadModifyProperties(ctx);
  }

  static async create(classesJsonFilePath: string, propertiesJsonFilePath: string): Promise<WdOntology | never> {
    moduleLogger.info('Starting to load classes');
    const props = await loadEntities<WdProperty>(propertiesJsonFilePath, processFuncPropertiesCapture, PROPERTIES_LOG_STEP);

    moduleLogger.info('Starting to load properties');
    const cls = await loadEntities<WdClass>(classesJsonFilePath, processFuncClassesCapture, CLASSES_LOG_STEP);
    const rootClass = cls.get(ROOT_CLASS_ID);

    if (rootClass != null) {
      const ontology = new WdOntology(rootClass, cls, props);
      WdOntology.postLoadModify(ontology);
      moduleLogger.info('Successfully created the ontology');
      return ontology;
    } else {
      throw new Error('Could not find a root class.');
    }
  }
}
