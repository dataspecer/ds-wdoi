import type { InputEntity } from '../loading/input/input-entity';
import type { EntityId, EntityIdsList, LanguageMap } from './common';

export abstract class WdEntity {
  public static entityURITypes: Set<string> = new Set<string>();

  readonly id: EntityId;
  readonly labels: LanguageMap;
  readonly descriptions: LanguageMap;
  readonly instanceOf: EntityIdsList;

  constructor(inputEntity: InputEntity) {
    this.id = inputEntity.id;
    this.labels = inputEntity.labels;
    this.descriptions = inputEntity.descriptions;
    this.instanceOf = inputEntity.instanceOf;
  }

  public static isValidURIType(entityType: string): boolean {
    return WdEntity.entityURITypes.has(entityType);
  }
}
