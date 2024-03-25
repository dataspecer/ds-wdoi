import { type FastifyPluginCallback } from 'fastify';
import { getEntityInputParamsSchema, type GetEntityInputParamsType } from './schemas/input-params';
import { type WdClass } from '../ontology/entities/wd-class';
import { type GetHierarchyInputQueryStringType, getHierarchyInputQueryStringSchema, hierarchyReplySchema } from './schemas/get-hierarchy';
import { type SearchInputQueryStringType, searchInputQueryStringSchema, searchReplySchema } from './schemas/get-search';
import { getSurroundingsInputQueryStringSchema, type GetSurroundingsInputQueryStringType, surroundingsReplySchema } from './schemas/get-surroundings';
import { getClassWithSurroundingNamesReplySchema } from './schemas/get-class';
import { getPropertyWithSurroundingNamesReplySchema } from './schemas/get-property';

export const ontologyRoutes: FastifyPluginCallback = function (fastify, opts, done) {
  // Search

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

  // Get class

  fastify.get<{ Params: GetEntityInputParamsType }>(
    '/classes/:id',
    {
      schema: {
        params: getEntityInputParamsSchema,
        response: {
          '2xx': getClassWithSurroundingNamesReplySchema,
        },
      },
    },
    async (req, res) => {
      const { id } = req.params;
      fastify.throwOnMissingClassId(id);
      const results = fastify.wdOntology.getClassWithSurroundingNames(id);
      return {
        results: {
          classes: [results.startClass],
          surroundingClassNames: results.surroundingClassNames,
          surroundingPropertyNames: results.surroundingPropertyNames,
        },
      };
    },
  );

  // Get property

  fastify.get<{ Params: GetEntityInputParamsType }>(
    '/properties/:id',
    {
      schema: {
        params: getEntityInputParamsSchema,
        response: {
          '2xx': getPropertyWithSurroundingNamesReplySchema,
        },
      },
    },
    async (req, res) => {
      const { id } = req.params;
      fastify.throwOnMissingPropertyId(id);
      const results = fastify.wdOntology.getPropertyWithSurroundingNames(id);
      return {
        results: {
          properties: [results.startProperty],
          surroundingClassNames: results.surroundingClassNames,
          surroundingPropertyNames: results.surroundingPropertyNames,
        },
      };
    },
  );

  // Hierarchy

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
      fastify.throwOnMissingClassId(id);
      const { part } = req.query;
      const cls = fastify.wdOntology.getClass(id) as WdClass;
      const results = fastify.wdOntology.getHierarchy(cls, part);
      return { results };
    },
  );

  // Surroundings

  fastify.get<{ Params: GetEntityInputParamsType; Querystring: GetSurroundingsInputQueryStringType }>(
    '/classes/:id/surroundings',
    {
      schema: {
        params: getEntityInputParamsSchema,
        querystring: getSurroundingsInputQueryStringSchema,
        response: {
          '2xx': surroundingsReplySchema,
        },
      },
    },
    async (req, res) => {
      const { id } = req.params;
      fastify.throwOnMissingClassId(id);
      const { part } = req.query;
      const cls = fastify.wdOntology.getClass(id) as WdClass;
      if (part === 'usage') {
        const results = fastify.wdOntology.getSurroundingsUsageStatistics(cls);
        return { results };
      } else throw fastify.httpErrors.badRequest();
    },
  );

  done();
};
