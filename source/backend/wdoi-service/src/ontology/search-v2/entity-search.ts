import { logError } from '../../logging/log.js';
import type { EntityId } from '../entities/common.js';
import { WdClass } from '../entities/wd-class.js';
import { WdEntity } from '../entities/wd-entity.js';
import { WdProperty } from '../entities/wd-property.js';

export interface EntitySearchResults<OUT> {
  error: boolean;
  results?: OUT;
}

export interface EntitySearchBasedOnURIResult {
  wdClass?: WdClass | undefined;
  wdProperty?: WdProperty | undefined;
}

export abstract class EntitySearch<IN, T_OUT extends WdEntity, S_OUT> {
  protected readonly searchEndpointUrl: string;
  protected readonly classes: ReadonlyMap<EntityId, WdClass>;
  protected readonly properties: ReadonlyMap<EntityId, WdProperty>;

  constructor(
    searchEndpointUrl: string,
    classes: ReadonlyMap<EntityId, WdClass>,
    properties: ReadonlyMap<EntityId, WdProperty>,
  ) {
    this.searchEndpointUrl = searchEndpointUrl;
    this.classes = classes;
    this.properties = properties;
  }

  protected searchBasedOnURI(uri: string): EntitySearchBasedOnURIResult {
    const [entityType, entityNumId] = WdEntity.parseEntityURI(uri);
    if (entityType != null && entityNumId != null) {
      if (WdClass.isURIType(entityType)) {
        const cls = this.classes.get(entityNumId);
        if (cls != null) return { wdClass: cls };
      } else if (WdProperty.isURIType(entityType)) {
        const prop = this.properties.get(entityNumId);
        if (prop != null) return { wdProperty: prop };
      }
    }
    return {};
  }

  protected async fetchPostJson(data: IN): Promise<EntitySearchResults<S_OUT> | never> {
    return (await (
      await fetch(this.searchEndpointUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
    ).json()) as EntitySearchResults<S_OUT>;
  }

  protected async postToService(data: IN): Promise<EntitySearchResults<S_OUT>> {
    try {
      const response = await this.fetchPostJson(data);
      return {
        results: response.results,
        error: false,
      };
    } catch (e) {
      logError(e);
      return {
        error: true,
      };
    }
  }

  protected async querySearchService(data: IN): Promise<EntitySearchResults<S_OUT>> {
    return await this.postToService(data);
  }

  abstract search(config: IN): Promise<T_OUT[]>;
}
