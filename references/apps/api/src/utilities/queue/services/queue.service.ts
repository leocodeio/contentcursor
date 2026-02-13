import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { randomUUID } from 'crypto';
import {
  Job,
  JobStatus,
  JobOptions,
  JobProcessor,
  QueueOptions,
} from '../interfaces/job.interface';

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private client: Redis;
  private isConnected = false;
  private processors = new Map<string, JobProcessor>();
  private processingJobs = new Set<string>();
  private options: QueueOptions;

  constructor(private configService: ConfigService) {
    this.options = {
      concurrency: 5,
      defaultJobOptions: {
        maxAttempts: 3,
        delay: 0,
        priority: 0,
      },
      retryDelay: 5000,
    };
  }

  async onModuleInit() {
    try {
      this.client = new Redis({
        host: this.configService.get<string>('REDIS_HOST', 'localhost'),
        port: this.configService.get<number>('REDIS_PORT', 6379),
        password: this.configService.get<string>('REDIS_PASSWORD'),
        db: this.configService.get<number>('REDIS_DB', 0),
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });

      this.client.on('error', (error: Error) => {
        this.logger.error('Redis Client Error:', error);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        this.logger.log('Redis Client Connected');
        this.isConnected = true;
      });

      await this.client.connect();
      this.startProcessing();
    } catch (error) {
      this.logger.error('Failed to initialize Redis client:', error);
    }
  }

  async onModuleDestroy() {
    if (this.client && this.isConnected) {
      this.client.disconnect();
    }
  }

  private ensureConnection(): boolean {
    if (!this.client || !this.isConnected) {
      this.logger.warn('Redis client is not connected');
      return false;
    }
    return true;
  }

  registerProcessor<T>(jobType: string, processor: JobProcessor<T>): void {
    this.processors.set(jobType, processor);
    this.logger.log(`Registered processor for job type: ${jobType}`);
  }

  async addJob<T>(
    jobType: string,
    data: T,
    options?: JobOptions,
  ): Promise<Job<T>> {
    if (!this.ensureConnection()) {
      throw new Error('Queue service is not connected');
    }

    const jobOptions = { ...this.options.defaultJobOptions, ...options };
    const job: Job<T> = {
      id: randomUUID(),
      type: jobType,
      data,
      attempts: 0,
      maxAttempts: jobOptions.maxAttempts!,
      createdAt: new Date(),
      status: JobStatus.PENDING,
    };

    try {
      // Store job data
      await this.client.set(
        `job:${job.id}`,
        JSON.stringify(job),
        'EX',
        60 * 60 * 24, // 24 hours TTL
      );

      // Add to processing queue with priority
      const score =
        Date.now() +
        (jobOptions.delay || 0) -
        (jobOptions.priority || 0) * 1000;
      await this.client.zadd('jobs:pending', score, job.id);

      this.logger.log(`Added job ${job.id} of type ${jobType} to queue`);
      return job;
    } catch (error) {
      this.logger.error(`Error adding job to queue:`, error);
      throw error;
    }
  }

  async getJob(jobId: string): Promise<Job | null> {
    if (!this.ensureConnection()) return null;

    try {
      const jobData = await this.client.get(`job:${jobId}`);
      if (!jobData) return null;

      return JSON.parse(jobData);
    } catch (error) {
      this.logger.error(`Error getting job ${jobId}:`, error);
      return null;
    }
  }

  async updateJobStatus(
    jobId: string,
    status: JobStatus,
    error?: string,
  ): Promise<void> {
    if (!this.ensureConnection()) return;

    try {
      const jobData = await this.client.get(`job:${jobId}`);
      if (!jobData) return;

      const job = JSON.parse(jobData);
      job.status = status;

      if (status === JobStatus.PROCESSING) {
        job.processedAt = new Date();
      } else if (status === JobStatus.COMPLETED) {
        job.completedAt = new Date();
      } else if (status === JobStatus.FAILED) {
        job.failedAt = new Date();
        job.error = error;
      }

      await this.client.set(
        `job:${jobId}`,
        JSON.stringify(job),
        'EX',
        60 * 60 * 24, // 24 hours TTL
      );

      this.logger.log(`Updated job ${jobId} status to ${status}`);
    } catch (error) {
      this.logger.error(`Error updating job status:`, error);
    }
  }

  private async startProcessing(): Promise<void> {
    if (!this.ensureConnection()) return;

    setInterval(async () => {
      if (this.processingJobs.size >= this.options.concurrency!) return;

      try {
        // Get next job from queue
        const result = await this.client.zpopmin('jobs:pending', 1);
        if (!result || result.length === 0) return;

        const jobId = result[0];
        const job = await this.getJob(jobId);

        if (!job) return;

        // Check if job should be processed now
        if (
          Date.now() <
          new Date(job.createdAt).getTime() +
            job.attempts * this.options.retryDelay!
        ) {
          // Re-queue job with delay
          await this.client.zadd(
            'jobs:pending',
            Date.now() + this.options.retryDelay!,
            jobId,
          );
          return;
        }

        this.processJob(job);
      } catch (error) {
        this.logger.error('Error in job processing loop:', error);
      }
    }, 1000); // Check every second
  }

  private async processJob(job: Job): Promise<void> {
    const processor = this.processors.get(job.type);
    if (!processor) {
      this.logger.warn(`No processor found for job type: ${job.type}`);
      return;
    }

    this.processingJobs.add(job.id);
    await this.updateJobStatus(job.id, JobStatus.PROCESSING);

    try {
      await processor.process(job);
      await this.updateJobStatus(job.id, JobStatus.COMPLETED);
      this.logger.log(`Job ${job.id} completed successfully`);
    } catch (error) {
      job.attempts++;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      if (job.attempts >= job.maxAttempts) {
        await this.updateJobStatus(job.id, JobStatus.FAILED, errorMessage);
        this.logger.error(
          `Job ${job.id} failed permanently after ${job.attempts} attempts:`,
          error,
        );
      } else {
        await this.updateJobStatus(job.id, JobStatus.RETRYING, errorMessage);
        // Re-queue for retry
        const delay = Date.now() + this.options.retryDelay!;
        await this.client.zadd('jobs:pending', delay, job.id);
        this.logger.warn(
          `Job ${job.id} failed, retrying. Attempt ${job.attempts}/${job.maxAttempts}`,
        );
      }
    } finally {
      this.processingJobs.delete(job.id);
    }
  }

  async getQueueStats(): Promise<{
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  }> {
    if (!this.ensureConnection()) {
      return { pending: 0, processing: 0, completed: 0, failed: 0 };
    }

    try {
      const [pending] = await Promise.all([this.client.zcard('jobs:pending')]);

      return {
        pending,
        processing: this.processingJobs.size,
        completed: 0, // Would need to track these separately if needed
        failed: 0, // Would need to track these separately if needed
      };
    } catch (error) {
      this.logger.error('Error getting queue stats:', error);
      return { pending: 0, processing: 0, completed: 0, failed: 0 };
    }
  }
}
