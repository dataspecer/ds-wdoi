import axios from 'axios';
import { WdClassDescOnly } from '../entities/wd-class';
import { WdPropertyDescOnly } from '../entities/wd-property';

interface GetClassPropertyDomainRangeReplyResults {
  classes: WdClassDescOnly[];
}

interface GetClassPropertyDomainRangeReply {
  results: GetClassPropertyDomainRangeReplyResults;
}

export type DomainsOrRanges = 'domains' | 'ranges';
export type OwnOrInherited = 'own' | 'inherited';

export async function fetchDomainOrRange(
  wdClass: WdClassDescOnly,
  wdProperty: WdPropertyDescOnly,
  domainsOrRanges: DomainsOrRanges,
  part: OwnOrInherited,
): Promise<WdClassDescOnly[]> {
  return (
    (
      await axios.get(
        `/api/v3/classes/${wdClass.id}/properties/${wdProperty.id}/${domainsOrRanges}?part=${part}`,
      )
    ).data as GetClassPropertyDomainRangeReply
  ).results.classes;
}
