import { QdrantClient } from '@qdrant/qdrant-js';
import { ServiceClient } from '../service-client.js';
import { envVars } from '../../../../enviroment.js';

export class QdrantClientWrapper extends ServiceClient {
  public readonly qc: QdrantClient;

  constructor(endpoint: string) {
    super(endpoint);
    this.qc = new QdrantClient({ url: endpoint });
  }
}

export const qdrantClient = new QdrantClientWrapper(envVars.QDRANT_NODE);
