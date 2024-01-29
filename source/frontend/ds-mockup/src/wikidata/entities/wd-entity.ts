import { WdClassDocsOnly } from './wd-class';
import { WdProperty, WdPropertyDocsOnly } from './wd-property';

export type LanguageMap = Record<string, string>;

export type LanugageArrayMap = Record<string, string[]>;

export type EntityId = number;
export type EntityIri = string;
export type EntityIdsList = readonly EntityId[];
export type EntityIriList = readonly EntityIri[];

export type ExternalEntityId = string;
export type ExternalOntologyMapping = readonly ExternalEntityId[];

export interface WdEntity {
  readonly id: EntityId;
  readonly iri: string;
  readonly labels: LanguageMap;
  readonly descriptions: LanguageMap;
  readonly instanceOf: EntityIdsList;
}

export function isEntityPropertyDocs(entity: WdEntityDocsOnly): entity is WdPropertyDocsOnly {
  return 'datatype' in entity;
}

export function isEntityClassDocs(entity: WdEntityDocsOnly): entity is WdClassDocsOnly {
  return !('datatype' in entity);
}

export type WdEntityDocsOnly = Pick<WdEntity, 'id' | 'iri' | 'labels' | 'descriptions'>;
