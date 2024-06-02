import dotenv from 'dotenv';

dotenv.config();

export const envVars = {
  ES_NODE: process.env.ES_NODE ?? '',
  SEARCH_CLASSES_ENDPOINT: process.env.SEARCH_CLASSES_ENDPOINT ?? '',
  SEARCH_PROPERTIES_ENDPOINT: process.env.SEARCH_PROPERTIES_ENDPOINT ?? '',
  CLASSES_PATH: process.env.CLASSES_PATH ?? '',
  PROPERTIES_PATH: process.env.PROPERTIES_PATH ?? '',
  RESTART_KEY: process.env.RESTART_KEY ?? '1234567',
  ENVIROMENT: process.env.NODE_ENV ?? 'development',
};
