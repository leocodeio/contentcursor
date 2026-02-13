import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { RATE_LIMIT_KEY } from '../../decorator/rate-limit/rate-limit.decorator';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IpRateLimitGuard implements CanActivate {
  private limiter: RateLimiterMemory;

  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {
    this.limiter = new RateLimiterMemory({
      points: this.configService.get<number>('RATE_LIMIT_POINTS') || 100, // Max requests
      duration:
        this.configService.get<number>('RATE_LIMIT_DURATION') || 60 * 60, // Per hour
      blockDuration:
        this.configService.get<number>('RATE_LIMIT_BLOCK_DURATION') || 5 * 60, // 5min block if exceeded
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // If the route is not rate limited, return true
    const isNotRateLimited = this.reflector.get(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );
    if (isNotRateLimited) {
      return true;
    }

    // If the route is rate limited, check the rate limit
    const req = context.switchToHttp().getRequest();
    const ip = req.ip;

    try {
      await this.limiter.consume(ip);
      return true;
    } catch {
      throw new HttpException('Too Many Requests', 429);
    }
  }
}
