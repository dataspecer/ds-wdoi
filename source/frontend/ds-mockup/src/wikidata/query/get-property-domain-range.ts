import axios from 'axios';
import { WdClassHierarchyDescOnly } from '../entities/wd-class';
import { WdPropertyDescOnly } from '../entities/wd-property';

interface GetClassPropertyDomainRangeReplyResults {
  classes: WdClassHierarchyDescOnly[];
}

interface GetClassPropertyDomainRangeReply {
  results: GetClassPropertyDomainRangeReplyResults;
}

export type DomainsOrRanges = 'domains' | 'ranges';
export type BaseOrInherit = 'base' | 'inherit';

export async function fetchDomainOrRange(
  wdClass: WdClassHierarchyDescOnly,
  wdProperty: WdPropertyDescOnly,
  domainsOrRanges: DomainsOrRanges,
  order: BaseOrInherit,
): Promise<WdClassHierarchyDescOnly[]> {
  return (
    (
      await axios.get(
        `/api/v3/classes/${wdClass.id}/properties/${wdProperty.id}/${domainsOrRanges}?order=${order}`,
      )
    ).data as GetClassPropertyDomainRangeReply
  ).results.classes;
}
