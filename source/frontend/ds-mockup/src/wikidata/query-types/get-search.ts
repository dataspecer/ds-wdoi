import { WdClass } from '../entities/wd-class';
import { WdProperty } from '../entities/wd-property';

export interface GetSearchReplyResults {
  classes: WdClass[];
  properties: WdProperty[];
}

export interface GetSearchReply {
  results: GetSearchReplyResults;
}
