import { type FastifyPluginCallback } from 'fastify';
import { getEntityInputParamsSchema, type GetEntityInputParamsType, surroundingsWithRecsReplySchema } from './schemas/req-resp-schemas';
import { type EntityId } from '../ontology/entities/common';
import { type WdClass } from '../ontology/entities/wd-class';

export const ontologyRecsRoutes: FastifyPluginCallback = function (fastify, opts, done) {
  const validateIdExistence = (id: EntityId): void | never => {
    if (!fastify.wdOntology.containsClass(id)) {
      throw fastify.httpErrors.notFound();
    }
  };

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
      validateIdExistence(id);
      const cls = fastify.wdOntology.getClass(id) as WdClass;
      const results = fastify.wdOntology.getSurroundingsWithRecs(cls);
      return { results };
    },
  );

  done();
};
