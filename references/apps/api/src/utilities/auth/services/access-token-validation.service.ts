import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import { IUserContext } from '../interfaces/user-context.interface';
// import { JwtService } from '@nestjs/jwt';
// import { TokenManagementService } from './token-management.service';
import { CorrelationService } from 'src/utilities/correlation/correlation.service';
// import { DebugUtil } from 'src/utilities/logging/utils/debug.util';

// interface DecodedToken {
//   session: {
//     id: 'string';
//     token: 'string';
//     ipAddress: 'string';
//     userAgent: 'string';
//     userId: 'string';
//   };
//   user: {
//     id: 'string';
//   };
// }

interface userContext {
  session: {
    id: 'string';
    token: 'string';
    ipAddress: 'string';
    userAgent: 'string';
    userId: 'string';
  };
  user: { role: string };
}
@Injectable()
export class AccessTokenValidationService {
  private readonly logger = new Logger(AccessTokenValidationService.name);
  private accessTokenValidationUrl: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly correlationService: CorrelationService,
    // private readonly jwtService: JwtService,
    // private readonly debugUtil: DebugUtil,
    // private readonly tokenManagementService: TokenManagementService,
  ) {
    this.logger.log('AccessTokenValidationService constructor called');
    this.accessTokenValidationUrl =
      this.configService.get<string>('ACCESS_TOKEN_VALIDATION_URL') ||
      'http://localhost:5173/api/auth/get-session';
    this.logger.log(
      `Access token validation URL: ${this.accessTokenValidationUrl}`,
    );
  }

  async validateToken(
    token: string,
    // baseUrl: string,
    // baseMethod: string,
  ): Promise<boolean | userContext> {
    this.logger.log('useGuard called for token validation');
    // const validationPayload = {
    //   channel: 'api',
    //   clientId: this.configService.get('CLUSTER_CLIENT_ID'),
    // };
    // this.logger.log(
    //   'Generating origin base access token',
    //   token,
    //   baseUrl,
    //   baseMethod,
    // );
    // const originBaseAccessToken =
    //   await this.tokenManagementService.generateOriginBaseAccessToken(
    //     token,
    //     baseUrl,
    //     baseMethod,
    //   );
    this.logger.log('Origin base access token generated');
    const correlationId = this.correlationService.getCorrelationId();
    // this.logger.log('oba', originBaseAccessToken);
    try {
      const validationResponse = await fetch(this.accessTokenValidationUrl, {
        headers: {
          // 'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          // 'x-api-key': this.configService.get('AUTHORIZER_API_KEY')!,
          // 'x-correlation-id': correlationId,
        },
        // body: JSON.stringify(validationPayload),
      });
      this.logger.log('Validation response received', validationResponse);
      const validationResponseData: any = await validationResponse.json();
      this.logger.log('Validation response data', validationResponseData);
      // return validationResponseData.data.valid;
      if (!validationResponseData) {
        return false;
      }
      return validationResponseData;
    } catch (error: any) {
      this.logger.error('Error validating token', error);
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
  }

  // /**
  //  * Extracts user context from the token
  //  * @param token The JWT token
  //  * @returns IUserContext
  //  */
  // public extractUserContext(token: string): IUserContext {
  //   const decodedToken = this.jwtService.decode(token) as DecodedToken;

  //   if (!decodedToken || !decodedToken.sub || !decodedToken.sessionId) {
  //     this.logger.error('Invalid token structure:', {
  //       hasToken: !!decodedToken,
  //       hasUserId: !!decodedToken?.sub,
  //       hasSessionId: !!decodedToken?.sessionId,
  //     });
  //     throw new HttpException(
  //       'Missing required token claims',
  //       HttpStatus.UNAUTHORIZED,
  //     );
  //   }

  //   const userContext = {
  //     userId: decodedToken.sub,
  //     sessionId: decodedToken.sessionId,
  //   };

  //   this.debugUtil.debug(
  //     this.logger,
  //     'Successfully extracted user context',
  //     userContext,
  //   );
  //   return userContext;
  // }
}
