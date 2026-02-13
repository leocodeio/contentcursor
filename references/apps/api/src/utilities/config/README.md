#### Config Module

**Dependencies**

To use this package, you need to install the following dependencies:

- `@nestjs/config`
- `@nestjs/common`
- `@nestjs/core`
- `reflect-metadata`
- `rxjs`

You can install them using your preferred package manager. For example, with pnpm:

```bash
pnpm add @nestjs/config @nestjs/common @nestjs/core @nestjs/swaggger helmet express-basic-auth joi class-validator class-transformer
```

```typescript
// import helath module
import { AppConfigModule, AppConfigService } from 'path';

// Add the module to the imports array of your main module
@Module({
  imports: [AppConfigModule],
  controllers: [AppController],
  providers: [AppService, AppConfigService],
})
export class AppModule {}
```
