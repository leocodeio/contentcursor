// utils/logging/logging.module.ts
import {
  DynamicModule,
  Module,
  MiddlewareConsumer,
  NestModule,
} from '@nestjs/common';
import { LoggerService } from './services/logger.service';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { ConfigModule } from '@nestjs/config';
import { DebugUtil } from './utils/debug.util';
import { CorrelationService } from '../correlation/correlation.service';
import { CorrelationMiddleware } from '../correlation/correlation.middleware';
import { DatabaseLoggerService } from './services/database-logger.service';
import { LoggingModuleOptions } from './utils/logging-options.interface';
import * as Joi from 'joi';
import { PrismaService } from '../database/prisma.service';

@Module({
  imports: [ConfigModule],
  providers: [CorrelationService],
  exports: [CorrelationService],
})
export class LoggingModule implements NestModule {
  static forRoot(options: LoggingModuleOptions): DynamicModule {
    const winstonTransports: winston.transport[] = [];

    // Configure Winston transports based on options
    if (options.winston?.console !== false) {
      winstonTransports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(
              ({ timestamp, level, message, correlationId, ...meta }) => {
                return `[${timestamp}] ${level}: [${correlationId || 'no-correlation'}] ${message} ${
                  Object.keys(meta).length ? JSON.stringify(meta) : ''
                }`;
              },
            ),
          ),
        }),
      );
    }

    if (options.winston?.file?.enabled) {
      // Error logs
      winstonTransports.push(
        new DailyRotateFile({
          filename: options.winston.file.errorPath || 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: options.winston.file.maxSize || '20m',
          maxFiles: options.winston.file.maxFiles || '14d',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      );

      // Combined logs
      winstonTransports.push(
        new DailyRotateFile({
          filename:
            options.winston.file.combinedPath || 'logs/combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: options.winston.file.maxSize || '20m',
          maxFiles: options.winston.file.maxFiles || '14d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      );
    }

    return {
      global: true,
      module: LoggingModule,
      imports: [
        WinstonModule.forRoot({
          transports: winstonTransports,
        }),
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ['.env.local', '.env'],
          validationSchema: Joi.object({
            DEBUG_MODE: Joi.boolean().default(true),
          }),
        }),
      ],
      providers: [
        PrismaService,
        LoggerService,
        DebugUtil,
        DatabaseLoggerService,
        CorrelationMiddleware,
        CorrelationService,
      ],
      exports: [
        LoggerService,
        DebugUtil,
        DatabaseLoggerService,
        CorrelationMiddleware,
        CorrelationService,
      ],
    };
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationMiddleware).forRoutes('*');
  }
}
