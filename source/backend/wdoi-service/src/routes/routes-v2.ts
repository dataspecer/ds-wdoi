import { type FastifyPluginCallback } from 'fastify';
import { getEntityInputParamsSchema, type GetEntityInputParamsType } from './schemas/input-params';
import { type WdClass } from '../ontology/entities/wd-class';
import { surroundingsWithRecsReplySchema } from './schemas/get-surroundings';
import { getClassWithSurroundingNamesReplySchema, getPropertyWithSurroundingNamesReplySchema } from './schemas/get-entity';

export const ontologyRecsRoutes: FastifyPluginCallback = function (fastify, opts, done) {
  fastify.get<{ Params: GetEntityInputParamsType }>(
    '/classes/:id/surroundings',
    {
      schema: {
        params: getEntityInputParamsSchema,
        response: {
          '2xx': surroundingsWithRecsReplySchema,
        },
      },
    },
    async (req, res) => {
      const { id } = req.params;
      fastify.throwOnMissingClassId(id);
      const cls = fastify.wdOntology.getClass(id) as WdClass;
      const results = fastify.wdOntology.getSurroundingsWithRecs(cls);
      return { results };
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
      return { results };
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
      const results = fastify.wdOntology.getClassWithSurroundingNames(id);
      return { results };
    },
  );

  done();
};
