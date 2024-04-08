import { EntityIdsList } from './wd-entity';

export interface GeneralConstraints {
  readonly subjectTypeStats: EntityIdsList;
}

export interface ItemTypeConstraints {
  readonly valueTypeStats: EntityIdsList;
}

export type EmptyTypeConstraint = null;
