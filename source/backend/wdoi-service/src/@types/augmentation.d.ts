import { type EntityId } from '../ontology/entities/common';
import type { WdOntology } from '../ontology/wd-ontology';

declare module 'fastify' {
  export interface FastifyInstance {
    wdOntology: WdOntology;
    throwOnMissingClassId: (id: EntityId) => void | never;
    throwOnMissingPropertyId: (id: EntityId) => void | never;
  }
}
