import fp from 'fastify-plugin';
import { type FastifyPluginAsync } from 'fastify';
import { WdOntology } from './wd-ontology';

const CLASSES_PATH = process.env.CLASSES_PATH ?? '';
const PROPERTIES_PATH = process.env.PROPERTIES_PATH ?? '';

const fastifyPluginLoadOntology: FastifyPluginAsync = async function (fastify) {
  const wdOntology = await WdOntology.create(CLASSES_PATH, PROPERTIES_PATH);
  fastify.decorate('wdOntology', wdOntology);
};

export default fp(fastifyPluginLoadOntology);
