import { logError } from '../../logging/log.js';
import type { EntityId } from '../entities/common.js';
import type { WdClass } from '../entities/wd-class.js';
import type { WdProperty } from '../entities/wd-property.js';

export interface SearchResults<OUT> {
  error: boolean;
  results?: OUT;
}

// The class can be further specialized for classes and properties.
// This is the minimal working class.
export class ExperimentalOntologySearch<IN, OUT> {
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

  private async fetchPostJson<IN, OUT>(data: IN): Promise<SearchResults<OUT> | never> {
    return (await (
      await fetch(this.searchEndpointUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
    ).json()) as SearchResults<OUT>;
  }

  protected async postToService<IN, OUT>(data: IN): Promise<SearchResults<OUT>> {
    try {
      const response = await this.fetchPostJson<IN, OUT>(data);
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

  async search(data: IN): Promise<SearchResults<OUT>> {
    const results = await this.postToService<IN, OUT>(data);
    return await this.afterSearch(results);
  }

  protected async afterSearch(results: SearchResults<OUT>): Promise<SearchResults<OUT>> {
    return results;
  }
}
