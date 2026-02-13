# Role Guard

The Role Guard is a NestJS guard that checks if the user has the required roles to access a specific route. It uses the `@nestjs/passport` package to handle authentication and authorization.

## Implementation Details

1. **Guard Creation**: The guard is created by implementing the `CanActivate` interface from `@nestjs/common`.

2. **Role Extraction**: The guard extracts the user's roles from the request object. This is typically done by using a JWT strategy that attaches the user information to the request.

3. **Role Validation**: The guard checks if the user has the required roles to access the route. If the user does not have the required roles, the guard throws an `UnauthorizedException`.

4. **Usage**: The guard can be applied to specific routes or controllers using the `@UseGuards` decorator.

## Example

```typescript
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

    const hasRole = () =>
      user.roles.some((role) => requiredRoles.includes(role));
    if (!user || !hasRole()) {
      throw new UnauthorizedException('You do not have the required roles');
    }
    return true;
  }
}
```

## Conclusion

The Role Guard is a powerful tool for implementing role-based access control in a NestJS application. By leveraging the `@nestjs/passport` package and the `CanActivate` interface, developers can easily protect their routes and ensure that only authorized users can access certain resources.
