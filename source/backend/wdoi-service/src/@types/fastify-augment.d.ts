import type { WdOntology } from '../ontology/wd-ontology';

declare module 'fastify' {
  export interface FastifyInstance {
    wdOntology: WdOntology;
  }
}
