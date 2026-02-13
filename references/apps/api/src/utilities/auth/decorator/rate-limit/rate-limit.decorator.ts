import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'NoRateLimit';
export const NoRateLimit = () => SetMetadata(RATE_LIMIT_KEY, true);
