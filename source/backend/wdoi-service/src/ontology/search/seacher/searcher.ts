import { type EntityIdsList } from '../../entities/common.js';

export abstract class Searcher {
  protected readonly defaultLanguagePriority: string;

  constructor(defaultLanguagePriority: string) {
    this.defaultLanguagePriority = defaultLanguagePriority;
  }

  public abstract searchClasses(
    query: string,
    languagePriority: string | undefined,
  ): Promise<EntityIdsList>;

  public abstract searchProperties(
    query: string,
    languagePriority: string | undefined,
  ): Promise<EntityIdsList>;

  protected interleaveArrays(arr: any[][]): any[] {
    return Array.from(
      {
        length: Math.max(...arr.map((o) => o.length)),
      },
      (_, i) => arr.map((r) => r[i] ?? null),
    ).flat();
  }
}
