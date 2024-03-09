import axios from 'axios';
import { WdClass } from '../entities/wd-class';
import { WdProperty } from '../entities/wd-property';
import { SurroundingsParts } from './get-surroundings';

interface GetDomainOrRangeReplyResults {
  classes: WdClass[];
}

interface GetDomainOrRangeReply {
  results: GetDomainOrRangeReplyResults;
}

export type DomainOrRange = 'domain' | 'range';

export async function fetchDomainOrRange(
  wdProperty: WdProperty,
  domainOrRange: DomainOrRange,
  part: SurroundingsParts,
): Promise<WdClass[]> {
  return (
    (await axios.get(`/api/v3/properties/${wdProperty.id}/${domainOrRange}?part=${part}`))
      .data as GetDomainOrRangeReply
  ).results.classes;
}
