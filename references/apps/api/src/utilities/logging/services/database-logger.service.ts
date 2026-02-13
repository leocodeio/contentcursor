import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ILogEntry } from '../utils/log-entry.interface';

@Injectable()
export class DatabaseLoggerService {
  constructor(private readonly prisma: PrismaService) {}

  async saveLog(logEntry: ILogEntry): Promise<void> {
    try {
      // Destructure to remove timestamp and createdAt since Prisma handles createdAt automatically
      const { timestamp, createdAt, ...logData } = logEntry as any;

      await this.prisma.logEntry.create({
        data: {
          ...logData,
          message:
            typeof logData.message === 'string'
              ? logData.message
              : JSON.stringify(logData.message),
          // Don't stringify metadata, context, error - let Prisma handle Json type
          metadata: logData.metadata || null,
          context: logData.context || null,
          error: logData.error || null,
        },
      });
    } catch (error) {
      console.error('Failed to save log to database:', error);
    }
  }
}
