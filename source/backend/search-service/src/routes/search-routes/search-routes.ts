import type { FastifyPluginCallback } from 'fastify';
import { searchReplySchema } from './schemas/search-reply.js';
import type { SearchClassesBodyType } from './schemas/post-search-classes.js';
import type { SearchPropertiesBodyType } from './schemas/post-search-properties.js';

export const searchRoutes: FastifyPluginCallback = function (fastify, opts, done) {
  // Search

  fastify.post<{ Body: SearchClassesBodyType }>(
    '/search-classes',
    {
      schema: {
        response: {
          '2xx': searchReplySchema,
          '4xx': { $ref: 'HttpError' },
        },
      },
    },
    async (req, res) => {
      const body = req.body;
      const results = await fastify.wdOntologySearch.searchClasses(body.query, {
        candidateSelectorConfig: body.candidateSelectorConfig,
        fusionCandidateSelectorConfig: body.fusionCandidateSelectorConfig,
        rerankerConfig: body.rerankerConfig,
      });
      return { results: results ?? [] };
    },
  );

  fastify.post<{ Body: SearchPropertiesBodyType }>(
    '/search-properties',
    {
      schema: {
        response: {
          '2xx': searchReplySchema,
          '4xx': { $ref: 'HttpError' },
        },
      },
    },
    async (req, res) => {
      const body = req.body;
      const results = await fastify.wdOntologySearch.searchProperties(body.query, {
        candidateSelectorConfig: body.candidateSelectorConfig,
        fusionCandidateSelectorConfig: body.fusionCandidateSelectorConfig,
        rerankerConfig: body.rerankerConfig,
      });
      return { results: results ?? [] };
    },
  );

  done();
};
