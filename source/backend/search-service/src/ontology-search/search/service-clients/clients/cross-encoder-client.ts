import { envVars } from '../../../../enviroment.js';
import type { EntityId } from '../../../ontology-context/entities/common.js';
import { ServiceClient, type ServiceOutput } from '../service-client.js';

export interface CrossEncoderRerankerInput {
  query: string;
  sentences: string[];
  ids: EntityId[];
}

export interface CrossEncoderRerankerScoreItem {
  id: EntityId;
  score: number;
}

export class CrossEncoderRerankerClient extends ServiceClient {
  async rerank(
    input: CrossEncoderRerankerInput,
  ): Promise<ServiceOutput<CrossEncoderRerankerScoreItem[]>> {
    return await this.postToService<CrossEncoderRerankerInput, CrossEncoderRerankerScoreItem[]>(
      input,
    );
  }
}

export const crossEncoderClient = new CrossEncoderRerankerClient(envVars.CROSS_RERANKER_NODE);
