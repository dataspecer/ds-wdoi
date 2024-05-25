import { envVars } from '../../../../enviroment.js';
import type { DenseVector } from '../../../ontology-context/entities/common.js';
import { ServiceClient, type ServiceOutput } from '../service-client.js';

export interface DenseEmbedInput {
  sentence: string;
}

export class DenseEmbedClient extends ServiceClient {
  async embed(input: DenseEmbedInput): Promise<ServiceOutput<DenseVector>> {
    return await this.postToService<DenseEmbedInput, DenseVector>(input);
  }
}

export const denseEmbedClient = new DenseEmbedClient(envVars.DENSE_EMBED_NODE);
