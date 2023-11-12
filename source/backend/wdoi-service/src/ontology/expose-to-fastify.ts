import fp from 'fastify-plugin';
import { type FastifyPluginAsync } from 'fastify';
import { WdOntology } from './wd-ontology';
import { ES_NODE } from './elastic-search/config';

const fastifyPluginLoadOntology: FastifyPluginAsync = async function (fastify) {
  const wdOntology = await WdOntology.create(
    'c:/AAA/ds-wdoi/source/preprocessing/classes-final.json',
    'c:/AAA/ds-wdoi/source/preprocessing/properties-final.json',
    ES_NODE,
  );
  fastify.decorate('wdOntology', wdOntology);
};

export default fp(fastifyPluginLoadOntology);
