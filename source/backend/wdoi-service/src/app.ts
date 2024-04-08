import { envVars } from './enviroment.js';
import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import mapAllRoutes from '@fastify/routes';
import loadOntology from './ontology/expose-to-fastify.js';
import { envToLogger, log } from './logging/log.js';
import { ontologyRoutes } from './routes/routes-v3.js';
import fastifySensible from '@fastify/sensible';

const fastify: FastifyInstance = Fastify({
  logger: envToLogger[envVars.ENVIROMENT] ?? true,
  pluginTimeout: 0,
});

const startFastify = async (): Promise<void> => {
  void fastify.register(loadOntology);
  void fastify.register(cors, {
    origin: '*',
    methods: ['GET'],
  });
  void fastify.register(mapAllRoutes);
  void fastify.register(fastifySensible);
  void fastify.register(ontologyRoutes, { prefix: 'api/v3' });
  try {
    await fastify.listen({ port: 3042 });
    log(fastify.routes);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

process.on('uncaughtException', (error) => {
  console.error(error);
});
process.on('unhandledRejection', (error) => {
  console.error(error);
});

void startFastify();
