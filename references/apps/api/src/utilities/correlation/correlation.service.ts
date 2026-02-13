import { Injectable, Scope } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AsyncLocalStorage } from 'async_hooks';

@Injectable({ scope: Scope.DEFAULT })
export class CorrelationService {
  private readonly asyncLocalStorage: AsyncLocalStorage<string>;

  constructor() {
    this.asyncLocalStorage = new AsyncLocalStorage<string>();
  }

  getCorrelationId(): string {
    return this.asyncLocalStorage.getStore() || 'no-correlation-id';
  }

  run(correlationId: string, callback: () => any) {
    return this.asyncLocalStorage.run(correlationId, callback);
  }

  generateCorrelationId(correlationId?: string): string {
    return correlationId
      ? `${correlationId}-${Date.now()}-${randomUUID()}`
      : `${Date.now()}-${randomUUID()}`;
  }
}
