import { type FastifyPluginCallback } from 'fastify';
import {
  getEntityInputParamsSchema,
  getHierarchyInputQueryStringSchema,
  searchInputQueryStringSchema,
  type GetEntityInputParamsType,
  type SearchInputQueryStringType,
  type GetHierarchyInputQueryStringType,
} from './request-schemas';

export const ontologyRoutes: FastifyPluginCallback = function (fastify, opts, done) {
  fastify.get<{ Querystring: SearchInputQueryStringType }>('/search', { schema: { querystring: searchInputQueryStringSchema } }, async (req, res) => {
    return { str: req.query.query };
  });

  fastify.get<{ Params: GetEntityInputParamsType }>('/classes/:id', { schema: { params: getEntityInputParamsSchema } }, async (req, res) => {
    const { id } = req.params;
    return { str: id };
  });

  fastify.get<{ Params: GetEntityInputParamsType; Querystring: GetHierarchyInputQueryStringType }>(
    '/classes/:id/hierarchy',
    { schema: { params: getEntityInputParamsSchema, querystring: getHierarchyInputQueryStringSchema } },
    async (req, res) => {
      const { direction } = req.query;
      return { str: direction };
    },
  );

  fastify.get<{ Params: GetEntityInputParamsType; Querystring: GetHierarchyInputQueryStringType }>(
    '/classes/:id/surroundings',
    { schema: { params: getEntityInputParamsSchema } },
    async (req, res) => {
      const { direction } = req.query;
      return { str: direction };
    },
  );

  fastify.get<{ Params: GetEntityInputParamsType }>('/properties/:id', { schema: { params: getEntityInputParamsSchema } }, async (req, res) => {
    const { id } = req.params;
    return { str: id };
  });

  done();
};
