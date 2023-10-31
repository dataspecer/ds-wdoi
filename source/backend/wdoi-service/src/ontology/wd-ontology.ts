import { ROOT_CLASS_ID, type WdClass } from './entities/wd-class';
import type { WdProperty } from './entities/wd-property';
import { loadEntities, processFuncClassesCapture, processFuncPropertiesCapture } from './loading/load-ontology';

export class WdOntology {
  private readonly rootClass: WdClass;
  private readonly classes: Map<number, WdClass>;
  private readonly properties: Map<number, WdProperty>;

  private constructor(rootClass: WdClass, classes: Map<number, WdClass>, properties: Map<number, WdProperty>) {
    this.rootClass = rootClass;
    this.classes = classes;
    this.properties = properties;
  }

  static async Create(classesJsonFilePath: string, propertiesJsonFilePath: string): Promise<WdOntology | never> {
    const props = await loadEntities<WdProperty>(propertiesJsonFilePath, processFuncPropertiesCapture);
    const cls = await loadEntities<WdClass>(classesJsonFilePath, processFuncClassesCapture);
    const rootClass = cls.get(ROOT_CLASS_ID);
    if (rootClass != null) {
      return new WdOntology(rootClass, cls, props);
    } else {
      throw new Error('Could not find a root class.');
    }
  }
}
