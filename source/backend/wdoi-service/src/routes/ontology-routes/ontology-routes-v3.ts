import { type FastifyPluginCallback } from 'fastify';
import {
  getEntityInputParamsSchema,
  type GetEntityInputParamsType,
  type GetClassPropertyEndpointsInputParamsType,
  getClassPropertyEndpointsInputParamsSchema,
} from './schemas/input-params.js';
import { type WdClass } from '../../ontology/entities/wd-class.js';
import {
  type GetClassHierarchyInputQueryStringType,
  classHierarchyReplySchema,
  getClassHierarchyInputQueryStringSchema,
} from './schemas/get-class-hierarchy.js';
import {
  type SearchInputQueryStringType,
  searchInputQueryStringSchema,
  searchReplySchema,
} from './schemas/get-search.js';
import { surroundingsReplySchema } from './schemas/get-class-surroundings.js';
import { getClassWithSurroundingDescReplySchema } from './schemas/get-class.js';
import { getPropertyWithSurroundingDescReplySchema } from './schemas/get-property.js';
import { type WdProperty } from '../../ontology/entities/wd-property.js';
import {
  type GetClassPropertyEndpointsInputQueryStringType,
  getClassPropertyEndpointsInputQueryStringSchema,
  getClassPropertyEndpointsReplySchema,
} from './schemas/get-class-property-endpoints.js';
import {
  type GetFilterBySchemaQueryStringType,
  getFilterByInstanceReplySchema,
  getFilterBySchemaQueryStringSchema,
} from './schemas/get-filter-by-instance.js';

export const ontologyRoutes: FastifyPluginCallback = function (fastify, opts, done) {
  // Search

  fastify.get<{ Querystring: SearchInputQueryStringType }>(
    '/search',
    {
      schema: {
        querystring: searchInputQueryStringSchema,
        response: {
          '2xx': searchReplySchema,
          '4xx': { $ref: 'HttpError' },
        },
      },
    },
    async (req, res) => {
      const { query, searchClasses, searchProperties } = req.query;
      const searchResults = await fastify.wdOntology.search(query, searchClasses, searchProperties);
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
          '2xx': getClassWithSurroundingDescReplySchema,
          '4xx': { $ref: 'HttpError' },
        },
      },
    },
    async (req, res) => {
      const { id } = req.params;
      fastify.throwOnMissingClassId(id);
      const startClass = fastify.wdOntology.getClass(id) as WdClass;
      const results = fastify.wdOntology.getClassWithSurroundingDesc(startClass);
      return {
        results: {
          class: results.startClass,
          surroundingClassesDesc: results.surroundingClassesDesc,
          surroundingPropertiesDesc: results.surroundingPropertiesDesc,
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
          '2xx': getPropertyWithSurroundingDescReplySchema,
          '4xx': { $ref: 'HttpError' },
        },
      },
    },
    async (req, res) => {
      const { id } = req.params;
      fastify.throwOnMissingPropertyId(id);
      const startProperty = fastify.wdOntology.getProperty(id) as WdProperty;
      const results = fastify.wdOntology.getPropertyWithSurroundingDesc(startProperty);
      return {
        results: {
          property: results.startProperty,
          surroundingClassesDesc: results.surroundingClassesDesc,
          surroundingPropertiesDesc: results.surroundingPropertiesDesc,
        },
      };
    },
  );

  // Hierarchy

  fastify.get<{
    Params: GetEntityInputParamsType;
    Querystring: GetClassHierarchyInputQueryStringType;
  }>(
    '/classes/:id/hierarchy',
    {
      schema: {
        params: getEntityInputParamsSchema,
        querystring: getClassHierarchyInputQueryStringSchema,
        response: {
          '2xx': classHierarchyReplySchema,
          '4xx': { $ref: 'HttpError' },
        },
      },
    },
    async (req, res) => {
      const { id } = req.params;
      fastify.throwOnMissingClassId(id);
      const { part } = req.query;
      const startClass = fastify.wdOntology.getClass(id) as WdClass;
      const results = fastify.wdOntology.getClassHierarchy(startClass, part);
      return { results };
    },
  );

  // Surroundings

  fastify.get<{ Params: GetEntityInputParamsType }>(
    '/classes/:id/surroundings',
    {
      schema: {
        params: getEntityInputParamsSchema,
        response: {
          '2xx': surroundingsReplySchema,
          '4xx': { $ref: 'HttpError' },
        },
      },
    },
    async (req, res) => {
      const { id } = req.params;
      fastify.throwOnMissingClassId(id);
      const startClass = fastify.wdOntology.getClass(id) as WdClass;
      const results =
        fastify.wdOntology.getClassSurroundingsCombinedUsageStatisticsAndConstraints(startClass);
      return { results };
    },
  );

  // Domains

  fastify.get<{
    Params: GetClassPropertyEndpointsInputParamsType;
    Querystring: GetClassPropertyEndpointsInputQueryStringType;
  }>(
    '/classes/:classId/properties/:propertyId/domains',
    {
      schema: {
        params: getClassPropertyEndpointsInputParamsSchema,
        querystring: getClassPropertyEndpointsInputQueryStringSchema,
        response: {
          '2xx': getClassPropertyEndpointsReplySchema,
          '4xx': { $ref: 'HttpError' },
        },
      },
    },
    async (req, res) => {
      const { classId, propertyId } = req.params;
      const { order } = req.query;
      fastify.throwOnMissingClassId(classId);
      fastify.throwOnMissingPropertyId(propertyId);
      const startClass = fastify.wdOntology.getClass(classId) as WdClass;
      const property = fastify.wdOntology.getProperty(propertyId) as WdProperty;
      const results =
        order === 'inherit'
          ? fastify.wdOntology.getClassPropertyDomainsInheritOrder(startClass, property)
          : fastify.wdOntology.getClassPropertyDomainsBaseOrder(startClass, property);
      return { results };
    },
  );

  // Ranges

  fastify.get<{
    Params: GetClassPropertyEndpointsInputParamsType;
    Querystring: GetClassPropertyEndpointsInputQueryStringType;
  }>(
    '/classes/:classId/properties/:propertyId/ranges',
    {
      schema: {
        params: getClassPropertyEndpointsInputParamsSchema,
        querystring: getClassPropertyEndpointsInputQueryStringSchema,
        response: {
          '2xx': getClassPropertyEndpointsReplySchema,
          '4xx': { $ref: 'HttpError' },
        },
      },
    },
    async (req, res) => {
      const { classId, propertyId } = req.params;
      const { order } = req.query;
      fastify.throwOnMissingClassId(classId);
      fastify.throwOnMissingPropertyId(propertyId);
      const startClass = fastify.wdOntology.getClass(classId) as WdClass;
      const property = fastify.wdOntology.getProperty(propertyId) as WdProperty;
      const results =
        order === 'inherit'
          ? fastify.wdOntology.getClassPropertyRangesInheritOrder(startClass, property)
          : fastify.wdOntology.getClassPropertyRangesBaseOrder(startClass, property);
      return { results };
    },
  );

  // Filter by instance

  fastify.get<{ Querystring: GetFilterBySchemaQueryStringType }>(
    '/filter-by-instance',
    {
      schema: {
        querystring: getFilterBySchemaQueryStringSchema,
        response: {
          '2xx': getFilterByInstanceReplySchema,
          '4xx': { $ref: 'HttpError' },
        },
      },
    },
    async (req, res) => {
      const { url } = req.query;
      const results = await fastify.wdOntology.getFilterByInstance(url);
      return { results };
    },
  );

  done();
};
