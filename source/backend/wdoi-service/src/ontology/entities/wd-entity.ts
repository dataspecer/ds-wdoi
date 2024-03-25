import type { InputEntity } from '../loading/input/input-entity';
import type { EntityId, EntityIdsList, LanguageMap } from './common';
import { emptyEntitiesIdsListOrSave, emptyLanguageMapOrSave } from './empty-type-constants';

export abstract class WdEntity {
  public static entityURITypes: Set<string> = new Set<string>();

  readonly id: EntityId;
  readonly iri: string;
  readonly labels: LanguageMap;
  readonly descriptions: LanguageMap;
  readonly instanceOf: EntityIdsList;

  constructor(inputEntity: InputEntity) {
    this.id = inputEntity.id;
    this.iri = inputEntity.iri;
    this.labels = inputEntity.labels; // Never empty
    this.descriptions = emptyLanguageMapOrSave(inputEntity.descriptions);
    this.instanceOf = emptyEntitiesIdsListOrSave(inputEntity.instanceOf);
  }

  public static isValidURIType(entityType: string): boolean {
    return WdEntity.entityURITypes.has(entityType);
  }
}
