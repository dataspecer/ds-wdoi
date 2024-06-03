import type { ExperimentalSearchClassesBodyType } from '../../routes/ontology-routes/schemas/post-experimental-search-classes.js';
import type { EntityIdsList } from '../entities/common.js';
import { WdClass } from '../entities/wd-class.js';
import { materializeEntities } from '../utils/materialize-entities.js';
import { ExperimentalEntitySearch } from './experimental-entity-search.js';

export class ExperimentalClassSearch extends ExperimentalEntitySearch<
  ExperimentalSearchClassesBodyType,
  WdClass,
  EntityIdsList
> {
  async search(config: ExperimentalSearchClassesBodyType): Promise<WdClass[]> {
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
