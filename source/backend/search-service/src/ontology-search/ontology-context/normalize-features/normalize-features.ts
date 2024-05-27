import { log } from '../../../logging/log.js';
import type { EntityId } from '../entities/common.js';
import type { WdClass } from '../entities/wd-class.js';
import type { WdProperty } from '../entities/wd-property.js';
import { normalizeFeatureSatu } from './normalizers/satu-normalizer.js';

export function normalizePropertiesFeatures(properties: ReadonlyMap<EntityId, WdProperty>): void {
  log(`Normalizing equivalent properties count for properties with saturation ${2}.`);
  normalizeFeatureSatu(
    2,
    (property: WdProperty) => property.equivalentPropertyCount,
    (property: WdProperty, value: number) => (property.equivalentPropertyCount = value),
    properties,
  );

  log(`Normalizing usage count for properties with saturation ${3_000}.`);
  normalizeFeatureSatu(
    3_000,
    (property: WdProperty) => property.usageCount,
    (property: WdProperty, value: number) => (property.usageCount = value),
    properties,
  );
}

export function normalizeClassesFeatures(classes: ReadonlyMap<EntityId, WdClass>): void {
  log(`Normalizing equivalent classes count for classes with saturation ${2}.`);
  normalizeFeatureSatu(
    2,
    (cls: WdClass) => cls.equivalentClassCount,
    (cls: WdClass, value: number) => (cls.equivalentClassCount = value),
    classes,
  );

  log(`Normalizing number of instances for classes with saturation ${100}.`);
  normalizeFeatureSatu(
    100,
    (cls: WdClass) => cls.instanceCount,
    (cls: WdClass, value: number) => (cls.instanceCount = value),
    classes,
  );
}
