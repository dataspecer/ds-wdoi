import fp from 'fastify-plugin';
import { type FastifyPluginAsync } from 'fastify';
import { envVars } from '../enviroment.js';
import { WdOntologySearch } from './ontology-search.js';

const fastifyPluginLoadOntology: FastifyPluginAsync = async function (fastify) {
  const wdOntologySearch = await WdOntologySearch.create(
    envVars.CLASSES_PATH,
    envVars.PROPERTIES_PATH,
  );
  fastify.decorate('wdOntologySearch', wdOntologySearch);
};

export default fp(fastifyPluginLoadOntology);
