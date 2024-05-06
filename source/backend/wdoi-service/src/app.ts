import { envVars } from './enviroment.js';
import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import mapAllRoutes from '@fastify/routes';
import loadOntology from './ontology/expose-to-fastify.js';
import { envToLogger, initLogger, log } from './logging/log.js';
import { ontologyRoutes } from './routes/routes-v3.js';
import fastifySensible from '@fastify/sensible';
import process from 'process';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fs from 'fs';

const fastify: FastifyInstance = Fastify({
  // Be careful about writing to a file, since there no permissions for writing in the docker image.
  logger: envToLogger[envVars.ENVIROMENT] ?? true,
  pluginTimeout: 0,
});

const startFastify = async (): Promise<void> => {
  initLogger(fastify);
  void fastify.register(loadOntology);
  void fastify.register(fastifySwagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Wikidata ontology API service',
        description: 'An API for browsing Wikidata ontology.',
        version: '0.1.0',
      },
      servers: [
        {
          url: 'http://127.0.0.1:3042',
          description: 'Development or Production server',
        },
      ],
      externalDocs: {
        url: 'https://github.com/dataspecer/ds-wdoi/tree/main/source',
        description: 'Find more info here.',
      },
    },
  });
  void fastify.register(fastifySwaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false,
    },
    uiHooks: {
      onRequest: function (request, reply, next) {
        next();
      },
      preHandler: function (request, reply, next) {
        next();
      },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, request, reply) => {
      return swaggerObject;
    },
    transformSpecificationClone: true,
  });
  void fastify.register(cors, {
    origin: '*',
    methods: ['GET'],
  });
  void fastify.register(mapAllRoutes);
  void fastify.register(fastifySensible);
  void fastify.register(ontologyRoutes, { prefix: 'api/v3' });
  try {
    await fastify.ready();
    log(fastify.routes);
    if (envVars.ENVIROMENT !== 'production') {
      // Will fail if running in docker image, since there are no write permissions.
      fs.writeFileSync('./swagger.yaml', fastify.swagger({ yaml: true }));
    }
    log(process.memoryUsage());
    await fastify.listen({
      port: 3042,
      // This needs to be set in order to work with Docker
      host: '0.0.0.0',
    });
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
