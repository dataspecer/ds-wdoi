import { logError } from '../../../logging/log.js';

export interface ServiceOutput<T> {
  error: boolean;
  results?: T;
}

export interface ServiceResponse<T> {
  results: T;
}

export abstract class ServiceClient {
  protected readonly endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  private async fetchPostJson<IN, OUT>(data: IN): Promise<ServiceResponse<OUT> | never> {
    return (await (
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
    ).json()) as ServiceResponse<OUT>;
  }

  protected async postToService<IN, OUT>(data: IN): Promise<ServiceOutput<OUT>> {
    try {
      const response = await this.fetchPostJson<IN, OUT>(data);
      return {
        results: response.results,
        error: false,
      };
    } catch (_) {
      logError('Failed to use cross-encoder.');
      return {
        error: true,
      };
    }
  }
}
