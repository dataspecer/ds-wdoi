import fp from 'fastify-plugin';
import { type FastifyPluginAsync } from 'fastify';
import { WdOntology } from './wd-ontology';
import { envVars } from '../enviroment';

const fastifyPluginLoadOntology: FastifyPluginAsync = async function (fastify) {
  const wdOntology = await WdOntology.create(
    envVars.CLASSES_PATH,
    envVars.PROPERTIES_PATH,
    envVars.GLOBAL_RECS_SUBJECT_PATH,
    envVars.GLOBAL_RECS_VALUE_PATH,
  );
  fastify.decorate('wdOntology', wdOntology);
};

export default fp(fastifyPluginLoadOntology);
