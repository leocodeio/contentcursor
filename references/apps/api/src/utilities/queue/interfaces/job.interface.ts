export interface Job<T = any> {
  id: string;
  type: string;
  data: T;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  error?: string;
  status: JobStatus;
}

export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  RETRYING = 'retrying',
}

export interface JobOptions {
  maxAttempts?: number;
  delay?: number;
  priority?: number;
}

export interface JobProcessor<T = any> {
  process(job: Job<T>): Promise<any>;
}

export interface QueueOptions {
  concurrency?: number;
  defaultJobOptions?: JobOptions;
  retryDelay?: number;
}
