import { Module } from '@nestjs/common';
import { TestController } from './presentation/controllers/test.controller';
import { TestService } from './application/services/test.service';
import { ITestPort } from './domain/ports/test.port';
import { TestAdapter } from './infrastructure/adaptors/test.adaptor';
import { PrismaService } from '../../utilities/database/prisma.service';

@Module({
  imports: [],
  controllers: [TestController],
  providers: [
    PrismaService,
    TestService,
    {
      provide: ITestPort,
      useClass: TestAdapter,
    },
  ],
})
export class TestModule {}
