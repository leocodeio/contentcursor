import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException('User not found in request');
    }
    console.log(user, 'checking roels');
    console.log(
      'Required roles:',
      requiredRoles,
      requiredRoles.includes(user.role),
    );
    const hasRole = () => user.role && requiredRoles.includes(user.role);
    if (!hasRole()) {
      throw new UnauthorizedException('You do not have the required roles');
    }
    return true;
  }
}
