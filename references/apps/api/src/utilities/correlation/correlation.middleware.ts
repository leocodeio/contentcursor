import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CorrelationService } from './correlation.service';

@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  constructor(private readonly correlationService: CorrelationService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const correlationId =
      (req.headers['x-correlation-id'] as string) ||
      this.correlationService.generateCorrelationId(
        req.headers['x-correlation-id'] as string,
      );

    // Add correlation ID to response headers
    res.setHeader('x-correlation-id', correlationId);

    // Store correlation ID in request object for later use
    req['correlationId'] = correlationId;

    // Run the rest of the request in the context of this correlation ID
    this.correlationService.run(correlationId, () => {
      next();
    });
  }
}
