import type { EntityId } from '../ontology/entities/common';

export const CLASSES_LOG_STEP = 100_000;
export const PROPERTIES_LOG_STEP = 1_000;

export function missingLog(id: EntityId, classesFlag: boolean): void {
  console.log(`Missing class ${id} from  ${classesFlag ? 'classes' : 'properties'}`);
}

export function tryLog(i: number, step: number): void {
  if (i % step === 0) {
    console.log(i);
  }
}
