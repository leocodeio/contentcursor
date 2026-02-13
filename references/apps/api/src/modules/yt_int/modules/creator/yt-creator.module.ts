import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { YtCreatorService } from './application/services/yt-creator.service';
import { YtCreatorController } from './presentation/controllers/yt-creator.controller';
import { YtCreatorRepository } from './infrastructure/adapters/yt-creator.repository';
import { IYtCreatorPort } from './domain/ports/yt-creator.repository';
import { PrismaService } from 'src/utilities/database/prisma.service';

@Module({
  imports: [ConfigModule],
  providers: [
    // prisma service
    PrismaService,
    // yt realted services
    YtCreatorService,
    {
      provide: IYtCreatorPort,
      useClass: YtCreatorRepository,
    },
  ],
  controllers: [YtCreatorController],
  exports: [YtCreatorService],
})
export class YtCreatorModule {}
