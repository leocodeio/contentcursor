import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccessTokenValidationService } from '../../services/access-token-validation.service';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenValidationService: AccessTokenValidationService,
  ) {}

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );

    if (isPublic) {
      return true;
    }
    console.log('hello');
    const isPassAccessTokenCheck = this.reflector.get<boolean>(
      'passAccessTokenCheck',
      context.getHandler(),
    );
    console.log('isPassAccessTokenCheck', isPassAccessTokenCheck);
    if (isPassAccessTokenCheck) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Bearer token is required');
    }

    // [TODO] - add a dec to skip this if not needed
    const protocol = request.protocol;
    const host = request.get('host');
    const originalUrl = request.originalUrl;
    const fullUrl = `${protocol}://${host}${originalUrl}`;

    const baseMethod = request.method;
    console.log('Reqeuest originated from', fullUrl, 'with method', baseMethod);
    try {
      const isValid = await this.accessTokenValidationService.validateToken(
        token,
        // fullUrl,
        // baseMethod.toLowerCase(),
      );

      if (!isValid) {
        throw new UnauthorizedException(
          'Invalid token or token validation failed',
        );
      }
      // create a new user context object

      const userContext = typeof isValid !== 'boolean' ? isValid : undefined;
      // this.accessTokenValidationService.extractUserContext(token);
      request.user = userContext?.user;
      request.sessionId = userContext?.session.id;
    } catch (error: any) {
      throw new UnauthorizedException(
        error.message || 'Internal error at auth server while validating token',
      );
    }

    // create a new user context object
    // const userContext =
    //   this.accessTokenValidationService.extractUserContext(token);
    // request.user = userContext;
    // request.userId = userContext.userId;

    return true;
  }
}
