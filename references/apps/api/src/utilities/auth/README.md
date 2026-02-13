#### Auth Module

```typescript
// import auth module
import { AuthModule } from 'path';

// Add the module to the imports array of your main module
@Module({
  imports: [AuthModule],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ApiKeyGuard },
    { provide: APP_GUARD, useClass: AccessTokenGuard },
  ],
})
export class AppModule {}

// env variables
AUTHORIZER_URL = 'https://authorizer.leocode.io';
AUTHORIZER_API_KEY = 'your_api_key';
X_API_KEY = 'your_api_key';
```
