import { CLASSES_LOG_STEP, PROPERTIES_LOG_STEP, log } from '../../logging/log.js';
import type { EntityId } from './entities/common.js';
import { ROOT_CLASS_ID, type WdClass } from './entities/wd-class.js';
import type { WdProperty } from './entities/wd-property.js';
import {
  loadEntities,
  processFuncPropertiesCapture,
  processFuncClassesCapture,
} from './loading/load-ontology-context.js';
import {
  normalizeClassesFeatures,
  normalizePropertiesFeatures,
} from './normalize-features/normalize-features.js';

export class WdOntologyContext {
  readonly classes: ReadonlyMap<EntityId, WdClass>;
  readonly properties: ReadonlyMap<EntityId, WdProperty>;
  readonly rootClass: WdClass | undefined;
  readonly rootClassProperties: Set<EntityId> = new Set<EntityId>();

  private constructor(
    classes: ReadonlyMap<EntityId, WdClass>,
    properties: ReadonlyMap<EntityId, WdProperty>,
    rootClass: WdClass | undefined,
  ) {
    this.classes = classes;
    this.properties = properties;
    this.rootClass = rootClass;

    if (rootClass !== undefined) {
      this.rootClassProperties = new Set<EntityId>(rootClass?.ownProperties ?? []);
    }
  }

  static async create(
    classesJsonFilePath: string,
    propertiesJsonFilePath: string,
  ): Promise<WdOntologyContext | never> {
    log('Starting to load properties');
    const props = await loadEntities<WdProperty>(
      propertiesJsonFilePath,
      processFuncPropertiesCapture,
      PROPERTIES_LOG_STEP,
    );

    log('Starting to load classes');
    const cls = await loadEntities<WdClass>(
      classesJsonFilePath,
      processFuncClassesCapture,
      CLASSES_LOG_STEP,
    );

    const rootClass = cls.get(ROOT_CLASS_ID);
    // Allow missing root when dics are empty - empty initial start.
    if (rootClass !== undefined || (props.size === 0 && cls.size === 0)) {
      const ontologyContext = new WdOntologyContext(cls, props, rootClass);

      normalizePropertiesFeatures(ontologyContext.properties);
      normalizeClassesFeatures(ontologyContext.classes);

      log('Ontology context created');
      return ontologyContext;
    } else {
      throw new Error('Could not find a root class.');
    }
  }
}
