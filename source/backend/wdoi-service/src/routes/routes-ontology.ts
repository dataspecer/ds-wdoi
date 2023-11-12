import { type FastifyPluginCallback } from 'fastify';
import {
  getEntityInputParamsSchema,
  getHierarchyInputQueryStringSchema,
  searchInputQueryStringSchema,
  type GetEntityInputParamsType,
  type SearchInputQueryStringType,
  type GetHierarchyInputQueryStringType,
  searchReplySchema,
} from './request-schemas';
import { type EntityId } from '../ontology/entities/common';

export const ontologyRoutes: FastifyPluginCallback = function (fastify, opts, done) {
  const validateIdExistence = (id: EntityId): void | never => {
    if (!fastify.wdOntology.containsClass(id)) {
      throw fastify.httpErrors.notFound();
    }
  };

  fastify.get<{ Querystring: SearchInputQueryStringType }>(
    '/search',
    {
      schema: {
        querystring: searchInputQueryStringSchema,
        response: {
          '2xx': searchReplySchema,
        },
      },
    },
    async (req, res) => {
      const { query, searchClasses, searchProperties, searchInstances } = req.query;
      const searchResults = await fastify.wdOntology.search(query, searchClasses ?? true, searchProperties ?? false, searchInstances ?? false);
      return { results: searchResults };
    },
  );

  fastify.get<{ Params: GetEntityInputParamsType }>('/classes/:id', { schema: { params: getEntityInputParamsSchema } }, async (req, res) => {
    const { id } = req.params;
    validateIdExistence(id);
    return { str: id };
  });

  fastify.get<{ Params: GetEntityInputParamsType; Querystring: GetHierarchyInputQueryStringType }>(
    '/classes/:id/hierarchy',
    { schema: { params: getEntityInputParamsSchema, querystring: getHierarchyInputQueryStringSchema } },
    async (req, res) => {
      const { id } = req.params;
      validateIdExistence(id);
      const { direction } = req.query;
      return { str: direction };
    },
  );

  fastify.get<{ Params: GetEntityInputParamsType }>(
    '/classes/:id/surroundings',
    { schema: { params: getEntityInputParamsSchema } },
    async (req, res) => {
      const { id } = req.params;
      validateIdExistence(id);
      return { str: 'ahoj' };
    },
  );

  done();
};
