import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { YtAuthService } from './application/services/yt-auth.service';
import { YtAuthController } from './presentation/controllers/yt-auth.controller';
import { IYtCreatorPort } from '../creator/domain/ports/yt-creator.repository';
import { YtCreatorRepository } from '../creator/infrastructure/adapters/yt-creator.repository';
import { YtCreatorModule } from '../creator/yt-creator.module';
import { MulterModule } from '@nestjs/platform-express';
import { PrismaService } from 'src/utilities/database/prisma.service';
import { HttpModule } from '@nestjs/axios';
import { DriveService } from 'src/modules/media/libs/drive/application/services/drive.service';

@Module({
  imports: [
    ConfigModule,
    YtCreatorModule,
    MulterModule.register({
      limits: {
        fileSize: 1000 * 1024 * 1024, // 1GB limit
      },
    }),
    HttpModule,
  ],
  providers: [
    // prisma service
    PrismaService,
    // YouTube authentication service
    YtAuthService,
    {
      provide: IYtCreatorPort,
      useClass: YtCreatorRepository,
    },
    DriveService,
  ],
  controllers: [YtAuthController],
  exports: [YtAuthService],
})
export class YtAuthModule {}
