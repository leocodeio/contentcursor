// utils/logging/logger.service.ts
import { Injectable, Scope } from '@nestjs/common';
import { WinstonLogger, WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject } from '@nestjs/common';
import { Logger } from 'winston';
import { Request } from 'express';
import { CorrelationService } from '../../correlation/correlation.service';
import { DatabaseLoggerService } from './database-logger.service';
import { ILogEntry } from '../utils/log-entry.interface';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService extends WinstonLogger {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) logger: Logger,
    private readonly correlationService: CorrelationService,
    private readonly databaseLogger: DatabaseLoggerService,
  ) {
    super(logger);
    this.setContext('Application');
  }

  private async logToDatabase(logEntry: ILogEntry) {
    await this.databaseLogger.saveLog(logEntry);
  }

  private addMetadata(metadata: any = {}) {
    return {
      correlationId: this.correlationService.getCorrelationId(),
      // Remove timestamp since Prisma uses createdAt automatically
      ...metadata,
    };
  }

  async log(message: any, context?: any) {
    const metadata = this.addMetadata({ context });
    super.log(message, metadata);
    await this.logToDatabase({
      level: 'info',
      message: typeof message === 'string' ? message : JSON.stringify(message),
      ...metadata,
    });
  }

  async error(message: any, trace?: any, context?: any) {
    const metadata = this.addMetadata({ context, trace });
    super.error(message, trace, metadata);
    await this.logToDatabase({
      level: 'error',
      message: typeof message === 'string' ? message : JSON.stringify(message),
      error: trace,
      ...metadata,
    });
  }

  warn(message: any, context?: any) {
    super.warn(message, this.addMetadata({ context }));
  }

  debug(message: any, context?: any) {
    super.debug?.(message, this.addMetadata({ context }));
  }

  verbose(message: any, context?: any) {
    super.verbose?.(message, this.addMetadata({ context }));
  }

  logRequest(req: Request, message?: string) {
    const requestData = {
      method: req.method,
      url: req.url,
      headers: req.headers,
      query: req.query,
      body: req.body,
    };

    this.log({
      message: message || 'Incoming request',
      ...requestData,
    });
  }

  logResponse(req: Request, res: any, responseTime: number) {
    this.log({
      message: 'Response sent',
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
    });
  }

  setLogContext(context: string) {
    this.setContext(context);
  }
}
