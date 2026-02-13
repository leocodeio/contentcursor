import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get databaseConfig() {
    return {
      type: 'postgres' as const,
      host: this.configService.get<string>('DB_HOST'),
      port: parseInt(this.configService.get<string>('DB_PORT') || '5432', 10),
      username: this.configService.get<string>('DB_USERNAME'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_DATABASE'),
      schema: this.configService.get<string>('DB_SCHEMA'),
      ssl: {
        rejectUnauthorized: false,
      },
    };
  }

  get appConfig() {
    return {
      port: parseInt(this.configService.get<string>('PORT') || '3000', 10),
      environment: this.configService.get<string>('NODE_ENV') || 'development',
    };
  }
}
