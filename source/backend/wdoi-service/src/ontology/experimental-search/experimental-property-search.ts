import type { ExperimentalSearchPropertiesBodyType } from '../../routes/ontology-routes/schemas/post-experimental-search-properties.js';
import type { EntityIdsList } from '../entities/common.js';
import { WdProperty } from '../entities/wd-property.js';
import { materializeEntities } from '../utils/materialize-entities.js';
import { ExperimentalEntitySearch } from './experimental-entity-search.js';

export class ExperimentalPropertySearch extends ExperimentalEntitySearch<
  ExperimentalSearchPropertiesBodyType,
  WdProperty,
  EntityIdsList
> {
  async search(config: ExperimentalSearchPropertiesBodyType): Promise<WdProperty[]> {
    if (WdProperty.URI_REGEXP.test(config.query.text)) {
      const uriSearchResult = this.searchBasedOnURI(config.query.text);
      if (uriSearchResult?.wdProperty !== undefined) {
        return [uriSearchResult.wdProperty];
      }
    } else {
      const searchResultsWrapper = await this.querySearchService(config);
      if (!searchResultsWrapper.error && searchResultsWrapper?.results !== undefined) {
        return materializeEntities(searchResultsWrapper.results, this.properties);
      }
    }

    return [];
  }
}
