import type { InputEntity } from '../loading/input/input-entity.js';
import type { EntityId, LanguageMap } from './common.js';
import { emptyLanguageMapOrSave } from './wd-property-empty-type-constants.js';

export abstract class WdEntity {
  public static entityURITypes: Set<string> = new Set<string>();
  public static readonly URI_REGEXP = new RegExp(
    '^https?://www.wikidata.org/(entity/Q|entity/P|wiki/Q|wiki/Property:P)[1-9][0-9]*$',
  );

  readonly id: EntityId;
  readonly iri: string;
  readonly labels: LanguageMap;
  readonly descriptions: LanguageMap;
  // readonly instanceOf: EntityIdsList;

  constructor(inputEntity: InputEntity) {
    this.id = inputEntity.id;
    this.iri = inputEntity.iri;
    this.labels = inputEntity.labels; // Never empty
    this.descriptions = emptyLanguageMapOrSave(inputEntity.descriptions);
    // this.instanceOf = emptyEntitiesIdsListOrSave(inputEntity.instanceOf);
  }

  public static isValidURIType(entityType: string): boolean {
    return WdEntity.entityURITypes.has(entityType);
  }

  public static parseEntityURI(uri: string): [string | null, number | null] {
    try {
      const uriLastPart: string | undefined = uri.split('/').pop();
      if (uriLastPart != null) {
        let entityStrId: string | undefined = uriLastPart;
        if (entityStrId.includes(':')) {
          entityStrId = entityStrId.split(':').pop();
        }
        if (entityStrId != null) {
          const entityType = entityStrId[0];
          const entityNumId = Number(entityStrId.slice(1));
          if (entityNumId != null && WdEntity.isValidURIType(entityType)) {
            return [entityType, entityNumId];
          }
        }
      }
    } catch (_) {}
    return [null, null];
  }
}
