import { SetMetadata } from '@nestjs/common';

export const PASS_ACCESS_TOKEN_CHECK_KEY = 'passAccessTokenCheck';
export const PassAccessTokenCheck = () =>
  SetMetadata(PASS_ACCESS_TOKEN_CHECK_KEY, true);
