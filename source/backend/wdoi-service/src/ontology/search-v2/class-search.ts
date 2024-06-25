import type { SearchClassesBodyType } from '../../routes/ontology-routes/schemas/post-search-classes.js';
import type { EntityIdsList } from '../entities/common.js';
import { WdClass } from '../entities/wd-class.js';
import { materializeEntities } from '../utils/materialize-entities.js';
import { EntitySearch } from './entity-search.js';

export class ClassSearch extends EntitySearch<SearchClassesBodyType, WdClass, EntityIdsList> {
  async search(config: SearchClassesBodyType): Promise<WdClass[]> {
    config.query.text = config.query.text.trim();
    if (WdClass.URI_REGEXP.test(config.query.text)) {
      const uriSearchResult = this.searchBasedOnURI(config.query.text);
      if (uriSearchResult?.wdClass !== undefined) {
        return [uriSearchResult.wdClass];
      }
    } else {
      const searchResultsWrapper = await this.querySearchService(config);
      if (!searchResultsWrapper.error && searchResultsWrapper?.results !== undefined) {
        return materializeEntities(searchResultsWrapper.results, this.classes);
      }
    }

    return [];
  }
}
