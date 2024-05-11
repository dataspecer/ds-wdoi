import { envVars } from './enviroment.js';
import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import loadOntology from './ontology/expose-to-fastify.js';
import { envToLogger, initLogger, log } from './logging/log.js';
import { ontologyRoutes } from './routes/routes-v3.js';
import fastifySensible from '@fastify/sensible';
import process from 'process';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fs from 'fs';
import closeWithGrace from 'close-with-grace';

const IS_PRODUCTION = envVars.ENVIROMENT === 'production';
const PORT = 3042;
// '0.0.0.0' needs to be set in order to work with Fastify inside Docker.
// Otherwise defaults to localhost during development."
const HOST: string | undefined = IS_PRODUCTION ? '0.0.0.0' : '127.0.0.1';

const fastify: FastifyInstance = Fastify({
  logger: envToLogger[envVars.ENVIROMENT] ?? true,
  pluginTimeout: 0,
});

const startFastify = async (): Promise<void> => {
  initLogger(fastify);
  // Loading ontology into a memory.
  void fastify.register(loadOntology);
  // Set up swagger dynamic generation.
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
  // Set up swagger docs (generated above) serving via static pages.
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
  // A set of utility functions for easier work with fastify (e.g. a set of route errors).
  void fastify.register(fastifySensible);
  void fastify.register(ontologyRoutes, { prefix: 'api/v3' });
  try {
    await fastify.ready();
    if (!IS_PRODUCTION) {
      fs.writeFileSync('./swagger.yaml', fastify.swagger({ yaml: true }));
    }
    log(process.memoryUsage());
    await fastify.listen({
      port: PORT,
      host: HOST,
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

closeWithGrace(async ({ signal, err, manual }) => {
  if (err != null) {
    fastify.log.error(err);
  }
  fastify.log.info(`Received ${signal}. Closing...`);
  await fastify.close();
});

void startFastify();
