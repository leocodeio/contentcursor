import { Controller, Get } from '@nestjs/common';
import { TestService } from '../../application/services/test.service';
import { ApiSecurity } from '@nestjs/swagger';
import { PassAccessTokenCheck } from '../../../../utilities/auth/decorator/auth/passAccessTokenCheck';

@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Get()
  @ApiSecurity('x-api-key')
  // @PassAccessTokenCheck()
  @ApiSecurity('Authorization')
  async getTest(): Promise<any> {
    return this.testService.getTest();
  }
}
