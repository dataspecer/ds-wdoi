import axios from 'axios';
import { WdClass } from '../entities/wd-class';
import { WdProperty } from '../entities/wd-property';

interface GetClassPropertyDomainRangeReplyResults {
  classes: WdClass[];
}

interface GetClassPropertyDomainRangeReply {
  results: GetClassPropertyDomainRangeReplyResults;
}

export type DomainsOrRanges = 'domains' | 'ranges';
export type OwnOrInherited = 'own' | 'inherited';

export async function fetchDomainOrRange(
  wdClass: WdClass,
  wdProperty: WdProperty,
  domainsOrRanges: DomainsOrRanges,
  part: OwnOrInherited,
): Promise<WdClass[]> {
  return (
    (
      await axios.get(
        `/api/v3/classes/${wdClass.id}/property/${wdProperty.id}/${domainsOrRanges}?part=${part}`,
      )
    ).data as GetClassPropertyDomainRangeReply
  ).results.classes;
}
