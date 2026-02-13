import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SensitiveField } from './sensitive-fields.enum';

@Injectable()
export class DebugUtil {
  private isDebugMode: boolean;
  constructor(configService: ConfigService) {
    this.isDebugMode = configService.get<string>('DEBUG_MODE') === 'true';
  }

  private maskSensitiveData(data: any): any {
    if (typeof data === 'string') {
      // Check if the string contains any sensitive field values
      const containsSensitive = Object.values(SensitiveField).some((field) =>
        data.toLowerCase().includes(field.toLowerCase()),
      );
      if (containsSensitive && data.length > 20) {
        return `${data.substr(0, 8)}...${data.substr(-8)}`;
      }
    } else if (typeof data === 'object' && data !== null) {
      const maskedObj = { ...data };
      for (const key in maskedObj) {
        // Check if the key is a sensitive field
        const isSensitiveKey = Object.values(SensitiveField).some((field) =>
          key.toLowerCase().includes(field.toLowerCase()),
        );
        if (isSensitiveKey && typeof maskedObj[key] === 'string') {
          maskedObj[key] = this.maskSensitiveData(maskedObj[key]);
        } else {
          maskedObj[key] = this.maskSensitiveData(maskedObj[key]);
        }
      }
      return maskedObj;
    }
    return data;
  }

  debug(logger: any, message: string, context?: any): void {
    if (this.isDebugMode) {
      if (context) {
        const maskedContext = this.maskSensitiveData(context);
        logger.debug(`${message}`, maskedContext);
      } else {
        logger.debug(message);
      }
    }
  }
}
