import { type EntityIdsList } from '../../entities/common.js';

export abstract class Searcher {
  public abstract searchClasses(query: string): Promise<EntityIdsList>;

  public abstract searchProperties(query: string): Promise<EntityIdsList>;

  protected interleaveArrays(arr: any[][]): any[] {
    return Array.from(
      {
        length: Math.max(...arr.map((o) => o.length)),
      },
      (_, i) => arr.map((r) => r[i] ?? null),
    ).flat();
  }
}
