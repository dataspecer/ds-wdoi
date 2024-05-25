import { envVars } from '../../../../enviroment.js';
import type { SparseVector } from '../../../ontology-context/entities/common.js';
import { ServiceClient, type ServiceOutput } from '../service-client.js';

export interface SparseEmbedInput {
  sentence: string;
}

export class SparseEmbedClient extends ServiceClient {
  async embed(input: SparseEmbedInput): Promise<ServiceOutput<SparseVector>> {
    return await this.postToService<SparseEmbedInput, SparseVector>(input);
  }
}

export const crossEncoderClient = new SparseEmbedClient(envVars.SPARSE_EMBED_NODE);
