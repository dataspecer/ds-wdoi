import { Client } from '@elastic/elasticsearch';
import { ServiceClient } from '../service-client.js';
import { envVars } from '../../../../enviroment.js';

export class ElasticClientWrapper extends ServiceClient {
  public readonly es: Client;

  constructor(endpoint: string) {
    super(endpoint);
    this.es = new Client({
      node: endpoint,
    });
  }
}

export const elasticClient = new ElasticClientWrapper(envVars.ES_NODE);
