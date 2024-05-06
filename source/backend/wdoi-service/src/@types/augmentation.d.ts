import { type EntityId } from '../ontology/entities/common.js';
import type { WdOntology } from '../ontology/wd-ontology.js';
// eslint-disable-next-line @typescript-eslint/no-unused-vars

declare module 'fastify' {
  export interface FastifyInstance {
    wdOntology: WdOntology;
    throwOnMissingClassId: (id: EntityId) => void | never;
    throwOnMissingPropertyId: (id: EntityId) => void | never;
  }
}
