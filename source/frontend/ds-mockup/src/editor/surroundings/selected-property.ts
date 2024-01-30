import { WdClass } from '../../wikidata/entities/wd-class';
import { WdProperty } from '../../wikidata/entities/wd-property';

export class SelectedProperty {
  property: WdProperty;
  endpoint: WdClass | undefined;

  constructor(property: WdProperty, endpoint: WdClass | undefined) {
    this.property = property;
    this.endpoint = endpoint;
  }
}
