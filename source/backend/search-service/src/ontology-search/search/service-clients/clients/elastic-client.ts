import { Client } from '@elastic/elasticsearch';
import { ServiceClient } from '../service-client.js';
import { envVars } from '../../../../enviroment.js';

const ELASTIC_CLASSES_INDEX_NAME = 'classes';
const ELASTIC_PROPERTIES_INDEX_NAME = 'properties';

export class ElasticClientWrapper extends ServiceClient {
  public readonly es: Client;
  public readonly classesIndex: string;
  public readonly propertiesIndex: string;

  constructor(endpoint: string, classesIndex: string, propertiesIndex: string) {
    super(endpoint);
    this.es = new Client({
      node: endpoint,
    });
    this.classesIndex = classesIndex;
    this.propertiesIndex = propertiesIndex;
  }
}

export const elasticClient = new ElasticClientWrapper(
  envVars.ES_NODE,
  ELASTIC_CLASSES_INDEX_NAME,
  ELASTIC_PROPERTIES_INDEX_NAME,
);
