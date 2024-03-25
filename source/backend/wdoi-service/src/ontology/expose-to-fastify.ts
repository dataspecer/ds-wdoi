import fp from 'fastify-plugin';
import { type FastifyPluginAsync } from 'fastify';
import { WdOntology } from './wd-ontology';
import { envVars } from '../enviroment';
import { type EntityId } from './entities/common';

const fastifyPluginLoadOntology: FastifyPluginAsync = async function (fastify) {
  const wdOntology = await WdOntology.create(envVars.CLASSES_PATH, envVars.PROPERTIES_PATH);
  fastify.decorate('wdOntology', wdOntology);

  fastify.decorate('throwOnMissingClassId', (id: EntityId): void | never => {
    if (!fastify.wdOntology.containsClass(id)) {
      throw fastify.httpErrors.notFound();
    }
  });

  fastify.decorate('throwOnMissingPropertyId', (id: EntityId): void | never => {
    if (!fastify.wdOntology.containsProperty(id)) {
      throw fastify.httpErrors.notFound();
    }
  });
};

export default fp(fastifyPluginLoadOntology);
