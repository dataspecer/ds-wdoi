import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import fastifyRoutes from '@fastify/routes';
import loadOntology from './ontology/expose-to-fastify';
import type { WdOntology } from './ontology/wd-ontology';

declare module 'fastify' {
  export interface FastifyInstance {
    wdOntology: WdOntology;
  }
}

const enviroment = process.env.NODE_ENV ?? 'development';
const envToLogger: any = {
  development: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
  production: true,
  test: false,
};

const fastify: FastifyInstance = Fastify({
  logger: envToLogger[enviroment] ?? true,
  pluginTimeout: 0,
});

const startFastify = async (): Promise<void> => {
  void fastify.register(loadOntology);
  void fastify.register(cors, {
    origin: '*',
    methods: ['GET'],
  });
  void fastify.register(fastifyRoutes);
  try {
    await fastify.listen({ port: 3000 });
    console.log(fastify.routes);
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
