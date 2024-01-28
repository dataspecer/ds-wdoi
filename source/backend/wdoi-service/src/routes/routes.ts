import { type FastifyPluginCallback } from 'fastify';
import {
  getEntityInputParamsSchema,
  getHierarchyInputQueryStringSchema,
  searchInputQueryStringSchema,
  searchReplySchema,
  getClassReplySchema,
  type GetEntityInputParamsType,
  type SearchInputQueryStringType,
  type GetHierarchyInputQueryStringType,
  hierarchyReplySchema,
  surroundingsReplySchema,
} from './schemas/req-resp-schemas';
import { type EntityId } from '../ontology/entities/common';
import { type WdClass } from '../ontology/entities/wd-class';

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
      const { query, searchClasses, searchProperties, searchInstances, languagePriority } = req.query;
      const searchResults = await fastify.wdOntology.search(query, searchClasses, searchProperties, searchInstances, languagePriority);
      return { results: { classes: searchResults.classes, properties: searchResults.properties } };
    },
  );

  fastify.get<{ Params: GetEntityInputParamsType }>(
    '/classes/:id',
    {
      schema: {
        params: getEntityInputParamsSchema,
        response: {
          '2xx': getClassReplySchema,
        },
      },
    },
    async (req, res) => {
      const { id } = req.params;
      validateIdExistence(id);
      const cls = fastify.wdOntology.getClass(id);
      const clsReturn = cls != null ? [cls] : [];
      return { results: { classes: clsReturn } };
    },
  );

  fastify.get<{ Params: GetEntityInputParamsType; Querystring: GetHierarchyInputQueryStringType }>(
    '/classes/:id/hierarchy',
    {
      schema: {
        params: getEntityInputParamsSchema,
        querystring: getHierarchyInputQueryStringSchema,
        response: {
          '2xx': hierarchyReplySchema,
        },
      },
    },
    async (req, res) => {
      const { id } = req.params;
      validateIdExistence(id);
      const { part } = req.query;
      const cls = fastify.wdOntology.getClass(id) as WdClass;
      const results = fastify.wdOntology.getHierarchy(cls, part);
      return { results };
    },
  );

  fastify.get<{ Params: GetEntityInputParamsType }>(
    '/classes/:id/surroundings',
    {
      schema: {
        params: getEntityInputParamsSchema,
        response: {
          '2xx': surroundingsReplySchema,
        },
      },
    },
    async (req, res) => {
      const { id } = req.params;
      validateIdExistence(id);
      const cls = fastify.wdOntology.getClass(id) as WdClass;
      const results = fastify.wdOntology.getSurroundings(cls);
      return { results };
    },
  );

  done();
};
