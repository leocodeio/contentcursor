import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService } from './config.service';
import * as configurations from './configuration';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: Object.values(configurations),
      // Load environment variables - update with the path to your .env file
      envFilePath: ['.env.local', '.env'],
      // Add environment variable validation
      validationSchema: Joi.object({
        // Application Configuration
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3000).required(),

        // Database Configuration
        // DB_HOST: Joi.string().required(),
        // DB_PORT: Joi.number().default(5432),
        // DB_USERNAME: Joi.string().required(),
        // DB_PASSWORD: Joi.string().required(),
        // DB_DATABASE: Joi.string().required(),
        // DB_SCHEMA: Joi.string().required(),

        // SWAGGER_ROUTE and APP DETAILS

        SWAGGER_ROUTE: Joi.string().default('/api').required(),
        SWAGGER_PASSWORD: Joi.string().default('admin').required(),
        APP_NAME: Joi.string().default('app').required(),
      }),
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
