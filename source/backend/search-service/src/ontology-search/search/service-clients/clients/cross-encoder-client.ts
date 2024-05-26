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

export const CROSS_ENCODER_MAX_SENTENCES: number = 30;

export class CrossEncoderRerankerClient extends ServiceClient {
  protected sliceInputInPlace(input: CrossEncoderRerankerInput): void {
    input.ids = input.ids.slice(0, CROSS_ENCODER_MAX_SENTENCES);
    input.sentences = input.sentences.slice(0, CROSS_ENCODER_MAX_SENTENCES);
  }

  async rerank(
    input: CrossEncoderRerankerInput,
  ): Promise<ServiceOutput<CrossEncoderRerankerScoreItem[]>> {
    this.sliceInputInPlace(input);
    return await this.postToService<CrossEncoderRerankerInput, CrossEncoderRerankerScoreItem[]>(
      input,
    );
  }
}

export const crossEncoderClient = new CrossEncoderRerankerClient(envVars.CROSS_RERANKER_NODE);
