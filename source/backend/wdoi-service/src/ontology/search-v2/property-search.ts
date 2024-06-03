import type { SearchPropertiesBodyType } from '../../routes/ontology-routes/schemas/post-search-properties.js';
import type { EntityIdsList } from '../entities/common.js';
import { WdProperty } from '../entities/wd-property.js';
import { materializeEntities } from '../utils/materialize-entities.js';
import { EntitySearch } from './entity-search.js';

export class PropertySearch extends EntitySearch<
  SearchPropertiesBodyType,
  WdProperty,
  EntityIdsList
> {
  async search(config: SearchPropertiesBodyType): Promise<WdProperty[]> {
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
