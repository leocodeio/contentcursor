import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as basicAuth from 'express-basic-auth';

const configService = new ConfigService();
export class BootstrapConfig {
  constructor() {}

  setupSwagger = (app: INestApplication) => {
    const swaggerProtection = {
      route: configService.get('SWAGGER_ROUTE'),
      password: configService.get('SWAGGER_PASSWORD'),
    };

    app.use(
      [swaggerProtection.route],
      basicAuth({
        challenge: true,
        users: {
          admin: swaggerProtection.password,
        },
      }),
    );

    const config = new DocumentBuilder()
      .setTitle(configService.get<string>('APP_NAME') || 'Default App Name')
      .setDescription(
        `API for managing ${configService.get<string>('APP_NAME') || 'Default App Name'}s`,
      )
      .setVersion('1.0')
      .addApiKey(
        {
          type: 'apiKey',
          name: 'x-api-key',
          in: 'header',
          description: 'API key for authentication',
        },
        'x-api-key',
      )
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Enter your Bearer token',
          in: 'header',
        },
        'Authorization',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(swaggerProtection.route, app, document);
  };

  setupHelmet = (app: INestApplication) => {
    app.use(helmet());
    app.use(helmet.noSniff());
    app.use(helmet.frameguard({ action: 'deny' }));
    app.use(helmet.contentSecurityPolicy());
  };

  setupCors = (app: INestApplication) => {
    const corsOptions = {
      origin:
        configService.get('CORS_ORIGIN') === 'true' ||
        !configService.get('CORS_ORIGIN')
          ? '*'
          : configService.get('CORS_ORIGIN'),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    };
    app.enableCors(corsOptions);
  };
}
