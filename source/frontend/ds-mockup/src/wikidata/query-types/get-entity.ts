import { WdClass, WdClassDocsOnly } from '../entities/wd-class';
import { WdProperty, WdPropertyDocsOnly } from '../entities/wd-property';

export interface GetClassWithSurroundingNamesReplyResults {
  classes: WdClass[];
  surroundingClassNames: WdClassDocsOnly[];
  surroundingPropertyNames: WdPropertyDocsOnly[];
}

export interface GetClassWithSurroundingNamesReply {
  results: GetClassWithSurroundingNamesReplyResults;
}

export interface GetPropertyWithSurroundingNamesReplyResults {
  properties: WdProperty[];
  surroundingClassNames: WdClassDocsOnly[];
  surroundingPropertyNames: WdPropertyDocsOnly[];
}

export interface GetPropertyWithSurroundingNamesReply {
  results: GetPropertyWithSurroundingNamesReplyResults;
}
