import { type FastifyPluginCallback } from 'fastify';
import {
  getClassPropertyDomainRangeInputParamsSchema,
  type GetClassPropertyDomainRangeInputParamsType,
  getEntityInputParamsSchema,
  type GetEntityInputParamsType,
} from './schemas/input-params';
import { type WdClass } from '../ontology/entities/wd-class';
import { type GetHierarchyInputQueryStringType, getHierarchyInputQueryStringSchema, hierarchyReplySchema } from './schemas/get-hierarchy';
import { type SearchInputQueryStringType, searchInputQueryStringSchema, searchReplySchema } from './schemas/get-search';
import { surroundingsReplySchema } from './schemas/get-surroundings';
import { getClassWithSurroundingNamesReplySchema } from './schemas/get-class';
import { getPropertyWithSurroundingNamesReplySchema } from './schemas/get-property';
import { type WdProperty } from '../ontology/entities/wd-property';
import {
  type GetClassPropertyDomainRangeInputQueryStringType,
  getClassPropertyDomainRangeReplySchema,
  getClassPropertyDomainRangeInputQueryStringSchema,
} from './schemas/get-property-domain-range';

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
      const startClass = fastify.wdOntology.getClass(id) as WdClass;
      const results = fastify.wdOntology.getClassWithSurroundingNames(startClass);
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
      const startProperty = fastify.wdOntology.getProperty(id) as WdProperty;
      const results = fastify.wdOntology.getPropertyWithSurroundingNames(startProperty);
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
      const startClass = fastify.wdOntology.getClass(id) as WdClass;
      const results = fastify.wdOntology.getHierarchy(startClass, part);
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
        },
      },
    },
    async (req, res) => {
      const { id } = req.params;
      fastify.throwOnMissingClassId(id);
      const startClass = fastify.wdOntology.getClass(id) as WdClass;
      const results = fastify.wdOntology.getSurroundingsCombinedUsageStatisticsAndConstraints(startClass);
      return { results };
    },
  );

  // Domains

  fastify.get<{ Params: GetClassPropertyDomainRangeInputParamsType; Querystring: GetClassPropertyDomainRangeInputQueryStringType }>(
    '/classes/:classId/properties/:propertyId/domains',
    {
      schema: {
        params: getClassPropertyDomainRangeInputParamsSchema,
        querystring: getClassPropertyDomainRangeInputQueryStringSchema,
        response: {
          '2xx': getClassPropertyDomainRangeReplySchema,
        },
      },
    },
    async (req, res) => {
      const { classId, propertyId } = req.params;
      const { part } = req.query;
      fastify.throwOnMissingClassId(classId);
      fastify.throwOnMissingPropertyId(propertyId);
      const startClass = fastify.wdOntology.getClass(classId) as WdClass;
      const property = fastify.wdOntology.getProperty(propertyId) as WdProperty;
      const results =
        part === 'inherited'
          ? fastify.wdOntology.getInheritedClassPropertyDomains(startClass, property)
          : fastify.wdOntology.getOwnClassPropertyDomains(startClass, property);
      return { results };
    },
  );

  // Ranges

  fastify.get<{ Params: GetClassPropertyDomainRangeInputParamsType; Querystring: GetClassPropertyDomainRangeInputQueryStringType }>(
    '/classes/:classId/properties/:propertyId/ranges',
    {
      schema: {
        params: getClassPropertyDomainRangeInputParamsSchema,
        querystring: getClassPropertyDomainRangeInputQueryStringSchema,
        response: {
          '2xx': getClassPropertyDomainRangeReplySchema,
        },
      },
    },
    async (req, res) => {
      const { classId, propertyId } = req.params;
      const { part } = req.query;
      fastify.throwOnMissingClassId(classId);
      fastify.throwOnMissingPropertyId(propertyId);
      const startClass = fastify.wdOntology.getClass(classId) as WdClass;
      const property = fastify.wdOntology.getProperty(propertyId) as WdProperty;
      const results =
        part === 'inherited'
          ? fastify.wdOntology.getInheritedClassPropertyRanges(startClass, property)
          : fastify.wdOntology.getOwnClassPropertyRanges(startClass, property);
      return { results };
    },
  );

  done();
};
