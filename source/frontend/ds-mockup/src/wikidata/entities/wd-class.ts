import { WdEntity, EntityIdsList, ExternalOntologyMapping } from './wd-entity';

export const ROOT_CLASS_ID = 35120;

export interface WdClass extends WdEntity {
  readonly subclassOf: EntityIdsList;
  readonly children?: EntityIdsList;
  readonly instances: EntityIdsList;
  readonly propertiesForThisType: EntityIdsList;
  readonly equivalentExternalOntologyClasses: ExternalOntologyMapping;

  readonly subjectOfProperty: EntityIdsList;
  readonly valueOfProperty: EntityIdsList;
}

export type WdClassDocsOnly = Pick<WdClass, 'id' | 'iri' | 'labels' | 'descriptions'>;
