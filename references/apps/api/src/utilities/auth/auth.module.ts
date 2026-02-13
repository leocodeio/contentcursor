// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

// Guards
import { ApiKeyGuard } from '../auth/guards/api/api-key.guard';
import { AccessTokenGuard } from './guards/auth/access-token.guard';
import { IpRateLimitGuard } from '../auth/guards/rate-limit/rate-limit.guard';

// Services
import { AccessTokenValidationService } from './services/access-token-validation.service';
// import { TokenManagementService } from './services/token-management.service';

import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { JwtModule } from '@nestjs/jwt';
import { LoggingModule } from '../logging/logging.module';
import { LoggerService } from '../logging/services/logger.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      // Load environment variables - update with the path to your .env file
      envFilePath: ['.env.local', '.env'],
      // Add social media configuration variables
      validationSchema: Joi.object({
        // Existing validation

        // APP PORT
        PORT: Joi.number().default(3000).required(),

        // DATABASE CONFIGURATION
        // DB_HOST: Joi.string().default('localhost').required(),
        // DB_USERNAME: Joi.string().default('postgres').required(),
        // DB_PASSWORD: Joi.string().default('postgres').required(),
        // DB_DATABASE: Joi.string().default('postgres').required(),
        // DB_SCHEMA: Joi.string().default('test').required(),
        // DB_PORT: Joi.number().default(5432).required(),

        //rate limit
        RATE_LIMIT_POINTS: Joi.number().default(100).required(),
        RATE_LIMIT_DURATION: Joi.number()
          .default(60 * 60)
          .required(), // Per hour
        RATE_LIMIT_BLOCK_DURATION: Joi.number()
          .default(5 * 60)
          .required(), // 5min block if exceeded

        // guards
        // apikey guard
        APP_KEY: Joi.string().default('apikey').required(),
        // acess token guard
        ACCESS_TOKEN_VALIDATION_URL: Joi.string()
          .default('http://localhost:3000/validate')
          .required(),
        AUTHORIZER_API_KEY: Joi.string().default('validkey1').required(),
        CLUSTER_CLIENT_ID: Joi.string().default('validclient1').required(),
      }),
    }),
    LoggingModule.forRoot({
      winston: {
        console: true,
      },
    }),
  ],
  providers: [
    LoggerService,
    // Services
    AccessTokenValidationService,
    // TokenManagementService,

    // Guards
    ApiKeyGuard,
    AccessTokenGuard,
    IpRateLimitGuard,
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
    {
      provide: APP_GUARD,
      useClass: IpRateLimitGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
  ],
  exports: [
    // Services
    AccessTokenValidationService,
    // TokenManagementService,
    // Guards
    ApiKeyGuard,
    AccessTokenGuard,
    IpRateLimitGuard,
  ],
})
export class AuthModule {}
