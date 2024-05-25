import type { WdOntologySearch } from '../ontology-search/ontology-search.ts';

declare module 'fastify' {
  export interface FastifyInstance {
    wdOntologySearch: WdOntologySearch;
  }
}
