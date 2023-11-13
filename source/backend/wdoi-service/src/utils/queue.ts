export class Queue<T> {
  // We are using a map, since we want to avoid the O(n) on shifting the start.
  private readonly elements: Map<number, T>;
  private head: number;
  private tail: number;

  constructor() {
    this.elements = new Map<number, T>();
    this.head = 0;
    this.tail = 0;
  }

  enqueue(element: T): void {
    this.elements.set(this.tail, element);
    this.tail++;
  }

  dequeue(): T {
    const item = this.elements.get(this.head) as T;
    this.elements.delete(this.head);
    this.head++;
    return item;
  }

  get length(): number {
    return this.tail - this.head;
  }

  isEmpty(): boolean {
    return this.length === 0;
  }
}
