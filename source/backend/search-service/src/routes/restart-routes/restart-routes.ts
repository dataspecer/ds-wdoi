import { type FastifyPluginCallback } from 'fastify';
import { envVars } from '../../enviroment.js';
import {
  type GetRestartQueryStringType,
  getRestartInputQueryStringSchema,
  getRestartReplySchema,
} from './schemas/get-restart.js';

const RESTART_KEY = envVars.RESTART_KEY;

export const restartRoutes: FastifyPluginCallback = function (fastify, opts, done) {
  fastify.get<{ Querystring: GetRestartQueryStringType }>(
    '/restart',
    {
      schema: {
        querystring: getRestartInputQueryStringSchema,
        response: {
          '2xx': getRestartReplySchema,
          '4xx': { $ref: 'HttpError' },
        },
      },
    },
    async (req, res) => {
      const { restartKey } = req.query;
      if (restartKey !== RESTART_KEY) {
        return fastify.httpErrors.unauthorized();
      } else {
        await fastify.restart();
        return { ok: 'True' };
      }
    },
  );

  done();
};
