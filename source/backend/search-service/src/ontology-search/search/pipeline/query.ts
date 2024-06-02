import type { EntityIdsList } from '../../ontology-context/entities/common.js';

export interface Query {
  text: string;
}

export interface ClassQuery extends Query {
  properties: EntityIdsList;
}

export interface PropertyQuery extends Query {}
