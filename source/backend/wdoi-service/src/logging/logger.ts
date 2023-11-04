import pino, { type Logger } from 'pino';
import type { EntityId } from '../ontology/entities/common';

export const CLASSES_LOG_STEP = 100_000;
export const PROPERTIES_LOG_STEP = 1_000;

const transport = pino.transport({
  targets: [
    {
      target: 'pino/file',
      level: 'info',
      options: {
        destination: './info.log',
      },
    },
    {
      target: 'pino-pretty',
      level: 'info',
      options: {},
    },
  ],
});

export const logger = pino(
  {
    level: 'info',
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  transport,
);

export function missingLog(logger: Logger, id: EntityId, classesFlag: boolean): void {
  logger.info({ missing: id, isClass: classesFlag }, `Missing class ${id} from  ${classesFlag ? 'classes' : 'properties'}`);
}

export function tryLog(logger: Logger, i: number, step: number): void {
  if (i % step === 0) {
    logger.info(i);
  }
}
