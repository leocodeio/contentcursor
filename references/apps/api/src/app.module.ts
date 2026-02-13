import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestModule } from './modules/test/test.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './utilities/database/prisma.service';
import { PerformanceInterceptor } from './utilities/performance/performance.interceptor';
import { ResponseInterceptor } from './utilities/response/response.interceptor';
import { LoggingInterceptor } from './utilities/logging/utils/logging.interceptor';
import { LoggingModule } from './utilities/logging/logging.module';
import * as Joi from 'joi';
import { HealthModule } from './utilities/health/health.module';
import { AppConfigModule } from './utilities/config/config.module';
import { AuthModule } from './utilities/auth/auth.module';
import { PrometheusService } from './utilities/performance/prometheus.service';
import { YtAuthModule } from './modules/yt_int/modules/youtube/yt-auth.module';
import { YtCreatorModule } from './modules/yt_int/modules/creator/yt-creator.module';
import { MediaModule } from './modules/media/modules/media/media.module';
import { S3Module } from './modules/media/libs/s3/s3.module';
import { MapModule } from './modules/map/map.module';
import { FolderModule } from './modules/folder/folder.module';
import { ContributeModule } from './modules/contribute/contribute.module';
import { APP_GUARD } from '@nestjs/core';
import { ApiKeyGuard } from './utilities/auth/guards/api/api-key.guard';
import { IpRateLimitGuard } from './utilities/auth/guards/rate-limit/rate-limit.guard';
import { AccessTokenGuard } from './utilities/auth/guards/auth/access-token.guard';
import { RolesGuard } from './utilities/auth/guards/role/role.gurad';
import { GcpBucketModule } from './modules/media/libs/gcp-bucket/gcp-bucket.module';
import { DriveModule } from './modules/media/libs/drive/drive.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      // Load environment variables - update with the path to your .env file
      envFilePath: ['.env.local', '.env'],
      // Add social media configuration variables
      validationSchema: Joi.object({
        // Existing validation

        // APP PORT
        PORT: Joi.number().default(3000).required(),

        // // DATABASE CONFIGURATION
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
          .default('hhttp://localhost:5173/api/auth/get-session')
          .required(),
        AUTHORIZER_API_KEY: Joi.string().default('validkey1').required(),
        CLUSTER_CLIENT_ID: Joi.string().default('validclient1').required(),

        // validation
        // ACCESS_TOKEN_SECRET: Joi.string()
        //   .default('access-token-secret')
        //   .required(),
        // REFRESH_TOKEN_SECRET: Joi.string()
        //   .default('refresh-token-secret')
        //   .required(),

        // // jwt
        // // access token
        // JWT_SECRET: Joi.string()
        //   .default('this-is-access-token-secret')
        //   .required(),
        // JWT_EXPIRES_IN: Joi.string().default('30m').required(),

        // // refresh token
        // JWT_REFRESH_SECRET: Joi.string()
        //   .default('this-is-refresh-token-secret')
        //   .required(),
        // JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d').required(),

        // yt
        CLIENT_ID: Joi.string()
          .default('453113812801-n1nh8aoogleusercontent.com')
          .required(),
        PROJECT_ID: Joi.string().default('skilled-compa-464715-b2').required(),
        AUTH_URI: Joi.string()
          .default('https://accounts.google.com/o/oauth2/auth')
          .required(),
        TOKEN_URI: Joi.string()
          .default('https://oauth2.googleapis.com/token')
          .required(),
        AUTH_PROVIDER_X509_CERT_URL: Joi.string()
          .default('https://www.googleapis.com/oauth2/v1/certs')
          .required(),
        CLIENT_SECRET: Joi.string().default('GOCSPX-9owvL9K7X72').required(),
        REDIRECT_URI: Joi.string()
          .default('http://localhost:5173/api/auth/yt/callback')
          .required(),

        // aws
        AWS_REGION: Joi.string().default('us-east-1').required(),
        AWS_ACCESS_KEY_ID: Joi.string().default('test').required(),
        AWS_SECRET_ACCESS_KEY: Joi.string().default('test').required(),
        AWS_S3_BUCKET_NAME: Joi.string().default('my-local-bucket').required(),
        AWS_S3_ENDPOINT: Joi.string()
          .default('http://localhost:4566')
          .required(),
        AWS_S3_FOLDER_NAME: Joi.string().default('media').required(),

        // gcp
        GCP_PROJECT_ID: Joi.string()
          .default('skilled-compass-464715-b2')
          .required(),
        GCP_PRIVATE_KEY_ID: Joi.string()
          .default('a2e06d96690b4f0d421c4dd0ada558096140e0ed')
          .required(),
        GCP_CLIENT_EMAIL: Joi.string()
          .default(
            'my-storage-accessor@skilled-compass-464715-b2.iam.gserviceaccount.com',
          )
          .required(),
        GCP_CLIENT_ID: Joi.string().default('111655231339309664097').required(),
        GCP_PRIVATE_KEY_B64: Joi.string().required(),
        GCP_BUCKET_LOCATION: Joi.string()
          .default('asia-south1 (Mumbai)')
          .required(),

        // drive
        GOOGLE_CLIENT_ID: Joi.string().required(),
        GOOGLE_CLIENT_SECRET: Joi.string().required(),
        GOOGLE_REDIRECT_URI: Joi.string().required(),
        GOOGLE_REFRESH_TOKEN: Joi.string().required(),

        // media
        DRIVE_ROOT_FOLDER_NAME: Joi.string().default('spectral').required(),
      }),
    }),
    AppConfigModule,

    // util modules
    // logging
    LoggingModule.forRoot({
      winston: {
        console: true,
        file: {
          enabled: true,
        },
      },
    }),
    // health
    HealthModule,
    // auth
    AuthModule,

    // user defined modules
    YtAuthModule,
    YtCreatorModule,
    MapModule,
    FolderModule,
    ContributeModule,
    // S3Module,
    // GcpBucketModule,
    DriveModule,
    MediaModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // db service
    PrismaService,

    // interceptors
    PrometheusService,
    {
      provide: 'APP_INTERCEPTOR',
      useClass: PerformanceInterceptor,
    },
    {
      provide: 'APP_INTERCEPTOR',
      useClass: ResponseInterceptor,
    },
    {
      provide: 'APP_INTERCEPTOR',
      useClass: LoggingInterceptor,
    },
    // guard
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
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
