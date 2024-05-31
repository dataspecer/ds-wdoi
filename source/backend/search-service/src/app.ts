import { envVars } from './enviroment.js';
import { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { envToLogger, initLogger, log } from './logging/log.js';
import loadOntology from './ontology-search/expose-to-fastify.js';
import fastifySensible from '@fastify/sensible';
import process from 'process';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fs from 'fs';
import closeWithGrace from 'close-with-grace';
import { restartable } from '@fastify/restartable';
import { restartRoutes } from './routes/restart-routes/restart-routes.js';
import { searchRoutes } from './routes/search-routes/search-routes.js';

const IS_PRODUCTION = envVars.ENVIROMENT === 'production';
const PORT = 3062;
// '0.0.0.0' needs to be set in order to work with Fastify inside Docker.
// Otherwise defaults to localhost during development."
const HOST: string | undefined = IS_PRODUCTION ? '0.0.0.0' : '127.0.0.1';

// Create fastify instance that is able to restart itself.
const fastify = await restartable(
  async function (fastify, ops) {
    const app = await fastify(ops);

    initLogger(app);
    // Loading ontology into a memory.
    void app.register(loadOntology);
    // Set up swagger dynamic generation.
    void app.register(fastifySwagger, {
      openapi: {
        openapi: '3.0.0',
        info: {
          title: 'The Wikidata Ontology Search Service',
          description: 'An API for searching the Wikidata ontology.',
          version: '0.1.0',
        },
        servers: [
          {
            url: 'http://127.0.0.1:3062',
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
    void app.register(fastifySwaggerUi, {
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
    void app.register(cors, {
      origin: '*',
      methods: ['GET'],
    });
    // A set of utility functions for easier work with fastify (e.g. a set of route errors).
    void app.register(fastifySensible, { sharedSchemaId: 'HttpError' });
    void app.register(restartRoutes);
    void app.register(searchRoutes);

    return app;
  },
  {
    logger: envToLogger[envVars.ENVIROMENT] ?? true,
    pluginTimeout: 0,
  },
);

const startFastify = async (app: FastifyInstance): Promise<void> => {
  try {
    await app.ready();
    if (!IS_PRODUCTION) {
      fs.writeFileSync('./swagger.yaml', fastify.swagger({ yaml: true }));
    }
    log(process.memoryUsage());
    await app.listen({
      port: PORT,
      host: HOST,
    });
  } catch (e) {
    app.log.error(e);
    process.exit(1);
  }
};

closeWithGrace(async ({ signal, err, manual }) => {
  if (err != null) {
    fastify.log.error(err);
  }
  if (signal != null) {
    fastify.log.info(`Received ${signal}`);
  }
  fastify.log.info('Closing ... ');
  await fastify.close();
});

void startFastify(fastify);
