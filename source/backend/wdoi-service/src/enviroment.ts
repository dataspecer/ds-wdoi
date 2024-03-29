import dotenv from 'dotenv';

dotenv.config();

export const envVars = {
  ES_NODE: process.env.ES_NODE ?? '',
  ES_PASSWD: process.env.ES_PASSWD ?? '',
  ES_CERT_PATH: process.env.ES_CERT_PATH ?? '',
  CLASSES_PATH: process.env.CLASSES_PATH ?? '',
  PROPERTIES_PATH: process.env.PROPERTIES_PATH ?? '',
  ENVIROMENT: process.env.NODE_ENV ?? 'development',
  ES_CA_FINGERPRINT: process.env.ES_CA_FINGERPRINT ?? '',
};
